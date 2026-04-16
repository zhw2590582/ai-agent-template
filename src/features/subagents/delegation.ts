import type { UIMessage } from 'ai';

export interface DelegateToSubagentInput {
  subagentId: string;
  task: string;
}

export interface DelegateToSubagentOutput {
  message: UIMessage;
  subagentDescription: string;
  subagentId: string;
  subagentName: string;
  subagentThemeColor: string;
  summary: string;
  task: string;
}

function hasOwnString(value: Record<string, unknown>, key: string) {
  return typeof value[key] === 'string';
}

export function isDelegateToSubagentInput(value: unknown): value is DelegateToSubagentInput {
  if (typeof value !== 'object' || value == null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return hasOwnString(record, 'subagentId') && hasOwnString(record, 'task');
}

export function isDelegateToSubagentOutput(value: unknown): value is DelegateToSubagentOutput {
  if (typeof value !== 'object' || value == null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.message === 'object' &&
    record.message != null &&
    hasOwnString(record, 'subagentDescription') &&
    hasOwnString(record, 'subagentId') &&
    hasOwnString(record, 'subagentName') &&
    hasOwnString(record, 'subagentThemeColor') &&
    hasOwnString(record, 'summary') &&
    hasOwnString(record, 'task')
  );
}

export function getDelegateToSubagentSummary(message: UIMessage, fallback: string) {
  const lastTextPart = [...message.parts]
    .reverse()
    .find(
      (part): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
        part.type === 'text' && part.text.trim().length > 0
    );

  return lastTextPart?.text.trim() || fallback;
}
