# FleetMind Chatbot -- Master Plan

> **Cos'e questo documento:** Il piano di sviluppo sprint-by-sprint. Ogni sprint ha un obiettivo chiaro, un output verificabile, dipendenze esplicite, e rischi specifici dal Risk & Constraints Report. Generato seguendo il Prompt #4 del Plan & Solve Framework.

---

## Sprint 0 -- Pre-flight Check
**Objective:** Verificare che tutta l'infrastruttura funziona prima di scrivere codice.

**Verifiable Output:** `npm run dev` funziona, la pagina si apre su localhost:3000, il deploy su Vercel va a buon fine, l'IDE ha il contesto caricato.

**Dependencies:** Nessuna (primo sprint).

**Specific Risks:** R5 (API key esposta) -- verificare che `.env.local` sia in `.gitignore` prima del primo commit.

**Complexity Estimate:** LOW

---

## Sprint 1 -- Single Agent Working (Dispatch Only)
**Objective:** Un singolo agente (Dispatch) che risponde in streaming via chat. Nessun Manager, nessun multi-agente. Solo la pipeline completa: frontend -> API route -> LLM -> streaming -> frontend.

**Verifiable Output:** L'utente scrive un messaggio, l'agente Dispatch risponde in streaming con testo che appare progressivamente. Il nome "FleetMind Dispatch" e il colore blu appaiono nell'UI.

**Dependencies:** Sprint 0 completato.

**Specific Risks:**
- R4 (Streaming mal configurato) -- verificare che `streamText` funziona con il provider Anthropic
- R5 (API key) -- verificare che la chiave e in `.env.local` e il backend la legge correttamente

**Complexity Estimate:** MEDIUM

---

## Sprint 2 -- Manager + Multi-Agent Routing
**Objective:** Aggiungere il Manager Agent che classifica l'intento e i 3 agenti specializzati. Ogni messaggio passa per il Manager che decide quale agente risponde.

**Verifiable Output:**
- Messaggio generico su trasporti -> risponde Dispatch (blu)
- Messaggio su scadenze/normative -> risponde Compliance (ambra)
- Messaggio "come faccio a..." -> risponde Support (verde)
- L'indicatore agente nell'UI cambia nome e colore correttamente

**Dependencies:** Sprint 1 completato.

**Specific Risks:**
- R2 (Routing incoerente) -- testare con almeno 5 messaggi di tipo diverso per verificare che il Manager rotta correttamente
- R3 (Latenza doppia chiamata) -- verificare che il tempo totale (Manager + Agente) sia accettabile con streaming

**Complexity Estimate:** HIGH

---

## Sprint 3 -- Knowledge Base Injection
**Objective:** Creare le 4 KB (shared + 3 verticali) e iniettarle nel contesto di ogni agente. Verificare che le risposte usino informazioni dalla KB e non inventino dati.

**Verifiable Output:**
- Dispatch risponde con informazioni reali sulla scorecard a 7 punti, pre-filtro, regole di assegnazione
- Compliance risponde con dati MIT reali (EUR/km per classe), date normative 2026, limiti ore guida EU 561/2006
- Support risponde con procedure step-by-step per configurare API key, creare ordini, usare il dispatch

**Dependencies:** Sprint 2 completato.

**Specific Risks:**
- R6 (KB troppo lunga) -- monitorare la lunghezza totale del contesto (system prompt + shared KB + vertical KB + cronologia)
- R7 (Allucinazioni su normative) -- testare specificamente con domande su tariffe MIT e regolamenti per verificare che l'agente usa solo dati dalla KB

**Complexity Estimate:** MEDIUM

---

## Sprint 4 -- End-to-End Flow with Transitions
**Objective:** Testare il flusso completo con transizioni tra agenti durante una singola conversazione. Verificare che il Manager gestisce correttamente i cambi di contesto.

**Verifiable Output:**
- Conversazione test: utente chiede di dispatch -> chiede di compliance -> torna a dispatch -> chiede support. Ogni transizione avviene correttamente con cambio di agente nell'UI.
- L'agente mantiene coerenza: non switcha ad ogni messaggio, ma solo quando c'e un cambio di intento chiaro.
- Messaggi di acknowledgment ("ok", "grazie", "capito") restano con l'agente corrente.

**Dependencies:** Sprint 3 completato.

**Specific Risks:**
- R2 (Routing incoerente) -- testare edge cases: messaggi ambigui, saluti, cambio rapido di argomento
- R1 (Context overflow) -- verificare che la cronologia viene troncata correttamente dopo 20 messaggi

**Complexity Estimate:** HIGH

---

## Sprint 5 -- Bug Fix, Edge Cases & Polish
**Objective:** Correggere tutti i bug trovati nei test, gestire edge cases, e pulire il codice per il deploy finale.

**Verifiable Output:**
- Tutti gli edge case gestiti: messaggio vuoto, messaggio troppo lungo, errore API, primo messaggio senza storia
- UI pulita: indicatore agente visibile, colori corretti, scrolling automatico alla nuova risposta
- Nessun errore nella console del browser
- Deploy finale su Vercel funzionante e accessibile via URL pubblico

**Dependencies:** Sprint 4 completato.

**Specific Risks:**
- R4 (Streaming) -- verificare che lo streaming funziona anche su Vercel (non solo in locale)
- R3 (Latenza) -- verificare tempi di risposta accettabili in produzione

**Complexity Estimate:** MEDIUM

---

## Riepilogo Sprint

| Sprint | Nome | Complessita | Output Chiave |
|--------|------|-------------|---------------|
| 0 | Pre-flight Check | LOW | Infrastruttura verificata |
| 1 | Single Agent (Dispatch) | MEDIUM | Chat funzionante con 1 agente + streaming |
| 2 | Manager + Multi-Agent | HIGH | Routing a 3 agenti con Manager JSON |
| 3 | KB Injection | MEDIUM | Risposte basate su KB reali |
| 4 | End-to-End Flow | HIGH | Transizioni corrette tra agenti |
| 5 | Bug Fix & Polish | MEDIUM | Deploy finale pulito |
