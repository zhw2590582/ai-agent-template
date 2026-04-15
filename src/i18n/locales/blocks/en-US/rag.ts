export const enUSRagMessages = {
  rag_page: {
    title: 'RAG',
    description:
      'Connect your vector provider, upload source documents, and let chat retrieve grounded context before answering.',
    get_api_key: 'Get API Key',
    api_key_label: 'Voyage API Key',
    api_key_description:
      'Used for embeddings and reranking with Voyage. This key is stored in your profile settings.',
    api_key_placeholder: 'Enter your Voyage API Key',
    api_key_hint: 'Your own Voyage API Key is required to index documents and run retrieval.',
    enabled_label: 'Enable RAG',
    enabled_description:
      'Let chat retrieve relevant document excerpts before answering.',
    import_title: 'Import Documents',
    import_description:
      'Upload a .txt, .md, or .pdf file. We will extract the text, split it into searchable segments, generate vectors, and add it to your private index.',
    document_title_label: 'Document Title',
    document_title_placeholder: 'Enter a document title',
    document_source_label: 'Source',
    document_source_placeholder: 'Optional source URL or label',
    document_file_label: 'Document File',
    document_file_dropzone_title: 'Drag and drop a document here',
    document_file_dropzone_description: 'Or click to choose a file from your device.',
    document_file_hint: 'Accepted formats: .txt, .md, .pdf.',
    import_action: 'Import document',
    documents_title: 'Indexed Documents',
    documents_description:
      'Review and remove documents currently included in retrieval.',
    documents_loading: 'Loading indexed documents...',
    documents_empty: 'No indexed documents yet. Upload one above to start grounding answers.',
    documents_chunks: '{count} segments',
    documents_characters: '{count} characters',
    document_delete: 'Delete document',
    delete_document_title: 'Delete document',
    delete_document_description:
      'Delete "{title}" from your indexed documents? Its indexed segments will no longer be used for retrieval.',
    retrieval_title: 'Retrieval',
    retrieval_description:
      'Control how many matches are kept and how much retrieved context is sent to the model.',
    test_connection: 'Test connection',
    match_count_label: 'Top K',
    match_threshold_label: 'Similarity Threshold',
    max_context_characters_label: 'Max Context Characters',
    toast: {
      save_failed: 'Failed to save RAG settings.',
      save_success: 'RAG settings saved.',
      import_failed: 'Failed to import the RAG document.',
      import_success: 'Document indexed successfully ({count} segments).',
      delete_failed: 'Failed to delete the RAG document.',
      delete_success: 'RAG document deleted.',
      test_failed: 'Failed to test the RAG embedding connection.',
      test_success: 'RAG embedding connection succeeded ({dimensions} dimensions).',
    },
  },
} as const;
