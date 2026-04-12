# FleetMind Chatbot Agent - Risk & Constraints Report

> **Cos'e questo documento:** L'analisi dei rischi tecnici e dei vincoli del progetto, prodotta nella fase di CTO Risk Analysis. Identifica tutto quello che puo andare storto prima che si scriva una riga di codice. Ogni piano (Master Plan e Sub-Plan) deve tenere conto di questo documento. Se un rischio non e mitigato in almeno uno sprint, il piano e incompleto.

---

## 1. Rischi Architetturali

### R1 -- Context window overflow con conversazioni lunghe
- **Gravita:** MEDIO
- **Quando si manifesta:** Dopo 15-20 scambi di messaggi, la cronologia + Shared KB + Vertical KB + system prompt superano il limite di contesto del modello
- **Mitigazione:** Troncare la cronologia ai messaggi piu recenti (ultimi 20 messaggi). La Shared KB e le Vertical KB sono abbastanza corte da stare nel contesto. Monitorare la lunghezza totale prima di ogni chiamata API

### R2 -- Routing del Manager incoerente
- **Gravita:** CRITICO
- **Quando si manifesta:** Quando il Manager switcha agente ad ogni messaggio invece di mantenere la continuita, oppure non switcha quando dovrebbe (es: utente chiede di compliance ma resta in dispatch)
- **Mitigazione:** Il Manager riceve sempre l'agente attualmente attivo e ha una regola esplicita: "Non cambiare agente a meno che ci sia un segnale chiaro di cambio di intento". Usare JSON mode per output strutturato e deterministico

### R3 -- Latenza doppia chiamata API
- **Gravita:** MEDIO
- **Quando si manifesta:** Ogni messaggio richiede due chiamate LLM (Manager + Agente). Se il modello e lento, l'utente aspetta 5-10 secondi
- **Mitigazione:** Usare il modello piu veloce disponibile per il Manager (Claude Haiku). Usare streaming per la risposta dell'agente cosi l'utente vede le parole apparire progressivamente

### R4 -- Streaming non supportato o mal configurato
- **Gravita:** MEDIO
- **Quando si manifesta:** Se lo streaming non funziona, il frontend resta vuoto per secondi prima di mostrare la risposta completa
- **Mitigazione:** Usare il Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) che gestisce lo streaming nativamente con il hook `useChat`. Avere un fallback non-streaming che mostra la risposta completa dopo il caricamento

### R5 -- API key esposta nel frontend
- **Gravita:** CRITICO
- **Quando si manifesta:** Se l'API key viene inclusa nel codice frontend o in un file committato su Git
- **Mitigazione:** L'API key vive SOLO in `.env.local` (gia nel `.gitignore`). Tutte le chiamate LLM passano dall'API route server-side. Il frontend non fa MAI chiamate dirette al provider LLM

### R6 -- KB troppo lunga per il contesto (specifico dominio logistico)
- **Gravita:** MEDIO
- **Quando si manifesta:** La KB FleetMind contiene normative, tariffe MIT, regole ADR, schema DB -- puo diventare molto lunga
- **Mitigazione:** Dividere le KB per agente (dispatch, compliance, support) in modo che ogni agente riceva solo la KB rilevante. La shared KB contiene solo le informazioni comuni. Ogni KB verticale e focalizzata sul dominio specifico dell'agente

### R7 -- Allucinazioni su normative e tariffe
- **Gravita:** CRITICO
- **Quando si manifesta:** L'agente Compliance inventa dati normativi, tariffe MIT, o scadenze che non esistono nella KB
- **Mitigazione:** Regola esplicita nel prompt STARS: "MAI inventare dati normativi. Se non e nella KB, dire 'non ho questa informazione, consulta il team operativo'". Ogni dato normativo nella KB deve avere fonte e data di aggiornamento

---

## 2. Vincoli Tecnici

