# Roadmap

这份路线图只保留当前推荐顺序，不重复大段现状说明。

现状和边界统一看 [project-status.md](./project-status.md)。

## Now

### 1. V1 稳定化和测试补强

目标：把已经基本完成的 `Core Product V1` 收成更稳定的日常开发基线。

优先做：

1. 补高价值 integration / E2E
2. 收紧 guest conversations / memory 的边界 bug
3. 补关键 timeout / recovery 路径
4. 继续清掉容易互相覆盖的本地状态同步
5. 强化线上排查和 error visibility

推荐落点：

- `tests/`
- `src/features/chat/`
- `src/features/memory/`

### 2. 运行时 Payload / 性能收紧

目标：在不改产品边界的前提下，收紧当前 V1 运行时的 payload、请求体和感知延迟。

优先做：

1. 压缩 `Skills` runtime payload，不再把不必要文件每轮都带进请求
2. 收紧会话切换、hydrate 和本地持久化的边界
3. 优化 workbench 里几个较重弹窗和列表的加载体验
4. 增加更明确的大小限制、缓存和请求边界

推荐落点：

- `src/features/skills/`
- `src/features/chat/agent-runtime/`
- `src/features/chat/storage/`

### 3. Production Readiness 基础能力

目标：在保持当前产品范围不扩张的前提下，补基础生产能力。

优先做：

1. 更清楚的 tracing / telemetry / audit 基础
2. 更细的 provider 错误分类和可观测性
3. 关键路径的 rate limit / quota / timeout 行为统一
4. 为 durable run / resume 预留干净入口，但先不大扩

推荐落点：

- `src/features/chat/agent-runtime/`
- `src/lib/`
- `src/config/`

## Next

### 4. Chat Attachments / Multimodal Input

目标：让聊天输入从纯文本扩展到图片和通用附件。

优先做：

1. 输入框里的图片 / 附件选择与上传
2. 消息中的附件引用和展示
3. 服务端对附件元数据和存储位置的处理
4. 结合模型能力决定哪些 provider 支持图片输入
5. 明确附件与 RAG / Sandbox / Subagents 的边界

### 5. Search / RAG 第二阶段

目标：在已有 V1 基础上补第二批 provider 和更成熟的产品体验。

优先做：

1. 补第二个 Search provider，实现真正可替换
2. 补第二个 RAG provider，实现真正可替换
3. 收紧 RAG 自动触发条件
4. 补搜索结果和来源展示体验
5. 增加基础缓存与请求观测

### 6. Provider / Models 第二阶段

目标：继续把当前可用的模型配置整理成更稳定的 provider abstraction。

优先做：

1. 统一模型定义
2. provider 默认策略
3. 模型可用性检查和失败回退
4. 为后续 `image generation`、`TTS / audio` 预留独立接入点

## Later

### 7. Skills Runtime 第二阶段

目标：在现有本地安装 + runtime load 基础上，再决定是否推进更细的 activation / compatibility 策略。

优先做：

1. compatibility 校验
2. payload 压缩
3. 更细的 skill file gating
4. 视真实需求再决定 `eager / lazy` 或 guardrail 注入

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

### 9. Durable Runs / Agent Platform

目标：只有在真实场景需要时，再把当前 agent harness 往更重的平台能力推进。

优先做：

1. durable run storage / resume
2. 更完整的 run tracing / audit
3. queue / long-running jobs
4. first-party MCP server 或更重 orchestration

### 10. Chat Input UX

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
- 过早把 `Skills` 扩成更重的权限系统
