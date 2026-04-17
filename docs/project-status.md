# Project Status

最后核对时间：2026-04-17

## 一句话

这是一个以聊天为中心的 AI Agent Web App 骨架。

当前已经稳定下来的核心是：

- 聊天主链路
- 模型和 provider 配置
- 登录与会话持久化
- Memory V1
- Search V1
- Sandbox V1
- 远程 MCP tools integration
- RAG V1
- Subagents V1

当前还没有做成的平台能力是：

- Multi-Agent orchestration
- Skills runtime
- durable run storage / resume
- 本项目自己的正式 MCP server

换句话说：当前项目已经具备 V1 `agent harness`，但还没有进入 `agent platform` 阶段；后者通常还包括长任务、恢复、审计和策略治理。

当前模板同时采用 `local-first` 默认：

- 匿名用户可以直接使用绝大部分核心能力
- 不登录时，数据优先保存在浏览器本地
- 不登录时，guest conversations / memories 走 IndexedDB，本地 profile/settings 继续走 local-first storage；登录后才切到 Supabase 持久化
- 不登录时，`Memory` 走本地长期记忆 + 本地会话摘要，登录后才切到 Supabase 持久化
- 只有在配置了 Supabase 之后，登录入口和远端持久化才会真正启用

## 当前里程碑

### Core Capabilities V1

可以认为，当前项目已经完成了 `Core Capabilities V1`。

这一阶段已进入 V1 的核心产品能力包括：

- Chat
- Models / Providers
- Auth + Profile
- Conversations
- Memory V1
- Search V1
- Sandbox V1
- RAG V1
- Subagents V1

当前仍未进入这一里程碑的能力包括：

- Skills runtime
- MCP completion
- durable run / tracing / E2E 等 production readiness

也就是说：从“核心产品功能”角度看，项目已经基本进入 V1；从“平台能力”角度看，还没有全部进入 V1。

## 建议先看

1. [architecture.md](./architecture.md)
2. 聊天 runtime 相关改动再看 [agent-harness.md](./agent-harness.md)
3. 需要排优先级时看 [roadmap.md](./roadmap.md)

## Capability Snapshot

| Capability         | 状态      | 当前边界                                                                              | 主要位置                                                    |
| ------------------ | --------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Chat               | 已实现    | `useChat -> /api/chat -> agent-runtime -> stream response` 主链路稳定                 | `src/features/chat/`                                        |
| Models / Providers | 已实现    | 用户可配置 provider、探测连接、同步模型、自定义模型                                   | `src/features/models/`                                      |
| Auth + Profile     | 已实现    | Supabase OAuth、`profiles.settings` 持久化                                            | `src/features/auth/`                                        |
| Conversations      | 已实现    | 登录用户走 Supabase，guest 走 IndexedDB-backed local store                            | `src/features/chat/storage/`                                |
| Memory             | 已实现 V1 | 同一套 Memory UI；guest 走本地长期记忆 + 本地会话摘要，登录用户走 Supabase 记忆和摘要 | `src/features/memory/`                                      |
| Search             | 已实现 V1 | provider-based search tools、连接测试、`web_search / web_extract / web_crawl`         | `src/features/search/`                                      |
| Sandbox            | 已实现 V1 | provider-based sandbox runtime、首批 tools、workspace/session/telemetry 骨架          | `src/features/sandbox/`, `src/features/chat/agent-runtime/` |
| MCP                | 部分具备  | 远程 MCP server 配置、测试、tool merge；未消费 resources/prompts                      | `src/features/mcp/`                                         |
| RAG                | 已实现 V1 | 文档导入、pgvector 检索、provider-based embeddings/rerank、来源展示                   | `src/features/rag/`                                         |
| Skills             | 部分具备  | 只有 settings UI 和持久化，还没进入 runtime                                           | `src/features/skills/`                                      |
| Subagent           | 已实现 V1 | 最小串行 `Orchestrator-Subagent`，支持配置、内建角色、tool delegation 和基础展示      | `src/features/subagents/`, `src/features/chat/ai/tools/`    |
| Testing            | 基础具备  | unit / integration 可用，E2E 仍是占位                                                 | `tests/`                                                    |

## 当前边界

### Chat + Agent Runtime

