# FleetMind Chatbot -- IDE Rules

> **Cos'e questo documento:** Le regole operative per l'IDE AI-assisted (AntiGravity o qualsiasi altro). Ogni riga di codice generata dall'AI deve rispettare queste regole. Carica questo file come contesto nell'IDE prima di iniziare qualsiasi sprint. Generato seguendo il Prompt #3 del Plan & Solve Framework.

---

## Project Context

FleetMind Assistant e un chatbot web multi-agente per FleetMind, un SaaS italiano di fleet management per PMI del trasporto. Il sistema usa 4 agenti AI (Manager, Dispatch, Compliance, Support) orchestrati via un Manager che classifica l'intento dell'utente in JSON e attiva l'agente corretto. Stack: Next.js 14+ (App Router), React, Tailwind CSS, Vercel AI SDK con Claude API (Anthropic). Deploy su Vercel.

---

## File Structure (Exact Paths)

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts              # Unica API route -- tutto il backend passa da qui
│   ├── layout.tsx                     # Root layout con font e metadata
│   ├── page.tsx                       # Chat UI -- componente principale
│   └── globals.css                    # Tailwind directives + custom styles
├── components/
│   ├── ChatMessage.tsx                # Singolo messaggio con nome/colore agente
│   ├── ChatInput.tsx                  # Input bar con submit
│   └── AgentIndicator.tsx             # Badge che mostra l'agente attivo
├── knowledge-base/
│   ├── shared-kb.md                   # KB condivisa -- iniettata per TUTTI gli agenti
│   ├── dispatch-kb.md                 # KB verticale Dispatch
│   ├── compliance-kb.md               # KB verticale Compliance
│   └── support-kb.md                  # KB verticale Support
├── prompts/
│   ├── manager.ts                     # System prompt Manager (export const)
│   ├── dispatch.ts                    # System prompt Dispatch STARS
│   ├── compliance.ts                  # System prompt Compliance STARS
│   └── support.ts                     # System prompt Support STARS
└── lib/
    ├── ai-config.ts                   # Client Anthropic + modelli (haiku per Manager, sonnet per agenti)
    ├── kb-loader.ts                   # Funzione che legge i file .md da knowledge-base/
    └── types.ts                       # AgentType, ChatMessage, ManagerResponse types
```

**REGOLA:** Non creare file fuori da questa struttura senza motivazione esplicita. Non creare cartelle `utils/`, `services/`, `hooks/` a meno che un task specifico lo richieda.

---

## Naming Conventions

- **File:** `kebab-case` per file non-componente (`ai-config.ts`, `kb-loader.ts`)
- **Componenti React:** `PascalCase` (`ChatMessage.tsx`, `AgentIndicator.tsx`)
- **Variabili e funzioni:** `camelCase` (`currentAgent`, `getSystemPrompt`)
- **Costanti:** `UPPER_SNAKE_CASE` (`AGENT_COLORS`, `MAX_HISTORY_LENGTH`)
- **Types/Interfaces:** `PascalCase` (`AgentType`, `ManagerResponse`)
- **API route:** Sempre `route.ts` dentro la cartella che definisce il path

---

## Mandatory Patterns

### 1. Tutte le chiamate LLM passano SOLO da `/api/chat`
Il frontend non chiama MAI direttamente l'API Anthropic. Ogni interazione LLM avviene server-side nella API route.

### 2. Doppia chiamata LLM per ogni messaggio
```
Messaggio utente -> Manager (classificazione, JSON mode) -> Agente specializzato (risposta, streaming)
```
La prima chiamata (Manager) usa il modello veloce (`claude-haiku-4-5-20251001`). La seconda (agente) usa il modello completo (`claude-sonnet-4-5-20241022`).

### 3. Manager output in JSON strutturato
Il Manager restituisce SOLO:
```json
{ "agent": "dispatch" | "compliance" | "support", "reason": "..." }
```
Parsare con `JSON.parse()`. Se il parse fallisce, fallback all'agente corrente o `dispatch`.

### 4. Knowledge Base iniettata a runtime
```typescript
// kb-loader.ts
import { readFileSync } from 'fs';
import path from 'path';

