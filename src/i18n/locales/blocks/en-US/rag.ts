export const enUSRagMessages = {
  rag_page: {
    title: 'RAG',
    description:
      'Configure retrieval settings for your private knowledge base. Document import and source rendering will be added in later iterations.',
    api_key_label: 'Embedding API key',
    api_key_description:
      'Used to generate embeddings for retrieval. This key is stored in your profile settings.',
    api_key_placeholder: 'Enter your embedding API key',
    api_key_hint:
      'RAG retrieval needs an embedding API key. A server-level fallback can still be configured for development.',
    enabled_label: 'Enable RAG',
    enabled_description:
      'Allow chat requests to retrieve relevant chunks from your indexed knowledge base before answering.',
    knowledge_title: 'Knowledge Base',
    knowledge_description:
      'Scope retrieval to one knowledge base when needed. Leave it empty later if you want cross-base retrieval.',
    knowledge_base_id_label: 'Knowledge Base ID',
    knowledge_base_id_placeholder: 'Enter a knowledge base ID',
    knowledge_base_id_hint:
      'This is a temporary input for V1. A proper knowledge base picker will replace it later.',
    retrieval_title: 'Retrieval',
    retrieval_description:
      'Tune how many chunks are returned and how much retrieved context is injected into the model.',
    match_count_label: 'Top K',
    match_threshold_label: 'Similarity Threshold',
    max_context_characters_label: 'Max Context Characters',
    toast: {
      save_failed: 'Failed to save RAG settings.',
      save_success: 'RAG settings saved.',
    },
  },
} as const;
