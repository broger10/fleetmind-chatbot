# FleetMind Chatbot -- IDE Rules

Read `docs/02_IDE_RULES.md` for the complete operational rules.

## Quick Reference

- **Project:** Multi-agent chatbot for FleetMind (fleet management SaaS)
- **Agents:** Manager (router) + Dispatch (blue) + Compliance (amber) + Support (green)
- **Stack:** Next.js App Router, React, Tailwind, Vercel AI SDK, Claude API
- **Single endpoint:** ALL LLM calls go through `/api/chat`
- **Double LLM call:** Manager (Haiku, JSON) -> Agent (Sonnet, streaming)
- **KB injection:** Static .md files read at runtime from `src/knowledge-base/`
- **No database, no auth, no external APIs**

## Forbidden

- Never expose API keys in frontend code
- Never create API endpoints beyond `/api/chat`
- Never use localStorage for chat history (use React state)
- Never install database ORMs or state management libraries
- Never hardcode prompts inline -- they live in `src/prompts/*.ts`