export function loadKB(filename: string): string {
  const filePath = path.join(process.cwd(), 'src', 'knowledge-base', filename);
  return readFileSync(filePath, 'utf-8');
}
```
Le KB vengono lette dal filesystem del server, NON importate come moduli JS.

### 5. Streaming con Vercel AI SDK
Usare `streamText` da `ai` per la risposta dell'agente. Usare `generateText` per il Manager (non serve streaming per la classificazione JSON).

### 6. History management
La cronologia della conversazione vive nello stato React del frontend. Troncare a 20 messaggi massimo prima di inviarli al backend. Includere sempre `current_agent` nella request.

### 7. Gestione errori API
Ogni chiamata LLM deve avere try/catch. Se il Manager fallisce, usare l'agente corrente come fallback. Se l'agente fallisce, restituire un messaggio di errore user-friendly in italiano.

### 8. Colori agenti come costante
```typescript
export const AGENT_COLORS = {
  dispatch: '#3B82F6',     // blu
  compliance: '#F59E0B',   // ambra
  support: '#22C55E',      // verde
} as const;

export const AGENT_NAMES = {
  dispatch: 'FleetMind Dispatch',
  compliance: 'FleetMind Compliance',
  support: 'FleetMind Support',
} as const;
```

---

## Forbidden Patterns

- **MAI** importare `@ai-sdk/anthropic` o chiamare l'API Anthropic nel frontend (file dentro `src/app/page.tsx` o `src/components/`)
- **MAI** mettere l'API key in un file diverso da `.env.local`
- **MAI** committare `.env.local` su Git
- **MAI** usare `localStorage` o `sessionStorage` per la cronologia chat -- usare solo stato React (`useState`)
- **MAI** creare endpoint API aggiuntivi oltre `/api/chat` -- tutto passa da li
- **MAI** usare `getServerSideProps` o `getStaticProps` -- siamo in App Router, usare Route Handlers
- **MAI** hardcodare system prompt come stringhe inline nella API route -- devono stare in `src/prompts/*.ts`
- **MAI** hardcodare testo delle KB inline -- devono essere letti da `src/knowledge-base/*.md`
- **MAI** usare `fetch` nel frontend per chiamare API esterne -- solo `/api/chat`
- **MAI** installare database, ORM, o state management libraries (Redux, Zustand)

---

## Libraries & Dependencies

### USA (gia installate o da installare)
- `next` (14+) -- framework
- `react`, `react-dom` (18+) -- UI
- `ai` (latest) -- Vercel AI SDK core
- `@ai-sdk/anthropic` (latest) -- Provider Anthropic per Vercel AI SDK
- `tailwindcss` -- styling (gia incluso da create-next-app)
- `typescript` -- type safety

### NON USARE
- `langchain` -- troppo complesso per questo progetto
- `openai` (npm package) -- usiamo `@ai-sdk/anthropic` via Vercel AI SDK
- `axios` -- usare `fetch` nativo o il SDK
- `express` -- usiamo le API routes di Next.js
- `prisma`, `drizzle`, `mongoose` -- nessun database
- `zustand`, `redux`, `jotai` -- stato React base e sufficiente
- `socket.io` -- lo streaming e gestito dal Vercel AI SDK

---

## Security

- API key: SOLO in `.env.local`, accesso SOLO server-side via `process.env.ANTHROPIC_API_KEY`
- Validare l'input utente nel backend (lunghezza massima messaggio: 2000 caratteri)
- Sanitizzare l'output LLM prima di renderizzarlo (React lo fa di default con JSX)
- Rate limiting: non implementato in questo MVP (Vercel ha protezioni base)
- CORS: gestito automaticamente da Next.js API routes (same-origin)

---

## Code Style

- Funzioni: massimo 50 righe. Se piu lunghe, estrarre in funzioni separate
- Commenti: in inglese, solo dove il "perche" non e ovvio dal codice
- Ogni file `.ts`/`.tsx` esporta esattamente una cosa principale (componente, funzione, o costante)
- Usare `const` di default, `let` solo quando necessario, mai `var`
- Preferire arrow functions per componenti e callbacks
- Usare template literals per costruire system prompt con KB iniettate
- Tipizzare tutto: no `any`, no implicit types su parametri di funzione

---

## Vercel Deploy Notes

- Il timeout delle serverless functions su free tier e 10 secondi. Potrebbe non bastare per la doppia chiamata LLM. Soluzioni:
  1. Usare streaming (la funzione resta aperta ma il timeout si applica al primo byte)
  2. Se necessario, configurare il timeout a 30s in `vercel.json`:
  ```json
  {
    "functions": {
      "src/app/api/chat/route.ts": {
        "maxDuration": 30
      }
    }
  }
  ```
- Environment variables: configurare `ANTHROPIC_API_KEY` nel dashboard Vercel (Settings > Environment Variables)
- Il file system (`readFileSync` per le KB) funziona su Vercel perche i file sono inclusi nel bundle di deploy
