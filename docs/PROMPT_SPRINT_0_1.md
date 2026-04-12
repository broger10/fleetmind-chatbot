# Sprint 0 & 1 -- Execution Prompts

> **Come usare:** Copia e incolla questi prompt nell'IDE (AntiGravity / Claude Code) per eseguire ogni step. L'IDE ha gia le IDE Rules caricate. Fornisci anche il Master Brief come contesto.

---

## Sprint 0 -- Pre-flight Check

### Prompt per Step 0.1-0.4

```
Read the project documentation in the docs/ folder. Then verify:

1. Run `npm run dev` and confirm the Next.js dev server starts without errors
2. Check that `.env.local` exists with ANTHROPIC_API_KEY and is listed in `.gitignore`
3. Confirm the folder structure matches the IDE Rules (knowledge-base/, prompts/, lib/, components/)
4. Tell me: what is this project, what are the 4 agents, what stack do we use?

Do NOT write any code yet. Just verify and report.
```

---

## Sprint 1 -- Single Agent Working (Dispatch Only)

### Prompt for Steps 1.1-1.3: Create foundation files

```
Execute Sprint 1, Steps 1.1 through 1.3.

Step 1.1: Create src/lib/types.ts with the following types:
- AgentType = 'dispatch' | 'compliance' | 'support'
- AGENT_COLORS record (dispatch: #3B82F6, compliance: #F59E0B, support: #22C55E)
- AGENT_NAMES record (dispatch: FleetMind Dispatch, compliance: FleetMind Compliance, support: FleetMind Support)
- ManagerResponse interface (agent: AgentType, reason: string)
- ChatMessage interface (id, role, content, agent?)
- KB_FILES record mapping agent types to .md filenames (shared-kb.md, dispatch-kb.md, compliance-kb.md, support-kb.md)
- Constants: MAX_HISTORY_LENGTH = 20, MAX_MESSAGE_LENGTH = 2000

Step 1.2: Create src/lib/ai-config.ts:
- Import createAnthropic from @ai-sdk/anthropic
- Export anthropic client (reads ANTHROPIC_API_KEY automatically)
- Export managerModel using claude-haiku-4-5-20251001
- Export agentModel using claude-sonnet-4-5-20241022

Step 1.3: Create src/lib/kb-loader.ts:
- Export function loadKB(filename: string): string
- Uses readFileSync to read from src/knowledge-base/ directory
- Uses path.join(process.cwd(), 'src', 'knowledge-base', filename)

Follow the IDE Rules exactly. Each file exports one main thing.
After completing each step, confirm: "Step N.M completed."
```

### Prompt for Step 1.4: Create Dispatch prompt

```
Execute Step 1.4: Create src/prompts/dispatch.ts

Export a const DISPATCH_SYSTEM_PROMPT containing the full Dispatch agent system prompt.

The prompt must follow the STARS framework and include:
- Role: AI Dispatch Agent for FleetMind fleet management
- Scope: Help with order assignment, driver-vehicle matching, dispatch planning, scorecard explanation
- Tone: Professional, direct, logistics language
- Rules: Always use KB data, respond in Italian, max 200 words, never invent data
- Handoff signals: [HANDOFF -> COMPLIANCE] and [HANDOFF -> SUPPORT]

Use the complete prompt text from the FleetMind_Dispatch_STARS_Prompt.txt file in the Agent_Prompts folder.

After completing, confirm: "Step 1.4 completed."
```

### Prompt for Step 1.5: Create KB files

```
Execute Step 1.5: Create the 4 Knowledge Base files.

Copy the content from the Project_Docs folder:
- 03_Shared_KB.md -> src/knowledge-base/shared-kb.md
- 04_Dispatch_KB.md -> src/knowledge-base/dispatch-kb.md
- 05_Compliance_KB.md -> src/knowledge-base/compliance-kb.md
- 06_Support_KB.md -> src/knowledge-base/support-kb.md

These files are read at runtime by kb-loader.ts.
Do NOT modify the content -- copy as-is.

After completing, confirm: "Step 1.5 completed."
```

### Prompt for Step 1.6: Create API route (single agent)

```
Execute Step 1.6: Create src/app/api/chat/route.ts

This is the ONLY API route. For Sprint 1, implement a simplified version:
- No Manager agent yet (that comes in Sprint 2)
- Always use the Dispatch agent
- POST handler that:
  1. Receives { messages, currentAgent } from request body
  2. Validates input (last message must be from user, max length check)
  3. Truncates history to MAX_HISTORY_LENGTH
  4. Loads KB: shared-kb.md + dispatch-kb.md
  5. Builds system message: DISPATCH_SYSTEM_PROMPT + shared KB + dispatch KB
  6. Calls streamText with agentModel
  7. Returns streaming response with headers:
     X-Agent-Type: dispatch
     X-Agent-Name: FleetMind Dispatch
     X-Agent-Color: #3B82F6
  8. Error handling: try/catch, returns Italian error message on failure

Follow the IDE Rules: streaming with Vercel AI SDK, KB injected via template literals.

After completing, confirm: "Step 1.6 completed. Output: API route at /api/chat responds with streaming text."
```

### Prompt for Step 1.7: Create Chat UI

```
Execute Step 1.7: Create the complete Chat UI.

Create these files:

1. src/components/AgentIndicator.tsx
   - Shows the current agent name and color as a badge/pill
   - Props: agentName (string), agentColor (string)
   - Small, clean design

2. src/components/ChatMessage.tsx
   - Renders a single chat message
   - Props: message (ChatMessage type), includes agent name/color for assistant messages
   - User messages aligned right, assistant messages aligned left
   - Agent name shown above assistant messages with the agent color

3. src/components/ChatInput.tsx
   - Text input + submit button
   - Props: onSend (callback), disabled (boolean)
   - Submit on Enter key or button click
   - Input clears after send

4. src/app/page.tsx (MAIN CHAT PAGE)
   - "use client" directive
   - State: messages array, currentAgent, isLoading
   - Welcome message from FleetMind Dispatch on load
   - sendMessage function:
     a. Add user message to state
     b. POST to /api/chat with messages and currentAgent
     c. Read streaming response
     d. Read X-Agent-Type/Name/Color headers
     e. Progressively append streamed text to a new assistant message
     f. Update currentAgent from response headers
   - Auto-scroll to bottom on new messages
   - Disable input while loading

5. src/app/globals.css
   - Dark theme (slate-900 background, slate-50 text)
   - Clean, professional styling
   - Smooth scrolling

6. src/app/layout.tsx
   - Title: "FleetMind Assistant"
   - Clean font (system or Inter)

The chat should look professional and clean -- dark background, colored agent names,
clear message bubbles. Think of a modern chat interface like ChatGPT or Claude.

After completing, confirm: "Step 1.7 completed. Output: Chat UI renders in browser,
user can type messages, Dispatch agent responds in streaming with blue indicator."
```
