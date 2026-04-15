# RAG Implementation

这份文档描述当前项目里 `RAG V1` 的实现边界，以及为什么当前选择 `Supabase + pgvector`。

## 当前范围

当前只实现最小链路：

- `Supabase + pgvector` 表结构
- 文档 / chunk / knowledge base 的数据库模型
- 基于 embeddings 的 similarity retrieval
- 聊天请求里的 retrieval context 注入

当前 **未实现**：

- 文档上传 UI
- 文档切块和导入 UI
- source 引用展示 UI
- 自动 embeddings pipeline
- agentic RAG / query rewrite / rerank

## 技术选择

- 向量存储：`Supabase Postgres + pgvector`
- query embedding：`AI SDK embed() + @ai-sdk/openai`
- 聊天注入：`chat-request-context -> generateText workflow`

## 环境变量

- `RAG_EMBEDDING_API_KEY`
- `RAG_EMBEDDING_BASE_URL`（可选）
- `RAG_EMBEDDING_MODEL`

当前默认实现按 `text-embedding-3-small` 兼容的 1536 维 embedding 处理。

## V1 设计原则

1. 不把 RAG 和 Memory 混成一个系统
2. 不先做 agentic RAG
3. 不先做自动 ingestion pipeline
4. 先打通：`query -> retrieve -> inject -> answer`

## 数据模型

- `rag_knowledge_bases`
- `rag_documents`
- `rag_chunks`
- `match_rag_chunks(...)` RPC function

## 下一步

1. 文档导入 API
2. chunking + embeddings 写入
3. RAG workbench settings UI
4. source cards / citations UI
