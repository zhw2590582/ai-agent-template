export const enUSRagMessages = {
  rag_page: {
    title: 'RAG',
    description:
      'Configure retrieval settings for your private knowledge base and index uploaded source documents for retrieval.',
    get_api_key: 'Get API Key',
    api_key_label: 'Voyage API Key',
    api_key_description:
      'Used to generate retrieval embeddings with Voyage. This key is stored in your profile settings.',
    api_key_placeholder: 'Enter your Voyage API Key',
    api_key_hint: 'RAG retrieval needs your own Voyage API Key.',
    enabled_label: 'Enable RAG',
    enabled_description:
      'Allow chat requests to retrieve relevant chunks from your indexed knowledge base before answering.',
    import_title: 'Import Documents',
    import_description:
      'Upload a .txt, .md, or .pdf file. We will extract text, chunk it, generate embeddings, and store it in your private vector index.',
    document_title_label: 'Document Title',
    document_title_placeholder: 'Enter a document title',
    document_source_label: 'Source',
    document_source_placeholder: 'Optional source URL or label',
    document_file_label: 'Document File',
    document_file_hint: 'Accepted formats: .txt, .md, .pdf.',
    import_action: 'Import document',
    documents_title: 'Documents',
    documents_description:
      'Manage the documents currently indexed for retrieval in your private knowledge base.',
    documents_loading: 'Loading indexed documents...',
    documents_empty: 'No indexed documents yet. Import one above to make RAG useful.',
    documents_chunks: '{count} chunks',
    documents_characters: '{count} characters',
    document_delete: 'Delete document',
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
      import_failed: 'Failed to import the RAG document.',
      import_success: 'Document indexed successfully ({count} chunks).',
      delete_failed: 'Failed to delete the RAG document.',
      delete_success: 'RAG document deleted.',
      test_failed: 'Failed to test the RAG embedding connection.',
      test_success: 'RAG embedding connection succeeded ({dimensions} dimensions).',
    },
  },
} as const;
