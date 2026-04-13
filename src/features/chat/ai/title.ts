function cleanTitle(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim()
    .slice(0, 60);
}

export async function generateConversationTitle(input: string) {
  const normalized = cleanTitle(input);

  if (!normalized) {
    return 'New Chat';
  }

  const firstSentence = normalized.split(/[.!?。！？\n]/)[0]?.trim() ?? normalized;
  return cleanTitle(firstSentence || normalized);
}
