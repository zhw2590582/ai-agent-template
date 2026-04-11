import type { UIMessage } from 'ai';

export function getTextContent(message: UIMessage) {
  return message.parts
    .filter(
      (
        part,
      ): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
        part.type === 'text',
    )
    .map(part => part.text)
    .join('\n');
}

export function getToolParts(message: UIMessage) {
  return message.parts.filter(
    (
      part,
    ): part is Extract<(typeof message.parts)[number], { type: `tool-${string}` }> =>
      part.type.startsWith('tool-'),
  );
}