- **V1** -- Tutte le chiamate LLM passano dall'API route `/api/chat`. Il frontend non chiama mai direttamente il provider LLM.
- **V2** -- La Knowledge Base e composta da file `.md` statici nella cartella `/knowledge-base/`. Non ci sono embeddings, vector store, o database.
- **V3** -- La conversazione vive nello stato React del frontend. Non viene persistita. Refresh pagina = conversazione persa.
- **V4** -- Il Manager Agent usa JSON mode (output strutturato) per garantire routing deterministico e parsabile.
- **V5** -- Ogni agente riceve: system prompt + KB condivisa + KB verticale + cronologia conversazione. Nient'altro.
- **V6** -- Il file `.env.local` contiene l'API key e non viene mai committato su Git.
- **V7** -- Il progetto usa un solo framework (Next.js). Non ci sono microservizi, container, o servizi separati.
- **V8** -- Il chatbot NON si collega al database FleetMind reale, non chiama API esterne, non esegue tool use. Risponde SOLO in base alle KB statiche.

---

## 3. Decisioni di Scalabilita

### Memoria conversazione
- **Decisione:** Teniamo semplice -- stato React, nessun database
- **Motivazione:** Il progetto e un MVP didattico. Aggiungere un database raddoppierebbe la complessita senza beneficio
- **Punto di rottura:** Se servisse persistenza tra sessioni o storico conversazioni per analytics

### Knowledge Base
- **Decisione:** Teniamo semplice -- file .md letti a runtime
- **Motivazione:** La KB di FleetMind e abbastanza contenuta da stare nel contesto LLM. Un RAG aggiungerebbe embeddings, vector store, e una pipeline di indicizzazione senza necessita
- **Punto di rottura:** Se la KB superasse i 50.000 token o se servisse ricerca semantica su cataloghi di centinaia di veicoli/autisti

### Modello LLM
- **Decisione:** Claude API (Anthropic) via Vercel AI SDK
- **Motivazione:** Il team usa gia Claude. Il Vercel AI SDK gestisce streaming nativamente
- **Punto di rottura:** Se si volessero usare feature specifiche come function calling avanzato o tool use reale

---

## 4. Dipendenze Critiche

### Claude API (Anthropic)
- **Ruolo:** Genera tutte le risposte del chatbot. Senza API, il chatbot non funziona.
- **Rischio:** Rate limiting, API key non valida, servizio down, crediti esauriti
- **Piano B:** Testare in locale con conversazioni brevi. Se l'API non funziona, verificare la chiave e i crediti residui

### Vercel
- **Ruolo:** Hosting e deployment dell'applicazione
- **Rischio:** Deploy fallito, problemi di build, timeout sulle serverless function (default 10s su free tier)
- **Piano B:** Testare in locale con `npm run dev` durante lo sviluppo. Aumentare il timeout delle function a 30s se necessario

### Vercel AI SDK (`ai` package)
- **Ruolo:** Gestisce streaming delle risposte LLM e hook React
- **Rischio:** Breaking changes nella libreria, incompatibilita con il provider
- **Piano B:** Implementare streaming manuale con `ReadableStream` se il SDK da problemi

---

## 5. Domande Aperte e Risposte

- **D:** Il chatbot deve avere competenze reali di FleetMind o simularle?
- **R:** Simularle. Le KB contengono le informazioni estratte dal SaaS reale (normative, tariffe, funzionalita), ma il chatbot non accede al DB ne esegue operazioni reali. E un assistente informativo.

- **D:** Quale modello usare per il Manager (routing)?
- **R:** `claude-haiku-4-5-20251001` -- il piu veloce e economico. Il Manager non genera testo creativo, classifica e basta.

- **D:** Il chatbot deve rispondere in italiano anche se le KB sono in inglese?
- **R:** Si. Le KB sono in inglese (standard del corso), ma l'agente comunica sempre in italiano con l'utente. Questo va specificato nel system prompt di ogni agente.

- **D:** Come gestire domande su dati specifici del cliente (es: "quanti autisti ho")?
- **R:** L'agente spiega che nel chatbot demo non ha accesso ai dati reali dell'azienda, ma puo spiegare come funziona la feature nella piattaforma e cosa vedrebbe l'operatore nella dashboard.
