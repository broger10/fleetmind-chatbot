# Sprint 5 -- Bug Fix, Edge Cases & Polish

> **Come usare:** Questo sprint finalizza il progetto. Correggi i bug, gestisci gli edge case, e pulisci l'UI per il deploy finale.

---

### Prompt for Step 5.1: Handle empty/invalid input

```
Execute Step 5.1: Add input validation and edge case handling.

In src/app/page.tsx:
- Prevent sending empty messages (trim whitespace, check length > 0)
- Disable send button while message is being processed (isLoading state)

In src/app/api/chat/route.ts:
- If last message is missing or not from user: return 400
- If message content > MAX_MESSAGE_LENGTH (2000 chars): return 400 with
  Italian message "Messaggio troppo lungo. Massimo 2000 caratteri."
- If messages array is empty: return 400
- If currentAgent is null and no history: default to 'dispatch'

Test: try to send an empty message (should be blocked by frontend).
Test: the first message with no history should work (default to dispatch).

After completing, confirm: "Step 5.1 completed."
```

### Prompt for Step 5.2: Handle API errors gracefully

```
Execute Step 5.2: Improve error handling for a smooth user experience.

In src/app/api/chat/route.ts:
- Wrap entire handler in try/catch
- If Manager call fails: log error, use fallback agent (current or 'dispatch')
- If Agent call fails: return JSON with Italian error message
  "Si e verificato un errore. Riprova tra qualche secondo."
- Return appropriate HTTP status codes (400 for client errors, 500 for server errors)

In src/app/page.tsx:
- If fetch to /api/chat fails or returns non-OK status:
  - Show an error message in the chat as a system message
  - Re-enable the input so the user can try again
  - Do NOT crash or show a blank screen
- Handle network errors (offline, timeout)

Test: temporarily set a wrong API key in .env.local and verify the chatbot
shows a friendly Italian error message instead of crashing.
Then restore the correct API key.

After completing, confirm: "Step 5.2 completed."
```

### Prompt for Step 5.3: UI polish

```
Execute Step 5.3: Polish the UI for a professional look.

Requirements:
1. Header: "FleetMind Assistant" title at the top with a subtle truck/fleet icon
   (use an emoji or SVG). Background slightly different from chat area.

2. Agent Indicator: Show current agent as a colored pill/badge below the header.
   Smooth color transition when agent changes (CSS transition 300ms).

3. Messages area:
   - Auto-scroll to bottom when new message arrives
   - User messages: right-aligned, slightly rounded bubble, darker background
   - Assistant messages: left-aligned, lighter background, agent name in
     agent color above the message text
   - Typing indicator: show "..." or a subtle animation while waiting for response

4. Input area:
   - Clean input field at the bottom, full width with send button
   - Send button with arrow icon, disabled (grayed out) when loading
   - Placeholder text: "Scrivi un messaggio..."
   - Submit on Enter (not Shift+Enter which adds newline)

5. Overall theme:
   - Dark mode: slate-900 background, slate-800 for message bubbles
   - Clean typography, good spacing
   - Mobile-friendly (responsive)
   - No horizontal scroll

6. Welcome message:
   - On page load, show a welcome message from FleetMind Dispatch:
     "Ciao! Sono FleetMind Dispatch, il tuo co-pilota per la pianificazione
     trasporti. Posso aiutarti con la gestione ordini, assegnazione autisti
     e mezzi, e ottimizzazione delle rotte. Come posso aiutarti?"

Check: no errors in browser console.
Check: the chat looks professional on both desktop and mobile.

After completing, confirm: "Step 5.3 completed."
```

### Prompt for Step 5.4: Final deploy

```
Execute Step 5.4: Final verification and deploy.

1. Run `npm run build` -- must complete without errors
2. Run `npm run dev` and test the complete flow:
   a. Page loads with welcome message from Dispatch (blue)
   b. Ask about dispatch: "Come funziona il pre-filtro?" -> Dispatch responds
   c. Ask about compliance: "Quali sono i limiti ore di guida?" -> Compliance responds (amber)
   d. Ask about support: "Come configuro l'API key?" -> Support responds (green)
   e. Send "ok grazie" -> stays with current agent
   f. No console errors throughout

3. Git commit and push:
   git add -A
   git commit -m "feat: complete FleetMind multi-agent chatbot with dispatch, compliance, and support agents"
   git push origin main

4. Check Vercel:
   - Deploy completes successfully
   - The public URL shows the working chatbot
   - Test the same flow (a-f above) on the Vercel URL

Report the final Vercel URL.
After completing, confirm: "Step 5.4 completed. Deploy URL: [url]"
```

### Prompt for Step 5.5: Cleanup

```
Execute Step 5.5: Final cleanup.

1. Remove any console.log statements added for debugging
2. Remove any TODO comments that are no longer relevant
3. Verify no files outside the defined structure exist
4. Verify .env.local is NOT committed (check git log)
5. Run `npm run build` one final time to confirm clean build

6. Final git commit:
   git add -A
   git commit -m "chore: cleanup debug logs and finalize for presentation"
   git push origin main

After completing, confirm: "Step 5.5 completed. Project is ready for presentation."
```

---

## Post-Sprint: Presentation Preparation

Once all sprints are complete, prepare for the April 18th presentation:

1. **Demo script:** Walk through a realistic conversation showing all 3 agents
2. **Key points to cover:**
   - Plan & Solve methodology (show your Master Plan and Sub-Plans)
   - STARS framework for prompts
   - Multi-agent architecture (Manager + 3 specialists)
   - Knowledge Base injection (FleetMind domain knowledge)
   - Live demo of agent transitions
3. **Backup:** Have screenshots/video in case Vercel or API has issues during presentation