当前聊天运行时已经从散落逻辑收口到 `src/features/chat/agent-runtime/`。

当前已经进入 harness 的能力：

- Models
- Memory
- Search
- Sandbox
- MCP
- RAG

当前还没有进入 harness 的能力：

- Skills runtime contract
- durable run storage / replay
- 图片和附件输入链路

关键位置：

- 入口：[../src/features/chat/server/chat.ts](../src/features/chat/server/chat.ts)
- runtime：[../src/features/chat/agent-runtime](../src/features/chat/agent-runtime)
- runtime contract：[../src/features/chat/agent-runtime/runtime-overrides.ts](../src/features/chat/agent-runtime/runtime-overrides.ts)
- client-safe export：[../src/features/chat/agent-runtime/client.ts](../src/features/chat/agent-runtime/client.ts)
- server-safe export：[../src/features/chat/agent-runtime/server.ts](../src/features/chat/agent-runtime/server.ts)

当前要求：

- client 代码只从 `agent-runtime/client` 取值
- server 代码只从 `agent-runtime/server` 取值
- `chat.ts` 保持薄入口，不重新堆回编排细节
- `/api/chat` 继续通过统一的 `runtimeOverrides` 输入消费 feature runtime 配置，不再继续新增一排顶层 feature settings 字段

后续待补：

- 聊天输入目前仍是文本优先；发送图片和通用附件的上传、引用、持久化和消息展示链路还没有实现

已知问题：

- 部署到 Vercel 后，如果流式回复接近平台 `maxDuration` 上限，平台硬超时不一定能稳定转换成用户可见的明确 timeout 错误；后续更合适的处理方式是在应用层提前 abort，返回可控错误

### Models / Providers

已完成：

- provider 配置持久化
- 连接测试
- 模型列表同步
- 自定义 provider / model 管理
- 可用模型列表前端分页

未完成：

- 更完整的 provider abstraction
- 回退策略
- 模型可用性观测
- 浏览器 / 密码管理器对 API key 输入框的“保存密码”提示仍未解决；一次通过输入属性抑制的尝试没有成功，而且会让浏览器自动回填的值不再显示

关键位置：

- [../src/features/models](../src/features/models)
- [../src/features/chat/ai/core/models.ts](../src/features/chat/ai/core/models.ts)

### Conversations + Auth

已完成：

- Supabase OAuth
- `profiles.settings` 持久化
- 已登录会话分页、搜索、重命名、删除
- guest 本地会话存储和标题生成
- `Profile` 已开始按 `local / supabase` 两种 source 分层，而不是继续把 guest / 登录用户分支散在页面 hook 里
- app 级 settings schema / normalize 已开始收口到 `src/features/settings/*`

当前默认行为：

- 未配置 Supabase 时，不显示登录入口
- 匿名用户继续使用本地会话、本地模型配置和大部分工作台能力

关键位置：

- [../src/features/auth](../src/features/auth)
- [../src/features/settings](../src/features/settings)
- [../src/features/chat/storage](../src/features/chat/storage)

### Memory

已完成：

- 会话摘要压缩
- 长期记忆写入和跨会话注入
- 基础 consolidation
- Memory 管理 UI
- guest 本地长期记忆
- guest 本地会话摘要与长上下文压缩
- 同一套 Memory UI，下层按 `local` / `supabase` 两种来源工作

未完成：

- memory import
- 更稳定的归并和检索
- 外部 memory provider

当前边界：

- guest 和登录用户在 UI 体感上基本一致
- guest 的长期记忆和摘要只在当前浏览器 / 当前设备生效
- 登录用户继续使用 Supabase 持久化，并支持跨设备同步
- `Memory` 页面已开始按 `local / supabase` 两种 source 工作，避免继续把 guest / 登录用户逻辑直接散在 UI 组件里

关键位置：

- [../src/features/memory](../src/features/memory)
- [../src/features/chat/ai/memory](../src/features/chat/ai/memory)

### Search

已完成：

- Tavily key 和 Search / Extract / Crawl 设置
- `/api/search/test`
- Search provider registry / factory 已建立
- 聊天 runtime 动态挂载：
  - `web_search`
  - `web_extract`
  - `web_crawl`

