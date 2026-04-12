# Sprint 3 & 4 -- KB Injection & End-to-End Flow

> **Come usare:** Sprint 3 verifica che le KB funzionano. Sprint 4 testa le transizioni. Sono principalmente sprint di TEST con eventuali fix.

---

## Sprint 3 -- Knowledge Base Injection Tests

### Prompt for Steps 3.1-3.5: KB verification tests

```
This is a TESTING sprint. Test each scenario manually and report results.

TEST 3.1 - Dispatch uses KB data:
Send: "Come funziona il pre-filtro del dispatch AI?"
Expected: The response mentions at least 4 of these 5 pre-filter criteria:
peso (weight capacity), ADR (dangerous goods), refrigerazione (refrigerated),
tipo patente (license type), ore di guida (driving hours).
Result: PASS / FAIL + what was mentioned

TEST 3.2 - Compliance uses KB data with specific numbers:
Send: "Quanto costa al minimo trasportare con un camion da 18 tonnellate per 200 km?"
Expected: Response includes Class C, approximately EUR 1.71/km minimum,
total approximately EUR 342.
Result: PASS / FAIL + exact numbers given

TEST 3.3 - Anti-hallucination (Dispatch):
Send: "Quanti ordini ho in sospeso?"
Expected: Agent explains this is a demo and suggests checking the
FleetMind dashboard. Does NOT invent a number.
Result: PASS / FAIL + what was said

TEST 3.4 - Anti-hallucination (Compliance):
Send: "Qual e la normativa EU per i droni nel trasporto?"
Expected: Agent says it does not have this information in its knowledge base.
Does NOT invent a regulation.
Result: PASS / FAIL + what was said

TEST 3.5 - Support uses KB data:
Send: "Come aggiungo un nuovo autista?"
Expected: Step-by-step guide mentioning: pagina Autisti, Aggiungi Autista,
nome, cognome, patente, CQC, tachigrafo.
Result: PASS / FAIL + steps given

For each FAIL, describe the exact problem so we can fix it.
```

### Prompt for Step 3.6: Fix KB issues (if any tests failed)

```
The following KB tests failed: [paste results from tests above]

For each failure, diagnose the root cause:
1. Is the KB content missing the relevant information?
2. Is the system prompt not instructing the agent to use KB data?
3. Is the KB not being loaded/injected correctly?

Fix each issue. Possible fixes:
- If KB content is missing: update the .md file in src/knowledge-base/
- If prompt is not instructing KB usage: update the prompt in src/prompts/
- If KB loading is broken: check src/lib/kb-loader.ts and the API route

After fixing, confirm: "Step 3.6 completed. All KB tests now pass."
```

---

## Sprint 4 -- End-to-End Flow with Transitions

### Prompt for Steps 4.1-4.5: Transition tests

```
This is a TESTING sprint. Test each scenario manually and report results.

TEST 4.1 - Multi-turn within single agent:
Have a 3-message conversation about dispatch:
1. "Come funziona il dispatch AI?"
2. "E se un ordine e urgente, cosa cambia?"
3. "Ok, e se non ci sono autisti disponibili?"
Expected: All 3 responses come from Dispatch (blue).
Agent builds on previous context.
Result: PASS / FAIL

TEST 4.2 - Agent transitions (Dispatch -> Compliance -> Dispatch):
1. "Come funziona il dispatch AI?" -> Expected: Dispatch
2. "E per le ore di guida, qual e il limite?" -> Expected: Compliance
3. "Ok capito, torniamo alla pianificazione: che succede se un ordine e urgente?" -> Expected: Dispatch
Result: PASS / FAIL + which agent responded each time

TEST 4.3 - Stability (no premature switching):
After getting a response from Compliance, send:
1. "ok"
2. "grazie"
3. "capito"
Expected: All stay on Compliance (not switch back to Dispatch)
Result: PASS / FAIL

TEST 4.4 - Edge case: ambiguous messages:
On first message (no history), send:
1. "aiuto"
2. "cosa puoi fare?"
3. "non so"
Expected: No crash. Agent responds sensibly (default to dispatch or support).
Result: PASS / FAIL

TEST 4.5 - History truncation:
Send 25+ messages in a conversation.
Expected: No errors, chatbot continues to respond after message 20.
Result: PASS / FAIL

For each FAIL, describe the exact problem and which agent incorrectly responded.
```

### Prompt for Step 4.6: Fix transition issues (if any tests failed)

```
The following transition tests failed: [paste results from tests above]

Diagnose the root cause. Common issues:

1. Manager switches too aggressively:
   Fix: Update src/prompts/manager.ts to add stronger stability rules.
   Add: "If the user sends a short acknowledgment (ok, grazie, capito, perfetto),
   keep the current agent. Do NOT switch agents for acknowledgments."

2. Manager doesn't switch when it should:
   Fix: Check the routing rules in manager.ts. Make sure compliance keywords
   (scadenza, normativa, ore di guida, MIT) trigger the compliance route.

3. Agent loses context:
   Fix: Check that the full truncated history is being passed to the agent
   in the API route. Verify MAX_HISTORY_LENGTH is 20.

4. Frontend doesn't update agent indicator:
   Fix: Check that X-Agent-Type header is being read correctly from the
   streaming response.

Fix each issue and re-test.
After fixing, confirm: "Step 4.6 completed. All transition tests now pass."
```
