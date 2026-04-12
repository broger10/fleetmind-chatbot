# FleetMind Chatbot -- Setup Guide (Fase 1)

> **Obiettivo:** Avere un progetto Next.js funzionante in locale, collegato a GitHub e Vercel, pronto per ricevere codice. Tempo stimato: 30 minuti.

---

## Pre-requisiti

Prima di iniziare, verifica di avere:

- [ ] Account GitHub (gratuito)
- [ ] Account Vercel (gratuito, collegato a GitHub)
- [ ] Account AntiGravity (Google AI IDE) -- o altro IDE (Claude Code, Cursor)
- [ ] API Key Anthropic (Claude) -- da https://console.anthropic.com
- [ ] Node.js installato (v18+) -- verifica con `node -v` nel terminale

---

## Step 1 -- Creare il Repository GitHub

1. Vai su https://github.com/new
2. Nome repository: `fleetmind-chatbot`
3. Descrizione: `Multi-agent AI chatbot for FleetMind fleet management SaaS`
4. Visibilita: **Public** (serve per Vercel free tier)
5. Spunta **Add a README file**
6. Add .gitignore: seleziona **Node**
7. Clicca **Create repository**

---

## Step 2 -- Inizializzare il Progetto Next.js

Apri il terminale e clona il repo:

```bash
git clone https://github.com/TUO-USERNAME/fleetmind-chatbot.git
cd fleetmind-chatbot
```

Crea il progetto Next.js (App Router):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Quando chiede se sovrascrivere file esistenti, conferma con **Yes**.

Installa le dipendenze per il chatbot:

```bash
npm install ai @ai-sdk/anthropic
```

Verifica che funziona:

```bash
npm run dev
```

Apri http://localhost:3000 -- devi vedere la pagina default di Next.js.

---

## Step 3 -- Configurare le Environment Variables

Crea il file `.env.local` nella root del progetto:

```bash
touch .env.local
```

Apri `.env.local` e aggiungi:

```
ANTHROPIC_API_KEY=sk-ant-api03-LA-TUA-CHIAVE-QUI
```

**IMPORTANTE:** Verifica che `.env.local` sia nel `.gitignore` (lo e gia di default con Next.js). Non committare MAI l'API key.

---

## Step 4 -- Creare la Struttura Cartelle

Crea le cartelle del progetto:

```bash
# Cartella per le Knowledge Base
mkdir -p src/knowledge-base

# Cartella per i system prompt degli agenti
mkdir -p src/prompts

# Cartella per le utility (config LLM, helpers)
mkdir -p src/lib

# Cartella per i componenti React
mkdir -p src/components

# L'API route la crea Next.js in src/app/api/chat/
mkdir -p src/app/api/chat
```

La struttura finale deve essere:

```
fleetmind-chatbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          <- API route (backend)
│   │   ├── layout.tsx                 <- Layout principale
│   │   ├── page.tsx                   <- Chat UI (frontend)
│   │   └── globals.css                <- Stili Tailwind
│   ├── components/
│   │   ├── ChatMessage.tsx            <- Singolo messaggio con nome/colore
│   │   ├── ChatInput.tsx              <- Input bar con submit
│   │   └── AgentIndicator.tsx         <- Badge agente attivo
│   ├── knowledge-base/
│   │   ├── shared-kb.md               <- KB condivisa (tutti gli agenti)
│   │   ├── dispatch-kb.md             <- KB verticale Dispatch
│   │   ├── compliance-kb.md           <- KB verticale Compliance
│   │   └── support-kb.md              <- KB verticale Support
│   ├── prompts/
│   │   ├── manager.ts                 <- System prompt Manager
│   │   ├── dispatch.ts                <- System prompt Dispatch STARS
│   │   ├── compliance.ts              <- System prompt Compliance STARS
│   │   └── support.ts                 <- System prompt Support STARS
│   └── lib/
│       ├── ai-config.ts               <- Configurazione client Anthropic
│       ├── kb-loader.ts               <- Funzione per leggere file .md
│       └── types.ts                   <- TypeScript types condivisi
├── .env.local                         <- API key (NON committare)
├── .gitignore
├── vercel.json                        <- Config timeout serverless
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Step 5 -- Collegare a Vercel

1. Vai su https://vercel.com/new
2. Clicca **Import Git Repository**
3. Seleziona `fleetmind-chatbot`
4. Framework Preset: **Next.js** (auto-detected)
5. Vai in **Environment Variables** e aggiungi:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-LA-TUA-CHIAVE-QUI`
6. Clicca **Deploy**

Vercel fara il primo deploy (sara la pagina default di Next.js). Da ora, ogni push su `main` triggera un deploy automatico.

**Nota:** Se il deploy fallisce con timeout, vai in Settings > Functions e imposta il timeout a 30 secondi (necessario per le chiamate LLM).

---

## Step 6 -- Aprire nell'IDE

### Se usi AntiGravity:
1. Vai su AntiGravity (https://antigravity.dev o il link fornito dal docente)
2. Importa il repository GitHub `fleetmind-chatbot`
3. Verifica che l'ambiente riconosca Node.js e che `npm run dev` funzioni
4. Carica i file di contesto nel pannello AI dell'IDE:
   - `01_Master_Brief.md`
   - `02_Risk_and_Constraints.md`
   - Le IDE Rules (`02_IDE_RULES.md`)

### Se usi Claude Code:
1. Apri il terminale nella cartella del progetto
2. Avvia Claude Code: `claude`
3. Il file `CLAUDE.md` nella root del progetto viene letto automaticamente
4. Copia il contenuto di `02_IDE_RULES.md` in `CLAUDE.md`

---

## Step 7 -- Primo Commit di Verifica

```bash
git add -A
git commit -m "chore: project scaffolding with Next.js, Tailwind, Vercel AI SDK"
git push origin main
```

Vai su Vercel e verifica che il deploy automatico parta e vada a buon fine.

---

## Checklist Fase 1 Completata

- [ ] Repo GitHub creato e clonato
- [ ] Next.js funzionante in locale (`npm run dev` -> localhost:3000)
- [ ] `.env.local` con API key Anthropic, non committato
- [ ] Dipendenze installate: `ai`, `@ai-sdk/anthropic`
- [ ] Struttura cartelle creata (`knowledge-base/`, `prompts/`, `lib/`, `components/`)
- [ ] Vercel collegato con environment variable configurata
- [ ] Primo deploy andato a buon fine su Vercel
- [ ] Progetto aperto nell'IDE con documenti di contesto caricati

Quando tutto e spuntato, si passa alla **Fase 2: Master Plan + Esecuzione Sprint**.
