# FleetMind Chatbot -- Sub-Plans (Execution Steps)

> **Cos'e questo documento:** I piani di esecuzione dettagliati per ogni sprint del Master Plan. Ogni step e un'azione atomica con input, output e criterio di successo binario. L'Executor (IDE) segue questi step uno alla volta. Generato seguendo il Prompt #5 del Plan & Solve Framework.

---

## Sub-Plan: Sprint 0 -- Pre-flight Check

### Step 0.1 -- Verify dev server
**Files involved:** `package.json`, `next.config.ts`
**Required input:** Progetto Next.js inizializzato (Step 2 della Setup Guide)
**Expected output:** Server di sviluppo in esecuzione
**Success criterion:** `npm run dev` avvia il server senza errori e localhost:3000 mostra la pagina default di Next.js

### Step 0.2 -- Verify environment variables
**Files involved:** `.env.local`, `.gitignore`
**Required input:** File `.env.local` creato con API key
**Expected output:** API key accessibile server-side
**Success criterion:** In un file server-side, `process.env.ANTHROPIC_API_KEY` restituisce un valore che inizia con `sk-ant`. Il file `.env.local` e presente in `.gitignore`.

### Step 0.3 -- Verify Vercel deployment
**Files involved:** Repository GitHub, dashboard Vercel
**Required input:** Repo collegato a Vercel con environment variable configurata
**Expected output:** Deploy andato a buon fine
**Success criterion:** La pagina Vercel del progetto mostra status "Ready" e l'URL pubblico mostra la pagina default di Next.js

### Step 0.4 -- Verify IDE context
**Files involved:** `01_Master_Brief.md`, `02_Risk_and_Constraints.md`, `02_IDE_RULES.md`
**Required input:** Documenti del progetto nella cartella docs/ o caricati nell'IDE
**Expected output:** L'IDE comprende il progetto
**Success criterion:** Chiedere all'IDE "Cos'e questo progetto?" e verificare che menziona: FleetMind, multi-agente, 4 agenti (Manager, Dispatch, Compliance, Support), Next.js, Vercel AI SDK

---

## Sub-Plan: Sprint 1 -- Single Agent Working (Dispatch Only)

### Step 1.1 -- Create TypeScript types
**Files involved:** `src/lib/types.ts`
**Required input:** Reference file `03_TYPES_REFERENCE.ts`
**Expected output:** File types.ts con AgentType, AGENT_COLORS, AGENT_NAMES, ManagerResponse, ChatMessage, config constants
**Success criterion:** Il file compila senza errori TypeScript. `AgentType` include 'dispatch', 'compliance', 'support'.

### Step 1.2 -- Create AI configuration
**Files involved:** `src/lib/ai-config.ts`
**Required input:** Reference file `04_AI_CONFIG_REFERENCE.ts`, `.env.local` con API key
**Expected output:** File ai-config.ts con client Anthropic, managerModel e agentModel esportati
**Success criterion:** Il file compila senza errori. Importa `createAnthropic` da `@ai-sdk/anthropic`.

### Step 1.3 -- Create KB loader
**Files involved:** `src/lib/kb-loader.ts`
**Required input:** Nessuno (utility pura)
**Expected output:** Funzione `loadKB(filename)` che legge file .md dalla cartella knowledge-base
**Success criterion:** La funzione usa `readFileSync` e `path.join(process.cwd(), 'src', 'knowledge-base', filename)`.

### Step 1.4 -- Create Dispatch system prompt
**Files involved:** `src/prompts/dispatch.ts`
**Required input:** Agent prompt `FleetMind_Dispatch_STARS_Prompt.txt`
**Expected output:** File che esporta `DISPATCH_SYSTEM_PROMPT` come const string
**Success criterion:** Il file esporta una stringa non vuota che contiene "FleetMind Dispatch".

### Step 1.5 -- Create placeholder KB files
**Files involved:** `src/knowledge-base/shared-kb.md`, `src/knowledge-base/dispatch-kb.md`, `src/knowledge-base/compliance-kb.md`, `src/knowledge-base/support-kb.md`
**Required input:** KB documents from Project_Docs (03, 04, 05, 06)
**Expected output:** 4 file .md nella cartella knowledge-base con il contenuto delle KB
**Success criterion:** Tutti e 4 i file esistono e hanno contenuto (non vuoti). `loadKB('shared-kb.md')` restituisce una stringa non vuota.

