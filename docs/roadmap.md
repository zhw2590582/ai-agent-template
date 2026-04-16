# Roadmap

这份路线图只保留当前推荐顺序，不重复大段现状说明。

现状和边界统一看 [project-status.md](./project-status.md)。

## Now

### 1. Memory V1 收尾

目标：把当前已落地的 Memory V1 打磨成可持续维护的能力。

优先做：

1. memory import
2. 更稳定的记忆归并与规范化
3. 更稳定的相关性检索
4. Memory 行为测试补齐
5. 修复已知标题和摘要边界问题

推荐落点：

- `src/features/memory/`
- `src/features/chat/server/`
- `src/features/chat/storage/`

### 2. Search 产品化补强

目标：把当前已可用的 Tavily 搜索能力补到更稳定、更可观测。

优先做：

1. 细化 Tavily 错误反馈，区分 `401 / 429 / quota / network`
2. 补搜索结果展示和引用样式
3. 增加基础缓存与请求观测
4. 优化 tool 使用策略，而不只依赖 prompt

推荐落点：

- `src/features/search/`
- `src/features/chat/ai/tools/`
- `src/features/chat/agent-runtime/`

### 3. Provider / Models 整理

目标：把当前较浅的模型配置整理成更可扩展的 provider abstraction。

优先做：

1. 统一模型定义
2. provider 配置和默认策略
3. 模型可用性检查
4. 失败回退策略
5. 为后续 `image generation`、`TTS / audio` 预留独立接入点

推荐落点：

- `src/features/chat/ai/core/models.ts`
- `src/features/models/`
- `src/config/`

## Next

### 4. 页面去占位化

目标：让导航中的关键页面变成真实页面，而不是 workbench 占位视图。

优先做：

1. `MCP`
2. `Settings`
3. `Skills`
4. 补齐已落地 workbench 的细节体验

### 5. RAG 收尾

目标：把当前已落地的 RAG V1 打磨成更稳定、更可维护的能力。

优先做：

1. 文档详情和重建索引体验
2. 更细的错误反馈与观测
3. 来源交互增强
4. 评估更多 provider / query rewrite 的必要性

### 6. Agent Runtime 稳定化

目标：继续保持 `agent-runtime` 是薄而稳定的 orchestration 层。

优先做：

1. 保持 `chat.ts` 和 wrappers 不回长逻辑
2. 补高价值测试
3. 只做必要的 telemetry / metadata 收口
4. 不继续拆更多概念层

## Later

### 7. Skills Runtime Contract

目标：只有在确有需求时，再把 `Skills` 从配置层推进到 runtime contract。

### 8. Planning / Subagent

目标：在现有 harness 足够稳定后，再考虑任务拆解和多代理。

### 9. Production Readiness

目标：补 tracing、权限、审计、E2E，并在必要时增加 durable run 存储。

## 当前不建议优先做

- 重写现有聊天主链路
- 新建一批 feature 专题文档
- 过早引入重型 agent framework
- 在没有真实需求前继续扩 runtime 抽象
- 在 `Skills` 还没有 contract 前把它硬接进聊天
