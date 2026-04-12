# FleetMind Chatbot Agent - Master Brief

> **Cos'e questo documento:** Il brief completo del progetto. Contiene tutto quello che serve per capire cosa stiamo costruendo, per chi, con quale tecnologia, e quali sono i confini. Ogni sistema AI coinvolto nel progetto (AntiGravity, Claude, ChatGPT) deve leggere questo documento come primo contesto prima di fare qualsiasi cosa.

---

## 1. Obiettivo del Progetto

Costruire un chatbot web per **FleetMind**, un SaaS italiano di fleet management e dispatch planning per aziende di trasporto PMI. Il chatbot permette agli operatori logistici di interagire con un sistema di assistenti AI specializzati che li guida nelle operazioni quotidiane: dalla pianificazione dei trasporti, alla gestione della compliance normativa, fino all'assistenza tecnica sulla piattaforma.

Il sistema e composto da 4 agenti AI:

- **Manager Agent** -- legge la conversazione, capisce l'intento dell'utente, e attiva autonomamente l'agente specializzato corretto
- **FleetMind Dispatch** -- aiuta l'operatore a pianificare assegnazioni ordini-autisti-mezzi, ottimizzare rotte, verificare disponibilita e gestire il dispatch giornaliero
- **FleetMind Compliance** -- risponde su scadenze documenti (patenti, CQC, ADR, tachigrafi), normativa EU 561/2006, costi minimi MIT, zone LEZ, e calendario regolatorio
- **FleetMind Support** -- risolve problemi sulla piattaforma (account, impostazioni, fatturazione, errori, onboarding) e guida nell'uso delle funzionalita

L'interfaccia web mostra chiaramente quale agente sta parlando in ogni momento, cambiando nome e colore nell'UI.

## 2. Stack Tecnologico

- **Framework:** Next.js (App Router)
- **Frontend:** React con Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **LLM:** Claude API (Anthropic) via Vercel AI SDK
- **Deploy:** Vercel (Git-based deployment)
- **IDE:** AntiGravity / Claude Code (AI-assisted IDE)
- **Version Control:** Git + GitHub

## 3. Architettura di Massima

```
+-----------------------------------+
|         FRONTEND (React)          |
|  Chat UI con indicatore agente    |
|  Nome + colore cambiano per       |
|  agente attivo                    |
+----------------+------------------+
                 | POST /api/chat
                 v
+-----------------------------------+
|      API ROUTE (Next.js)          |
|                                   |
|  1. Riceve messaggio + history    |
|  2. MANAGER classifica intent     |
|     -> JSON: { agent: "dispatch" }|
|  3. Carica system prompt +        |
|     KB dell'agente selezionato    |
|  4. AGENTE genera risposta        |
|  5. Ritorna: { agent, message,    |
|     color }                       |
+----------------+------------------+
                 |
    +------------+------------+
    v            v            v
+--------+  +----------+  +--------+
|DISPATCH|  |COMPLIANCE|  |SUPPORT |
| Prompt |  |  Prompt  |  | Prompt |
|  + KB  |  |   + KB   |  |  + KB  |
+--------+  +----------+  +--------+
                 |
           +-----+
           v
+-----------------------------------+
|     KNOWLEDGE BASE (file .md)     |
|  Shared KB + 3 Vertical KBs      |
|  Letti a runtime dal server       |
|  Iniettati nel contesto LLM      |
+-----------------------------------+
```

**Flusso per ogni messaggio utente:**

1. Il frontend invia il messaggio + l'intera cronologia della conversazione + l'agente attualmente attivo
2. Il backend chiama il Manager (LLM call leggera, JSON mode) che decide quale agente deve rispondere
3. Il backend carica il system prompt e la KB dell'agente selezionato
4. Il backend chiama l'agente selezionato (LLM call completa, con streaming) passandogli la cronologia e il contesto
5. La risposta viene restituita al frontend con il nome e il colore dell'agente

## 4. Vincoli

