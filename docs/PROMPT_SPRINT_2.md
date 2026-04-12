# Sprint 2 -- Manager + Multi-Agent Routing

> **Come usare:** Copia e incolla questi prompt nell'IDE per eseguire ogni step. Sprint 1 deve essere completato prima.

---

### Prompt for Steps 2.1-2.2: Create Manager and remaining agent prompts

```
Execute Sprint 2, Steps 2.1 and 2.2.

Step 2.1: Create src/prompts/manager.ts
Export a const MANAGER_SYSTEM_PROMPT with the complete Manager/Orchestrator prompt.
The Manager:
- NEVER responds to the user directly
- Outputs ONLY valid JSON: {"agent": "dispatch" | "compliance" | "support", "reason": "..."}
- Routes based on clear intent signals (see routing rules in Orchestrator prompt)
- Default agent: dispatch
- Bias toward stability (don't switch on every message)

Step 2.2: Create src/prompts/compliance.ts and src/prompts/support.ts
- compliance.ts exports COMPLIANCE_SYSTEM_PROMPT (full STARS prompt for Compliance agent)
- support.ts exports SUPPORT_SYSTEM_PROMPT (full STARS prompt for Support agent)

Use the complete prompt texts from the Agent_Prompts folder.

After completing each step, confirm: "Step N.M completed."
```

### Prompt for Step 2.3: Update API route with Manager + multi-agent

```
Execute Step 2.3: Update src/app/api/chat/route.ts to add the Manager + multi-agent routing.

The updated flow is:
1. Receive { messages, currentAgent } from request body
2. Validate input (same as Sprint 1)
3. Truncate history to MAX_HISTORY_LENGTH

4. NEW: STEP 1 - Manager classification
   - Build manager input: JSON with { message, current_agent, history }
   - Call generateText() with managerModel + MANAGER_SYSTEM_PROMPT
   - Parse response as JSON to get { agent, reason }
   - If parse fails: fallback to currentAgent or 'dispatch'
   - Wrap in try/catch: if Manager fails, use currentAgent as fallback

5. STEP 2 - Load KB for selected agent
   - Load shared-kb.md (always)
   - Load the vertical KB for the selected agent (dispatch-kb.md OR compliance-kb.md OR support-kb.md)

6. STEP 3 - Agent generates response
   - Build system message: selected agent's prompt + shared KB + vertical KB
   - Call streamText() with agentModel
   - Return streaming response with correct headers:
     X-Agent-Type: [selected agent]
     X-Agent-Name: [AGENT_NAMES[selected agent]]
     X-Agent-Color: [AGENT_COLORS[selected agent]]

7. Error handling: try/catch around entire flow, Italian error message on failure

Key changes from Sprint 1:
- Import all 4 prompts (manager, dispatch, compliance, support)
- Map agent type to prompt using AGENT_PROMPTS record
- KB cache: load KBs once and cache in module scope
- Manager uses generateText (not streaming), Agent uses streamText

After completing, confirm: "Step 2.3 completed. Output: API route uses Manager
for classification then selected agent for streaming response."
```

### Prompt for Step 2.4: Update frontend for agent switching

```
Execute Step 2.4: Update the frontend to handle agent switching.

Update src/app/page.tsx:
- When reading the streaming response, extract X-Agent-Type, X-Agent-Name, X-Agent-Color headers
- Update currentAgent state based on X-Agent-Type header
- Pass agent info to ChatMessage component for each assistant message
- Update AgentIndicator with the current agent

Update src/components/ChatMessage.tsx:
- Show agent name above assistant messages
- Use the agent's color for the name text
- Each message should store which agent responded (agent field in ChatMessage)

Update src/components/AgentIndicator.tsx:
- Show current agent name with colored dot/badge
- Animate the color change when agent switches (subtle transition)

After completing, confirm: "Step 2.4 completed. Output: When the agent changes,
the UI shows different names and colors for each agent's messages."
```

### Prompt for Step 2.5: Test routing

```
This is a manual testing step. Do NOT write code.

Test the following 5 scenarios and report the results:

1. Send: "Ciao, ho bisogno di pianificare le consegne di domani"
   Expected: Dispatch (blue)

2. Send: "Le CQC dei miei autisti sono in scadenza?"
   Expected: Compliance (amber)

3. Send: "Non riesco a fare il login"
   Expected: Support (green)

4. Send: "Come funziona la scorecard a 7 punti?"
   Expected: Dispatch (blue)

5. Send: "Quali sono i costi minimi MIT per un camion da 18 tonnellate?"
   Expected: Compliance (amber)

For each test, report:
- What agent responded
- Whether the color/name changed in the UI
- Whether the response was relevant

If any test fails, describe the issue precisely.
```
