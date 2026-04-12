# FleetMind Multi-Agent Chatbot

Multi-agent AI chatbot for FleetMind fleet management SaaS.

**Team:** Broger + Alessandro | **Presentazione:** 18 Aprile 2026 | **Corso:** Technology for Entrepreneurs, H-Farm

## Agents

| Agent | Domain | Color |
|-------|--------|-------|
| FleetMind Dispatch | Order assignment, routing, fleet planning | Blue `#3B82F6` |
| FleetMind Compliance | EU 561/2006, MIT tariffs, LEZ, document expiry | Amber `#F59E0B` |
| FleetMind Support | Platform guidance, troubleshooting, billing | Green `#22C55E` |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure API key
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key

# 3. Start dev server
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts        # Single API endpoint (Manager + Agent + KB)
│   ├── page.tsx                  # Chat UI with streaming
│   ├── layout.tsx                # Root layout (dark theme)
│   └── globals.css               # Tailwind + custom styles
├── components/
│   ├── ChatMessage.tsx           # Message bubble with agent color
│   ├── ChatInput.tsx             # Input bar with send button
│   └── AgentIndicator.tsx        # Agent name + color badge
├── knowledge-base/               # Static .md files (injected at runtime)
│   ├── shared-kb.md              # Company info, features, pricing
│   ├── dispatch-kb.md            # Dispatch rules, scorecard, scenarios
│   ├── compliance-kb.md          # EU regulations, MIT tariffs, LEZ, ADR
│   └── support-kb.md             # Feature guides, troubleshooting
├── prompts/                      # System prompts (STARS framework)
│   ├── manager.ts                # Router (JSON output)
│   ├── dispatch.ts               # Dispatch agent
│   ├── compliance.ts             # Compliance agent
│   └── support.ts                # Support agent
└── lib/
    ├── types.ts                  # TypeScript types
    ├── ai-config.ts              # Anthropic client config
    └── kb-loader.ts              # KB file reader
docs/                             # Plan & Solve documentation
```

## Architecture

```
User message → Manager (Haiku, JSON) → Selected Agent (Sonnet, streaming) → Response
```

Each message goes through two LLM calls:
1. **Manager** classifies intent and picks the right agent
2. **Agent** generates the response using its system prompt + shared KB + vertical KB

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add `ANTHROPIC_API_KEY` in Environment Variables
4. Deploy
