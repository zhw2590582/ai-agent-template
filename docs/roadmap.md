# Roadmap

这份路线图只保留当前推荐顺序，不重复大段现状说明。

现状和边界统一看 [project-status.md](./project-status.md)。

## Now

### 1. Memory V1 收尾

目标：把当前已落地的 Memory V1 打磨成可持续维护的能力。

优先做：

1. login 后导入 guest 本地长期记忆 / 本地会话摘要
2. 继续对齐 `local` 和 `supabase` 两套 memory source 的行为边界
3. 更稳定的记忆归并与规范化
4. 更稳定的相关性检索
5. Memory 行为测试补齐
6. 修复已知标题和摘要边界问题
7. 继续把 `conversation source` 的 record sync / hydration 语义也收进 source-based 结构，而不是重新长回 hook 分支

推荐落点：

- `src/features/memory/`
- `src/features/chat/server/`
- `src/features/chat/storage/`

### 2. Search 产品化补强

目标：把当前已可用的 Search V1 和已建立的 provider 边界，继续打磨成更稳定、更可维护的能力。

优先做：

1. 补第二个 Search provider，实现真正可替换
2. 细化 provider 错误反馈，区分 `401 / 429 / quota / network`
3. 补搜索结果展示和引用样式
4. 增加基础缓存与请求观测
5. 优化 tool 使用策略，而不只依赖 prompt

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

目标：让剩余需要独立承载的 workbench 视图变成真实页面，而不是继续停留在占位态。

优先做：

1. `MCP`
2. `Skills`
3. 补齐已落地 workbench 的细节体验

### 5. RAG 收尾

目标：把当前已落地的 RAG V1 和已建立的 provider 边界，继续打磨成更稳定、更可维护的能力。

优先做：

1. 文档详情和重建索引体验
2. 收紧 RAG 自动触发条件，减少数学题、纯推理题和无关请求的误触发
3. 更细的错误反馈与观测
4. 来源交互增强
5. 补第二个 RAG provider，实现真正可替换
6. 再评估 query rewrite / agentic RAG 的必要性

### 6. Agent Runtime 稳定化

目标：继续保持 `agent-runtime` 是薄而稳定的 orchestration 层。

优先做：

1. 保持 `chat.ts` 和 wrappers 不回长逻辑
2. 补高价值测试
3. 优先补 `contract / evaluation / recovery`
4. 只做必要的 telemetry / metadata 收口
5. 不继续拆更多概念层

## Later

### 7. Skills Runtime Contract

目标：只有在确有需求时，再把 `Skills` 从配置层推进到 runtime contract。

### 8. Subagents 稳定化

目标：在现有 `Subagents V1` 基础上，继续做收敛和稳定化，而不是扩成更重的 orchestration 系统。

优先做：

1. delegation budget 和超时控制
2. 更清楚的 tool access / capability boundary
3. 更稳定的 subagent telemetry 和失败反馈
4. 必要时再补独立 KB retrieval，而不是先引入更复杂 handoff graph

参考：

- [multi-agent/multi-agent-coordination-patterns.md](./multi-agent/multi-agent-coordination-patterns.md)
- [multi-agent/building-multi-agent-systems-when-and-how-to-use-them.md](./multi-agent/building-multi-agent-systems-when-and-how-to-use-them.md)
- [multi-agent/ai-sdk-subagents.md](./multi-agent/ai-sdk-subagents.md)

### 9. Production Readiness

目标：补 tracing、权限、审计、E2E，并在必要时增加 durable run 存储。

### 10. Chat Attachments / Multimodal Input

目标：让聊天输入从纯文本扩展到图片和通用附件。

优先做：

1. 输入框里的图片 / 附件选择与上传
2. 消息中的附件引用和展示
3. 服务端对附件元数据和存储位置的处理
4. 结合模型能力决定哪些 provider 支持图片输入
5. 明确附件与 RAG / Sandbox / Subagents 的边界

### 11. Chat Input UX

目标：补齐开箱即用的聊天输入体验，让本地版和托管版都更容易直接使用。

优先做：

1. 提供一个同时清空服务器数据和本地数据的用户入口
2. 给输入框接入语音输入
3. 在输入框加入 `/` 命令触发的命令选择

## 当前不建议优先做

- 重写现有聊天主链路
- 新建一批 feature 专题文档
- 过早引入重型 agent framework
- 在没有真实需求前继续扩 runtime 抽象
- 在 `Skills` 还没有 contract 前把它硬接进聊天
