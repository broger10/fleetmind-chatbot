import { streamText, generateText } from 'ai';
import { managerModel, agentModel } from '@/lib/ai-config';
import { loadKB } from '@/lib/kb-loader';
import { MANAGER_SYSTEM_PROMPT } from '@/prompts/manager';
import { DISPATCH_SYSTEM_PROMPT } from '@/prompts/dispatch';
import { COMPLIANCE_SYSTEM_PROMPT } from '@/prompts/compliance';
import { SUPPORT_SYSTEM_PROMPT } from '@/prompts/support';
import type { AgentType, ManagerResponse } from '@/lib/types';
import { MAX_HISTORY_LENGTH, MAX_MESSAGE_LENGTH, AGENT_NAMES, AGENT_COLORS } from '@/lib/types';
import { fetchFleetDataContext } from '@/lib/fleet-data';

const AGENT_PROMPTS: Record<AgentType, string> = {
  dispatch: DISPATCH_SYSTEM_PROMPT,
  compliance: COMPLIANCE_SYSTEM_PROMPT,
  support: SUPPORT_SYSTEM_PROMPT,
};

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

interface Attachment {
  name: string;
  type: string;
  base64?: string;
}

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
  agent?: AgentType;
  attachments?: Attachment[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCoreMessages(messages: IncomingMessage[]): any[] {
  return messages.map(m => {
    // If message has image attachments, build multimodal content
    if (m.role === 'user' && m.attachments && m.attachments.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: any[] = [];

      for (const att of m.attachments) {
        if (att.type.startsWith('image/') && att.base64) {
          // Extract the actual base64 data and media type
          const match = att.base64.match(/^data:(image\/[^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              type: 'image',
              image: Buffer.from(match[2], 'base64'),
              mimeType: match[1],
            });
          }
        } else if (att.base64) {
          // Text-based files: decode and include as text
          try {
            const raw = att.base64.split(',')[1];
            const decoded = Buffer.from(raw, 'base64').toString('utf-8');
            parts.push({
              type: 'text',
              text: `[File: ${att.name}]\n${decoded}`,
            });
          } catch {
            parts.push({
              type: 'text',
              text: `[File: ${att.name} — contenuto non leggibile]`,
            });
          }
        }
      }

      if (m.content) {
        parts.push({ type: 'text', text: m.content });
      }

      return { role: 'user' as const, content: parts };
    }

    return { role: m.role as 'user' | 'assistant', content: m.content };
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, currentAgent } = body as {
      messages: IncomingMessage[];
      currentAgent: AgentType | null;
    };

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return new Response('Invalid request', { status: 400 });
    }
    if (lastMessage.content && lastMessage.content.length > MAX_MESSAGE_LENGTH) {
      return new Response('Messaggio troppo lungo. Massimo 2000 caratteri.', { status: 400 });
    }

    const truncatedMessages = messages.slice(-MAX_HISTORY_LENGTH);

    // --- STEP 1: Manager classification ---
    const managerInput = JSON.stringify({
      message: lastMessage.content || '[file/immagine allegata]',
      current_agent: currentAgent,
      history: truncatedMessages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content || '[allegato]',
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
      console.error('Manager fallback:', selectedAgent);
    }

    // --- STEP 2: Load KB + live data ---
    const kbs = getKBs();
    let fleetData = '';
    try {
      fleetData = await fetchFleetDataContext();
    } catch {
      console.error('Fleet data fetch failed, continuing without live data');
    }

    const systemMessage = `${AGENT_PROMPTS[selectedAgent]}

---
## SHARED KNOWLEDGE BASE
${kbs.shared}

---
## VERTICAL KNOWLEDGE BASE (${selectedAgent.toUpperCase()})
${kbs[selectedAgent]}

---
${fleetData}`;

    // --- STEP 3: Build multimodal messages ---
    const coreMessages = buildCoreMessages(truncatedMessages);

    // --- STEP 4: Stream response ---
    const result = streamText({
      model: agentModel,
      system: systemMessage,
      messages: coreMessages,
    });

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
      JSON.stringify({ error: 'Si e verificato un errore. Riprova tra qualche secondo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
