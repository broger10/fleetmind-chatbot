import { createAnthropic } from '@ai-sdk/anthropic';

// Client Anthropic — reads ANTHROPIC_API_KEY from .env.local automatically
export const anthropic = createAnthropic({});

// Manager: fast model for JSON classification
export const managerModel = anthropic('claude-haiku-4-5-20251001');

// Agents: full model for quality responses
export const agentModel = anthropic('claude-sonnet-4-5-20241022');
