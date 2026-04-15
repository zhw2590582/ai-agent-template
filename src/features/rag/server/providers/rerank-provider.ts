export interface RerankedDocument {
  index: number;
  score: number;
}

export interface RerankProvider {
  rerank(args: { documents: string[]; query: string; topK: number }): Promise<RerankedDocument[]>;
}
