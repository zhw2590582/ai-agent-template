export const enUSRagMessages = {
  rag_page: {
    title: 'RAG',
    description:
      'Configure retrieval settings for your private knowledge base. Document import and source rendering will be added in later iterations.',
    get_api_key: 'Get API key',
    api_key_label: 'Embedding API key',
    api_key_description:
      'Used to generate embeddings for retrieval. This key is stored in your profile settings.',
    api_key_placeholder: 'Enter your embedding API key',
    api_key_hint:
      'RAG retrieval needs an embedding API key. A server-level fallback can still be configured for development.',
    enabled_label: 'Enable RAG',
    enabled_description:
      'Allow chat requests to retrieve relevant chunks from your indexed knowledge base before answering.',
    retrieval_title: 'Retrieval',
    retrieval_description:
      'Tune how many chunks are returned and how much retrieved context is injected into the model.',
    test_connection: 'Test connection',
    match_count_label: 'Top K',
    match_threshold_label: 'Similarity Threshold',
    max_context_characters_label: 'Max Context Characters',
    toast: {
      save_failed: 'Failed to save RAG settings.',
      save_success: 'RAG settings saved.',
      test_failed: 'Failed to test the RAG embedding connection.',
      test_success: 'RAG embedding connection succeeded ({dimensions} dimensions).',
    },
  },
} as const;