未完成：

- 第二个 Search provider，实现真正可替换
- 搜索结果展示层
- 错误分层反馈
- 缓存、配额和更细的观测

关键位置：

- [../src/features/search](../src/features/search)
- [../src/features/chat/ai/tools](../src/features/chat/ai/tools)

### Sandbox

已完成：

- E2B settings 和连接测试
- Sandbox provider registry / runtime session factory 已建立
- `sandbox_run_command`
- `sandbox_read_file`
- `sandbox_write_file`
- workspace manifest / session / telemetry 骨架

未完成：

- 第二个 Sandbox provider，实现真正可替换
- 跨请求 session 复用
- 持久化 volumes / snapshots
- 更丰富的 sandbox capability policy

关键位置：

- [../src/features/sandbox](../src/features/sandbox)
- [../src/features/chat/agent-runtime/workspace-manifest.ts](../src/features/chat/agent-runtime/workspace-manifest.ts)
- [../src/features/chat/agent-runtime/workspace-session.ts](../src/features/chat/agent-runtime/workspace-session.ts)

### MCP

已完成：

- 多远程 MCP server 配置
- 单 server 测试
- 聊天时合并远程 MCP tools
- 测试结果展示 `tools / resources / prompts / capabilities`

未完成：

- resources / prompts 的真实消费链路
- elicitation / approval UI
- 本项目自己的正式 MCP server

关键位置：

- [../src/features/mcp](../src/features/mcp)
- [../src/app/api/mcp/test/route.ts](../src/app/api/mcp/test/route.ts)

说明：

- `src/app/api/mcp/route.ts` 目前仍是 demo / 预留入口
- 当前 MCP 的真实能力是 “本项目作为 MCP client”

### RAG

已完成：

- `Supabase + pgvector`
- 文档上传导入
- RAG provider registry / factory 已建立
- 当前默认 provider：Voyage embeddings + rerank
- 聊天注入和来源展示

未完成：

- 非 Voyage provider 实现
- 多知识库管理
- agentic RAG / query rewrite
- RAG 自动触发条件仍然偏宽，数学题、纯推理题或不需要知识库的请求仍可能误触发检索；后续需要改成更稳的语言无关 gate 或独立判定步骤，而不是关键词匹配

关键位置：

- [../src/features/rag](../src/features/rag)
- [../src/features/rag/server/providers](../src/features/rag/server/providers)

### Skills

已完成：

- workbench 管理 UI
- `profile.settings.skills` 持久化
- 条目编辑 / 删除

未完成：

- skill import
- manifest 解析
- compatibility 校验
- runtime contract

说明：

- 当前 `Skills` 只是配置层
- 现在不要把它误判成 runtime capability

### Subagents

当前已具备最小串行版 `Orchestrator-Subagent`：

- Subagents 配置 UI
- 内建预设角色
- `delegate_to_subagent` tool
- 基础结果展示
- `toModelOutput` 摘要压缩
- 轻量 subagent roster 注入主 prompt
- tool access 已按 subagent 收紧为 `none / web / code / rag`

当前边界：

- `code` 目前只拿 `sandbox_*`
- `web` 目前只拿 `web_*`
- `rag` 目前只消费当前请求已检索出的 `ragContext`
- subagent 默认不再继承整套主工具集

但现在还没有：

- 并行 subagents
- agent teams
- shared state / message bus
- durable orchestration
- 更复杂的 handoff graph

现阶段不建议为了它们继续扩抽象，先把现有 chat runtime 骨架稳住。

相关参考：

- [multi-agent/multi-agent-coordination-patterns.md](./multi-agent/multi-agent-coordination-patterns.md)
- [multi-agent/building-multi-agent-systems-when-and-how-to-use-them.md](./multi-agent/building-multi-agent-systems-when-and-how-to-use-them.md)
- [multi-agent/ai-sdk-subagents.md](./multi-agent/ai-sdk-subagents.md)

## 当前优先级

1. Memory V1 收尾
2. Search 产品化补强
3. Provider / Models 整理
4. 页面去占位化
5. RAG 收尾
6. 保持 `agent-runtime` 稳定，不继续过度设计

细一点的顺序看 [roadmap.md](./roadmap.md)。