### Step 1.6 -- Create API route (single agent, no Manager)
**Files involved:** `src/app/api/chat/route.ts`
**Required input:** Steps 1.1-1.5 completati
**Expected output:** API route POST che riceve messaggi, carica il prompt Dispatch + KB, chiama Claude con streaming, restituisce lo stream con header agente
**Success criterion:** POST a `/api/chat` con `{"messages": [{"role": "user", "content": "Ciao"}], "currentAgent": null}` restituisce uno stream di testo. Gli header `X-Agent-Type`, `X-Agent-Name`, `X-Agent-Color` sono presenti nella risposta.

### Step 1.7 -- Create Chat UI (frontend)
**Files involved:** `src/app/page.tsx`, `src/app/globals.css`, `src/components/ChatMessage.tsx`, `src/components/ChatInput.tsx`, `src/components/AgentIndicator.tsx`
**Required input:** Step 1.6 completato (API route funzionante)
**Expected output:** Interfaccia chat completa con: area messaggi scrollabile, input bar, indicatore agente, messaggio di benvenuto
**Success criterion:** La pagina si apre senza errori. L'utente puo scrivere un messaggio, premere invio, e vedere la risposta dell'agente Dispatch apparire in streaming. Il nome "FleetMind Dispatch" e il colore blu (#3B82F6) appaiono nell'indicatore agente.

### Step 1.8 -- Verify and commit Sprint 1
**Files involved:** Tutti i file creati
**Required input:** Steps 1.1-1.7 completati
**Expected output:** Commit Git e deploy Vercel
**Success criterion:** `git push` trigga un deploy su Vercel. Il chatbot funziona sull'URL pubblico: l'utente scrive, l'agente Dispatch risponde in streaming.

---

## Sub-Plan: Sprint 2 -- Manager + Multi-Agent Routing

### Step 2.1 -- Create Manager system prompt
**Files involved:** `src/prompts/manager.ts`
**Required input:** Agent prompt `FleetMind_Orchestrator_Prompt.txt`
**Expected output:** File che esporta `MANAGER_SYSTEM_PROMPT` come const string
**Success criterion:** Il file esporta una stringa che contiene le regole di routing per dispatch, compliance, e support.

### Step 2.2 -- Create Compliance and Support system prompts
**Files involved:** `src/prompts/compliance.ts`, `src/prompts/support.ts`
**Required input:** Agent prompts STARS per Compliance e Support
**Expected output:** Due file che esportano `COMPLIANCE_SYSTEM_PROMPT` e `SUPPORT_SYSTEM_PROMPT`
**Success criterion:** Entrambi i file compilano e esportano stringhe non vuote.

### Step 2.3 -- Update API route with Manager + multi-agent
**Files involved:** `src/app/api/chat/route.ts`
**Required input:** Steps 2.1-2.2 completati, Manager prompt e tutti i prompt agente
**Expected output:** API route aggiornata con doppia chiamata LLM: Manager (generateText, JSON) -> Agente (streamText, streaming). La route carica il prompt e la KB corretti in base alla decisione del Manager.
**Success criterion:**
- Messaggio "Come assegno gli ordini?" -> Manager ritorna `{"agent": "dispatch"}` -> risponde Dispatch (header X-Agent-Type: dispatch)
- Messaggio "Quando scade la patente?" -> Manager ritorna `{"agent": "compliance"}` -> risponde Compliance (header X-Agent-Type: compliance)
- Messaggio "Come configuro l'API key?" -> Manager ritorna `{"agent": "support"}` -> risponde Support (header X-Agent-Type: support)

### Step 2.4 -- Update frontend to handle agent switching
**Files involved:** `src/app/page.tsx`, `src/components/ChatMessage.tsx`, `src/components/AgentIndicator.tsx`
**Required input:** Step 2.3 completato
**Expected output:** Il frontend legge gli header X-Agent-Type/Name/Color dalla risposta e aggiorna l'indicatore agente. Ogni messaggio dell'assistente mostra il nome e il colore dell'agente che ha risposto.
**Success criterion:** In una singola conversazione, l'utente vede messaggi da diversi agenti con nomi e colori distinti. L'indicatore agente in alto cambia quando l'agente cambia.

### Step 2.5 -- Test routing with 5 scenarios
**Files involved:** Nessun file da modificare -- solo test manuali
**Required input:** Steps 2.3-2.4 completati
**Expected output:** 5 test superati
**Success criterion:**
1. "Ciao, ho bisogno di pianificare le consegne di domani" -> Dispatch (blu)
2. "Le CQC dei miei autisti sono in scadenza?" -> Compliance (ambra)
3. "Non riesco a fare il login" -> Support (verde)
4. "Come funziona la scorecard a 7 punti?" -> Dispatch (blu)
5. "Quali sono i costi minimi MIT per un camion da 18 tonnellate?" -> Compliance (ambra)

### Step 2.6 -- Verify and commit Sprint 2
**Files involved:** Tutti i file modificati
**Required input:** Step 2.5 superato
**Expected output:** Commit Git e deploy Vercel
**Success criterion:** Il chatbot su Vercel rotta correttamente tra i 3 agenti.

---

## Sub-Plan: Sprint 3 -- Knowledge Base Injection

### Step 3.1 -- Verify Dispatch uses KB data
**Files involved:** Nessun file da modificare -- test
**Required input:** Sprint 2 completato, KB files in place
**Expected output:** Risposte basate sulla KB
**Success criterion:** Chiedere "Come funziona il pre-filtro?" e verificare che la risposta menziona: peso, ADR, refrigerazione, tipo patente, ore di guida (tutti dalla KB Dispatch).

### Step 3.2 -- Verify Compliance uses KB data
**Files involved:** Nessun file da modificare -- test
**Required input:** Sprint 2 completato, KB files in place
**Expected output:** Risposte con dati normativi precisi
**Success criterion:** Chiedere "Quanto costa al minimo trasportare con un camion da 18t per 200 km?" e verificare che la risposta include: Classe C, EUR 1.71/km, costo totale circa EUR 342 (dati dalla KB Compliance).

### Step 3.3 -- Anti-hallucination test: Dispatch
**Files involved:** Nessun file da modificare -- test
**Required input:** Sprint 2 completato
**Expected output:** L'agente rifiuta di inventare dati
**Success criterion:** Chiedere "Quanti ordini ho in sospeso?" e verificare che l'agente spiega che questa e una demo e suggerisce di controllare la dashboard FleetMind reale. NON deve inventare un numero.

### Step 3.4 -- Anti-hallucination test: Compliance
**Files involved:** Nessun file da modificare -- test
**Required input:** Sprint 2 completato
**Expected output:** L'agente non inventa regolamenti
**Success criterion:** Chiedere "Qual e la normativa EU per i droni nel trasporto?" e verificare che l'agente dice di non avere questa informazione nella sua base dati e suggerisce di consultare fonti ufficiali. NON deve inventare una normativa.

### Step 3.5 -- Verify Support uses KB data
**Files involved:** Nessun file da modificare -- test
**Required input:** Sprint 2 completato, KB files in place
**Expected output:** Guide step-by-step dalla KB
**Success criterion:** Chiedere "Come aggiungo un nuovo autista?" e verificare che la risposta include i passaggi corretti dalla KB: vai alla pagina Autisti, clicca Aggiungi Autista, compila i dati (nome, cognome, patente, CQC, tachografo).

### Step 3.6 -- Fix any KB-related issues found in tests
**Files involved:** Potenzialmente `src/prompts/*.ts`, `src/knowledge-base/*.md`
**Required input:** Steps 3.1-3.5 completati
**Expected output:** Tutti i test della KB superati
**Success criterion:** Ripetere i test 3.1-3.5 e verificare che tutti passano.

---

## Sub-Plan: Sprint 4 -- End-to-End Flow with Transitions

### Step 4.1 -- Test multi-turn conversation within single agent
**Files involved:** Nessun file da modificare -- test
**Required input:** Sprint 3 completato
**Expected output:** L'agente mantiene contesto tra messaggi
**Success criterion:** Conversazione di 3+ messaggi con Dispatch sullo stesso argomento (es: pianificazione ordini). L'agente ricorda cosa ha detto prima e non si ripete.

### Step 4.2 -- Test agent transitions (Dispatch -> Compliance -> Dispatch)
**Files involved:** Nessun file da modificare -- test
**Required input:** Sprint 3 completato
**Expected output:** Transizioni fluide tra agenti
**Success criterion:** Conversazione test:
1. "Come funziona il dispatch AI?" -> Dispatch
2. "E per le ore di guida, qual e il limite?" -> Compliance
3. "Ok capito, torniamo alla pianificazione: che succede se un ordine e urgente?" -> Dispatch
Ogni transizione mostra il cambio di agente nell'UI.

### Step 4.3 -- Test stability (no premature switching)
**Files involved:** Nessun file da modificare -- test
**Required input:** Sprint 3 completato
**Expected output:** L'agente non switcha per acknowledgments
**Success criterion:** Dopo una risposta di Compliance, scrivere "ok", "grazie", "capito". L'agente deve restare su Compliance (non tornare a Dispatch). Ripetere per ogni agente.

### Step 4.4 -- Test edge case: ambiguous messages
**Files involved:** Nessun file da modificare -- test
**Required input:** Sprint 3 completato
**Expected output:** Il Manager gestisce l'ambiguita senza crashare
**Success criterion:** Messaggi ambigui come "aiuto", "non so", "cosa puoi fare?" vengono gestiti senza errori. L'agente corrente risponde (o il default Dispatch se e il primo messaggio).

### Step 4.5 -- Test history truncation
**Files involved:** Nessun file da modificare -- test
**Required input:** Sprint 3 completato
**Expected output:** Conversazioni lunghe funzionano
**Success criterion:** Inviare 25+ messaggi in una conversazione. Il chatbot continua a rispondere senza errori (la cronologia viene troncata a 20 messaggi prima di inviarla al backend).

### Step 4.6 -- Fix any transition issues
**Files involved:** Potenzialmente `src/prompts/manager.ts`, `src/app/api/chat/route.ts`
**Required input:** Steps 4.1-4.5 completati
**Expected output:** Tutte le transizioni funzionano
**Success criterion:** Ripetere i test 4.1-4.5 e verificare che tutti passano.

---

## Sub-Plan: Sprint 5 -- Bug Fix, Edge Cases & Polish

### Step 5.1 -- Handle empty/invalid input
**Files involved:** `src/app/api/chat/route.ts`, `src/app/page.tsx`
**Required input:** Sprint 4 completato
**Expected output:** Gestione errori per input invalidi
**Success criterion:** Messaggio vuoto: il frontend non invia nulla. Messaggio > 2000 caratteri: il backend ritorna errore 400. Messaggio senza history: il backend usa il fallback (Dispatch).

### Step 5.2 -- Handle API errors gracefully
**Files involved:** `src/app/api/chat/route.ts`, `src/app/page.tsx`
**Required input:** Sprint 4 completato
**Expected output:** Messaggi di errore user-friendly
**Success criterion:** Se la chiamata API fallisce (simula rimuovendo l'API key), il chatbot mostra un messaggio in italiano: "Si e verificato un errore. Riprova tra qualche secondo." Nessun crash, nessun errore tecnico visibile all'utente.

### Step 5.3 -- UI polish
**Files involved:** `src/app/page.tsx`, `src/app/globals.css`, `src/components/*.tsx`
**Required input:** Sprint 4 completato
**Expected output:** UI pulita e professionale
**Success criterion:** Scrolling automatico alla nuova risposta. Input field si pulisce dopo l'invio. L'indicatore agente e sempre visibile. I colori degli agenti sono corretti e leggibili. Il chatbot ha un titolo/header "FleetMind Assistant". Nessun errore nella console del browser.

### Step 5.4 -- Final Vercel deploy and verification
**Files involved:** Tutti i file del progetto
**Required input:** Steps 5.1-5.3 completati
**Expected output:** Deploy finale funzionante
**Success criterion:** Il chatbot su Vercel (URL pubblico) funziona end-to-end: un utente puo avere una conversazione completa con transizioni tra agenti, risposte basate su KB, e nessun errore visibile.

### Step 5.5 -- Final commit and cleanup
**Files involved:** Tutti i file del progetto
**Required input:** Step 5.4 verificato
**Expected output:** Repository pulito, deploy stabile
**Success criterion:** `git log` mostra commit chiari per ogni sprint. Nessun file temporaneo o debug log nel codice. `npm run build` compila senza warning.
