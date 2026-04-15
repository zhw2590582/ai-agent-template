# RAG Implementation

这份文档描述当前项目里 `RAG V1` 的实现边界，以及为什么当前选择 `Supabase + pgvector`。

## 当前范围

当前只实现最小链路：

- `Supabase + pgvector` 表结构
- 文档 / chunk / knowledge base 的数据库模型
- 基于 embeddings 的 similarity retrieval
- 向量召回后的 `Voyage rerank`
- 聊天请求里的 retrieval context 注入
- 当前检索范围固定为当前用户自己的 RAG 数据，不提供知识库级筛选输入
- 文档导入 API：当前只支持 `txt / md / pdf` 文件上传
- RAG workbench 里的最小文档管理 UI
- 聊天消息里的来源卡片展示
- RAG 连接测试
- 已索引文档的懒加载折叠列表与删除确认

当前 **未实现**：

- 自动 embeddings pipeline
- agentic RAG / query rewrite
- 多 provider 选择
- 文档重建索引 / 详情页

## 技术选择

- 向量存储：`Supabase Postgres + pgvector`
- embedding provider：当前通过 `EmbeddingProvider` 抽象接入 `Voyage` HTTP API
- 聊天注入：`chat-request-context -> generateText workflow`

## 配置方式

- 当前 `RAG` 只使用用户在 workbench 中填写的 `Voyage API Key`
- 不再依赖服务端环境变量提供 embedding key
- 当前默认模型固定为 `voyage-4-lite`
- 当前只对登录用户开放，上传、连接测试和检索都依赖用户私有索引

当前默认实现使用 `Voyage` 官方 embeddings 和 rerank：

- embedding model: `voyage-4-lite`
- rerank model: `rerank-2.5-lite`
- 向量维度：`1024`

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

1. 文档详情 / 重新索引
2. provider selection / 更多 embedding provider
3. query rewrite / 更复杂的 RAG orchestration
