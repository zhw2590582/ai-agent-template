import { PDFParse } from 'pdf-parse';

import { TEXT_LIMITS } from '@/config/limits';
import { RAG_CONFIG } from '@/config/rag';
import { AppError, ErrorCode } from '@/lib/errors';

const SUPPORTED_FILE_TYPES = new Map([
  ['application/pdf', 'pdf'],
  ['text/plain', 'txt'],
  ['text/markdown', 'md'],
  ['text/x-markdown', 'md'],
  ['application/octet-stream', 'txt'],
]);

function inferFileType(file: File) {
  const normalizedType = file.type.toLowerCase();

  if (SUPPORTED_FILE_TYPES.has(normalizedType)) {
    return SUPPORTED_FILE_TYPES.get(normalizedType)!;
  }

  const extension = file.name.toLowerCase().split('.').pop();

  if (extension === 'pdf' || extension === 'md' || extension === 'txt') {
    return extension;
  }

  throw new AppError(
    ErrorCode.INPUT_INVALID,
    'Unsupported RAG file type. Only .txt, .md, and .pdf files are supported.',
    400
  );
}

function normalizeExtractedText(text: string) {
  return text
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .trim();
}

function buildDefaultTitle(file: File) {
  const name = file.name.trim();
  const lastDotIndex = name.lastIndexOf('.');

  if (lastDotIndex <= 0) {
    return name || 'Untitled document';
  }

  return name.slice(0, lastDotIndex).trim() || name;
}

async function parsePdfFile(file: File) {
  const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) });

  try {
    const result = await parser.getText();
    return normalizeExtractedText(result.text);
  } finally {
    await parser.destroy();
  }
}

export async function parseRagDocumentFile(file: File) {
  if (file.size <= 0) {
    throw new AppError(ErrorCode.INPUT_INVALID, 'The uploaded file is empty.', 400);
  }

  if (file.size > RAG_CONFIG.MAX_FILE_BYTES) {
    throw new AppError(
      ErrorCode.INPUT_TOO_LONG,
      `The uploaded file exceeds the ${Math.floor(RAG_CONFIG.MAX_FILE_BYTES / (1024 * 1024))} MB limit.`,
      400
    );
  }

  const fileType = inferFileType(file);
  const content =
    fileType === 'pdf' ? await parsePdfFile(file) : normalizeExtractedText(await file.text());

  if (!content) {
    throw new AppError(
      ErrorCode.INPUT_INVALID,
      'No text could be extracted from the uploaded document.',
      400
    );
  }

  if (content.length > TEXT_LIMITS.RAG_DOCUMENT_CONTENT) {
    throw new AppError(
      ErrorCode.INPUT_TOO_LONG,
      'The extracted document text is too long to index.',
      400
    );
  }

  return {
    content,
    fileName: file.name,
    fileSize: file.size,
    fileType,
    mimeType: file.type || null,
    title: buildDefaultTitle(file),
  };
}
