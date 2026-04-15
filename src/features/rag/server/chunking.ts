import { RAG_CONFIG } from '@/config/rag';

function normalizeText(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/\t/g, '  ').trim();
}

export function chunkDocumentText(text: string) {
  const normalized = normalizeText(text);

  if (normalized.length === 0) {
    return [];
  }

  const chunks: string[] = [];
  const size = RAG_CONFIG.CHUNK_SIZE_CHARACTERS;
  const overlap = RAG_CONFIG.CHUNK_OVERLAP_CHARACTERS;
  let start = 0;

  while (start < normalized.length) {
    const hardEnd = Math.min(start + size, normalized.length);
    let end = hardEnd;

    if (hardEnd < normalized.length) {
      const breakCandidates = [
        normalized.lastIndexOf('\n\n', hardEnd),
        normalized.lastIndexOf('\n', hardEnd),
        normalized.lastIndexOf('. ', hardEnd),
        normalized.lastIndexOf(' ', hardEnd),
      ].filter((index) => index > start + Math.floor(size * 0.6));

      if (breakCandidates.length > 0) {
        end = Math.max(...breakCandidates);
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}
