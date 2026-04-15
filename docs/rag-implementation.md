# RAG Implementation

这份文档描述当前项目里 `RAG V1` 的实现边界，以及为什么当前选择 `Supabase + pgvector`。

## 当前范围

当前只实现最小链路：

- `Supabase + pgvector` 表结构
- 文档 / chunk / knowledge base 的数据库模型
- 基于 embeddings 的 similarity retrieval
- 聊天请求里的 retrieval context 注入
- 当前检索范围固定为当前用户自己的 RAG 数据，不提供知识库级筛选输入
- 文本导入 API：`title + source + content -> chunk -> embed -> store`
- RAG workbench 里的最小文档管理 UI
- 聊天消息里的来源卡片展示

当前 **未实现**：

- 文件上传 UI
- 自动 embeddings pipeline
- agentic RAG / query rewrite / rerank

## 技术选择

- 向量存储：`Supabase Postgres + pgvector`
- embedding provider：当前仍通过 `AI SDK + @ai-sdk/openai` 的兼容层调用，后续会抽成可替换 provider
- 聊天注入：`chat-request-context -> generateText workflow`

## 环境变量

- `RAG_EMBEDDING_API_KEY`
- `RAG_EMBEDDING_BASE_URL`（可选）
- `RAG_EMBEDDING_MODEL`

另外，当前 `RAG` workbench 也支持用户级 `apiKey` 输入。运行时会优先使用用户填写的 key，再回退到服务端环境变量。

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

1. 文件上传导入（pdf / md / txt）
2. provider abstraction（Voyage / OpenAI-compatible / others）
3. rerank
4. source cards 的交互增强
