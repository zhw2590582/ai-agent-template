export interface EmbeddingProvider {
  embedDocuments(inputs: string[]): Promise<number[][]>;
  embedQuery(input: string): Promise<number[]>;
}
