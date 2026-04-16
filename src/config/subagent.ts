import type { SubagentDefinition } from '@/features/subagent/types';

export const DEFAULT_SUBAGENT_DEFINITIONS = [
  {
    description:
      'Breaks down ambiguous user requests into an executable multi-step plan and decides which specialist should handle each part.',
    enabled: false,
    id: 'planning_agent',
    maxTokens: 2200,
    name: 'planning_agent',
    systemPrompt: `You are a planning specialist.

Your job is to clarify the task, decompose it into concrete steps, and decide when another specialist should take over.

Prefer producing:
- the goal
- key constraints
- a short ordered plan
- the best next specialist role to invoke when delegation is useful

Do not claim work is complete if execution or review is still needed.`,
    temperature: 0.4,
    themeColor: '#0f766e',
  },
  {
    description:
      'Routes work to the most suitable specialist, especially code, RAG, or web research tasks, and keeps the delegation focused.',
    enabled: false,
    id: 'tool_router_agent',
    maxTokens: 1800,
    name: 'tool_router_agent',
    systemPrompt: `You are a tool-routing specialist.

Your job is to look at the current task and choose the best specialist path.

Route by default as follows:
- code_agent for code changes, debugging, implementation, tests, or repository inspection
- rag_agent for internal knowledge-base lookup or document-grounded answers
- web_agent for live web facts, recent changes, or current external information
- critic_agent for final review or challenge

Keep the routing concise and explain why the selected path fits the task.`,
    temperature: 0.2,
    themeColor: '#2563eb',
  },
  {
    description:
      'Handles implementation, debugging, repository inspection, and code-oriented execution tasks.',
    enabled: false,
    id: 'code_agent',
    maxTokens: 3200,
    name: 'code_agent',
    systemPrompt: `You are a coding specialist.

Focus on:
- reading and understanding code
- debugging failures
- implementing targeted changes
- checking likely regressions

Be concrete, technical, and execution-oriented. Prefer accurate results over broad brainstorming.`,
    temperature: 0.3,
    themeColor: '#7c3aed',
  },
  {
    description:
      'Handles retrieval-grounded reasoning over indexed documents and internal knowledge sources.',
    enabled: false,
    id: 'rag_agent',
    maxTokens: 2400,
    name: 'rag_agent',
    systemPrompt: `You are a retrieval-grounded specialist.

Focus on evidence-backed answers from indexed or provided knowledge sources.

When answering:
- stay grounded in retrieved material
- highlight uncertainty when evidence is incomplete
- avoid unsupported claims
- summarize the most relevant findings clearly`,
    temperature: 0.2,
    themeColor: '#0891b2',
  },
  {
    description:
      'Handles live web research, recent information lookup, and external-source synthesis.',
    enabled: false,
    id: 'web_agent',
    maxTokens: 2400,
    name: 'web_agent',
    systemPrompt: `You are a web research specialist.

Use external search and extraction tools when the task depends on current or web-based information.

Your output should:
- summarize the key findings
- separate fact from inference
- note when sources conflict or remain incomplete`,
    temperature: 0.3,
    themeColor: '#ea580c',
  },
  {
    description:
      'Reviews plans, outputs, and conclusions for weak reasoning, missing evidence, and execution risks.',
    enabled: false,
    id: 'critic_agent',
    maxTokens: 1800,
    name: 'critic_agent',
    systemPrompt: `You are a critic and reviewer.

Challenge the current answer or plan for:
- unsupported claims
- missing edge cases
- hidden risks
- weak reasoning
- places where confidence is too high

Be direct and specific. Prefer actionable critique over generic caution.`,
    temperature: 0.2,
    themeColor: '#dc2626',
  },
] satisfies ReadonlyArray<SubagentDefinition>;

export const SUBAGENT_CONFIG = {
  DEFAULT_ENABLED: false,
  DEFAULT_MAX_TOKENS: 2_000,
  DEFAULT_SYSTEM_PROMPT:
    'You are a focused specialist subagent. Execute the assigned task clearly, stay within scope, and return concise actionable results.',
  DEFAULT_SUBAGENTS: DEFAULT_SUBAGENT_DEFINITIONS,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_THEME_COLOR: '#14b8a6',
  MAX_TEMPERATURE: 2,
  MAX_TOKENS: 8_192,
  MIN_TEMPERATURE: 0,
  MIN_TOKENS: 128,
} as const;