- **Tempo:** Il progetto deve essere costruito in circa 4 ore durante una sessione di lavoro collaborativa
- **Competenze:** Il team (Broger + Alessandro) ha esperienza nel prompting, costruzione assistenti con KB, e ha studiato il framework Plan & Solve
- **Nessun database:** La memoria della conversazione vive nello stato React del frontend (session-based). Se l'utente ricarica la pagina, la conversazione riparte da zero
- **Knowledge Base statica:** I file .md vengono letti dal filesystem del server a runtime. Non c'e RAG, non ci sono embeddings, non c'e vector store
- **API key:** Si usa la propria API key Anthropic, configurata in `.env.local`
- **Dominio FleetMind:** Le KB contengono informazioni reali estratte dal SaaS FleetMind (schema DB, normative trasporto, funzionalita piattaforma). Il chatbot e un assistente per operatori logistici, NON un chatbot generico

## 5. Definizione di "Finito"

Il progetto e completo quando:

- L'utente apre la pagina web e vede un chatbot con un messaggio di benvenuto da FleetMind Dispatch
- L'utente puo scrivere messaggi e ricevere risposte in streaming
- Il nome e il colore dell'agente attivo cambiano automaticamente nell'UI in base al contesto della conversazione
- **Dispatch** aiuta a pianificare assegnazioni, suggerisce combinazioni autista-mezzo ottimali, e spiega le regole di assegnazione (peso, ADR, frigo, ore guida)
- **Compliance** risponde su scadenze documenti, normativa 561/2006, costi minimi MIT, zone LEZ, e calendario regolatorio 2026
- **Support** si attiva quando l'utente ha problemi con la piattaforma, chiede come configurare qualcosa, o ha domande su abbonamento/fatturazione
- Il chatbot e deployato su Vercel e accessibile tramite un URL pubblico

## 6. Anti-Goal

- **Non ci serve autenticazione utente.** Il chatbot e un demo standalone, non collegato al SaaS FleetMind reale. Non ci sono account o login.
- **Non ci serve un database.** Nessun dato viene persistito tra sessioni. Zero infrastruttura backend oltre Vercel.
- **Non ci serve il supporto multilingua.** Il chatbot risponde in italiano. Le KB sono in inglese ma l'agente comunica in italiano con l'utente.
- **Non stiamo costruendo un pannello admin.** Nessuna dashboard, nessuna interfaccia di configurazione.
- **Non ci serve un sistema di pagamento.** Il chatbot non processa transazioni Stripe.
- **Non ci serve analytics o tracking.** Nessun sistema di monitoraggio delle conversazioni.
- **Non ci serve il test automatizzato.** La validazione e manuale (conversazione di test).
- **Non stiamo ottimizzando per SEO, performance, o accessibilita avanzata.** E un MVP funzionale per validazione didattica.
- **Non ci serve l'integrazione reale con Google Maps, Anthropic dispatch agent, o il database FleetMind.** Il chatbot usa solo le KB statiche per rispondere, non chiama API esterne ne accede al DB.
- **Non stiamo costruendo il dispatch agent reale di FleetMind.** Il chatbot SIMULA le competenze dell'agente di dispatch tramite le KB, non esegue tool use o chiamate API.

---

## Contesto Didattico

Questo progetto e il **Progetto di Gruppo** del modulo "Technology for Entrepreneurs" presso H-Farm College. Il caso studio FleetMind applica i concetti appresi nelle lezioni precedenti:

- **Lezione 1-2:** Fondamenti di prompting e task decomposition
- **Lezione 3:** Costruzione manuale di assistenti AI -- Knowledge Base condivisa, KB verticali, system prompt STARS, test e meta-prompt
- **Lezione 4-5:** Costruzione di un sistema multi-agente funzionante come web chatbot, usando un IDE AI-assisted con il metodo Plan and Solve

Il team ha gia studiato il progetto ROVE (chatbot multi-agente per L'Astrolabio) e ora replica la stessa architettura adattandola al dominio logistico di FleetMind.

## Identita Visiva degli Agenti

| Agente | Nome UI | Colore |
|--------|---------|--------|
| Dispatch | FleetMind Dispatch | `#3B82F6` (blu) |
| Compliance | FleetMind Compliance | `#F59E0B` (ambra) |
| Support | FleetMind Support | `#22C55E` (verde) |
