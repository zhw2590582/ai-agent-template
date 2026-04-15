# Roadmap

这份路线图只保留当前建议顺序，不复述已经完成的历史细节。

## Now

### 1. Memory V1 收尾

目标：把当前已落地的 Memory V1 打磨成可持续维护的能力。

优先做：

1. memory import
2. 进一步的记忆归并与规范化
3. 更稳定的相关性检索
4. Memory 行为测试补齐
5. 修复会话标题自动生成后浏览器标签页标题会被重置的问题

推荐落点：

- `src/features/memory/`
- `src/features/chat/server/`
- `src/features/chat/storage/`

### 2. Search 产品化补强

目标：把当前已可用的 Tavily 搜索能力，从一期功能提升到更稳定、更可观测的产品能力。

参考：

- [docs/search-implementation.md](./search-implementation.md)

优先做：

1. 细化 Tavily 错误反馈，区分 `401 / 429 / quota / network`
2. 补搜索结果展示和引用样式
3. 增加基础缓存与请求观测
4. 优化 tool 使用策略，而不只依赖 prompt

推荐落点：

- `src/features/search/`
- `src/features/chat/ai/tools/`
- `src/features/chat/ai/workflows/`

### 3. Provider / Models 整理

目标：把当前较浅的模型配置整理成更可扩展的 provider abstraction。

优先做：

1. 统一模型定义
2. provider 配置和默认策略
3. 模型可用性检查
4. 失败回退策略
5. 为后续 `image generation`、`TTS / audio` 留出独立能力接入点，但不在当前 chat runtime 内混接

推荐落点：

- `src/features/chat/ai/core/models.ts`
- `src/features/models/`
- `src/config/app.ts`
- 需要时再拆新的模型配置文件

## Next

### 4. 页面去占位化

目标：让导航中的关键页面变成真实页面，而不是 workbench 占位视图。

优先做：

1. `MCP`
2. `Settings`
3. `Skills`
4. 继续补齐已落地 workbench 的细节体验

其中 `Skills` 当前的真实边界，先看：

- [docs/skills-implementation.md](./skills-implementation.md)

### 4.5 MCP 全能力研究

目标：在当前 demo server 基础上，逐步理解并落地 MCP 的完整能力。

优先做：

1. 先把 `tools / resources / prompts` 的消费链路做完整
2. 再单独研究 `logging`
3. 再研究 `elicitation`
4. 再研究 `sampling`
5. 最后研究 `roots`

参考：

- [docs/mcp-server-demo.md](./mcp-server-demo.md)
- [docs/mcp-implementation.md](./mcp-implementation.md)

### 5. RAG 收尾

目标：把当前已落地的 RAG V1 打磨成更稳定、更可维护的能力。

优先做：

1. 文档详情 / 重建索引的细节体验
2. 更细的错误反馈与观测
3. 来源交互增强
4. 评估更多 provider / query rewrite 的必要性

## Later

### 6. Planning

目标：支持多步骤任务拆解与执行。

### 7. Multi-Agent / Subagent

目标：支持多个 specialized agents 协作。

### 8. Production Readiness

目标：补齐 tracing、权限、审计、E2E，并在需要时把当前内存限流升级为集中式后端。

## 当前不建议优先做

- 重写现有聊天主链路
- 过早引入数据库抽象层
- 为占位页面设计完整 UI 系统
- 在没有真实需求前引入重型 agent framework
- 在 provider 抽象未理顺前同时接太多模型供应商
