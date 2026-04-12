import { streamText, generateText } from 'ai';
import { managerModel, agentModel } from '@/lib/ai-config';
import { loadKB } from '@/lib/kb-loader';
import { MANAGER_SYSTEM_PROMPT } from '@/prompts/manager';
import { DISPATCH_SYSTEM_PROMPT } from '@/prompts/dispatch';
import { COMPLIANCE_SYSTEM_PROMPT } from '@/prompts/compliance';
import { SUPPORT_SYSTEM_PROMPT } from '@/prompts/support';
import type { AgentType, ManagerResponse } from '@/lib/types';
import { MAX_HISTORY_LENGTH, MAX_MESSAGE_LENGTH, AGENT_NAMES, AGENT_COLORS } from '@/lib/types';

// Map agent type to system prompt
const AGENT_PROMPTS: Record<AgentType, string> = {
  dispatch: DISPATCH_SYSTEM_PROMPT,
  compliance: COMPLIANCE_SYSTEM_PROMPT,
  support: SUPPORT_SYSTEM_PROMPT,
};

// Load all KBs at startup (cached in memory)
let kbCache: Record<string, string> | null = null;

function getKBs() {
  if (!kbCache) {
    kbCache = {
      shared: loadKB('shared-kb.md'),
      dispatch: loadKB('dispatch-kb.md'),
      compliance: loadKB('compliance-kb.md'),
      support: loadKB('support-kb.md'),
    };
  }
  return kbCache;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, currentAgent } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string; agent?: AgentType }>;
      currentAgent: AgentType | null;
    };

    // Validate input
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return new Response('Invalid request: last message must be from user', { status: 400 });
    }
    if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
      return new Response('Messaggio troppo lungo. Massimo 2000 caratteri.', { status: 400 });
    }

    // Truncate history to last N messages
    const truncatedMessages = messages.slice(-MAX_HISTORY_LENGTH);

    // --- STEP 1: Manager classifies intent ---
    const managerInput = JSON.stringify({
      message: lastMessage.content,
      current_agent: currentAgent,
      history: truncatedMessages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content,
        ...(m.agent ? { agent: m.agent } : {}),
      })),
    });

    let selectedAgent: AgentType = currentAgent || 'dispatch';

    try {
      const managerResult = await generateText({
        model: managerModel,
        system: MANAGER_SYSTEM_PROMPT,
        prompt: managerInput,
      });

      const parsed = JSON.parse(managerResult.text) as ManagerResponse;
      if (['dispatch', 'compliance', 'support'].includes(parsed.agent)) {
        selectedAgent = parsed.agent;
      }
    } catch {
      // If Manager fails, keep current agent (fallback)
      console.error('Manager classification failed, using fallback:', selectedAgent);
    }

    // --- STEP 2: Load KB for selected agent ---
    const kbs = getKBs();
    const sharedKB = kbs.shared;
    const verticalKB = kbs[selectedAgent];

    // Build system message with prompt + KBs
    const systemMessage = `${AGENT_PROMPTS[selectedAgent]}

---
## SHARED KNOWLEDGE BASE
${sharedKB}

---
## VERTICAL KNOWLEDGE BASE (${selectedAgent.toUpperCase()})
${verticalKB}`;

    // --- STEP 3: Agent generates response with streaming ---
    const result = streamText({
      model: agentModel,
      system: systemMessage,
      messages: truncatedMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    // Return streaming response with agent metadata in headers
    return result.toTextStreamResponse({
      headers: {
        'X-Agent-Type': selectedAgent,
        'X-Agent-Name': AGENT_NAMES[selectedAgent],
        'X-Agent-Color': AGENT_COLORS[selectedAgent],
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Si è verificato un errore. Riprova tra qualche secondo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
