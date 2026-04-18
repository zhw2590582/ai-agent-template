# Agent Harness

本文档记录自 `The Next Evolution of the Agents SDK` 那次讨论之后，对本仓库 `agent harness` 的定义、判断、目标结构和执行顺序。

目标不是把外部文章复述一遍，而是把那次讨论沉淀成当前仓库后续可执行的工作引导。

参考文章：

- OpenAI: `The Next Evolution of the Agents SDK`
  https://openai.com/index/the-next-evolution-of-the-agents-sdk/
- Lychee Technology Engineering Blog:
  `Your AI Isn't "Stupid" — It Just Needs a Better Harness`
  https://blog.ltbase.dev/posts/agents/harness-engineering

## 当前判断

现阶段不以“迁移到 OpenAI Agents SDK”作为主目标。

当前更合适的方向是：

1. 继续保持 `Next.js + Vercel AI SDK` 作为聊天主链路
2. 先把本仓库自己的 `agent harness` 收口清楚
3. 把 `Search / MCP / Sandbox / RAG / Memory / Skills` 明确成 runtime capability
4. 等 TypeScript 侧的 agent harness / sandbox 生态更稳定后，再评估是否局部接入外部 agent framework

一句话总结：

`OpenAI Agents SDK` 这次讨论带来的主要价值，是帮助我们明确“应该怎样重构自己的运行时边界”，而不是立刻替换现有聊天链路。

当前目标是先把本仓库的 V1 `agent harness` 做稳，而不是提前扩成 `agent platform`；后者通常还意味着长任务、恢复、更复杂的多代理编排、审计和策略治理。

## 什么是 Agent Harness

`agent harness` 指的是“把模型真正跑起来的那层运行时骨架”。

它不是：

- UI
- 单一模型 provider
- 某一个 tool

它负责把这些东西组织成一次完整运行：

- 对话输入和请求体
- system prompt / 上下文拼装
- memory / summary / RAG 注入
- tools 注册与 step loop
- sandbox / 文件系统 / shell 执行边界
- MCP tools 合并
- finish handler、持久化、资源释放
- 后续的 telemetry、durability、subagent orchestration

如果没有 harness，项目通常只有“UI + model”。

如果有了 harness，项目才开始具备真正的 agent 行为。

## Harness Engineering 补充共识

结合 `Your AI Isn't "Stupid" — It Just Needs a Better Harness`，当前仓库还应继续遵守 4 条原则：

1. `Constrain, don't instruct`
   能用程序约束的地方，不要只靠 prompt 祈祷
2. `Externalize state`
   重要状态不能只活在上下文窗口里
3. `Make every step verifiable`
   每一步都要能被规则、工具或独立检查器验证
4. `Fail locally, not globally`
   单步失败优先局部重试或 fallback，不要整轮一起炸掉

这 4 条原则对当前仓库最直接的含义是：

- 继续收紧 tool / subagent contract
- 继续把状态放到 memory / summary / metadata / workspace 这些外部结构里
- 增加更可验证的 tool output / subagent output
- 后续优先补局部恢复，而不是继续堆更多 agent 角色

如果按 harness stack 看，当前仓库大致已经覆盖：

- `Cognition`: `build-agent-input.ts`、prompt 组装
- `Tools`: Search / Sandbox / MCP / RAG
- `Contracts & Interfaces`: `schemas.ts`、tool schema、subagent contract
- `Orchestration`: `execute-agent-run.ts`、`create-agent-run-response.ts`、`delegate_to_subagent.ts`
- `Memory & State`: summary、memory、`run-metadata`、`workspace-session`
- `Evaluation & Observation`: `run-telemetry`、tool / subagent 日志

当前最弱的一层仍然是：

- `Constraints & Recovery`

也就是：

- step-level retry
- fallback strategy
- idempotent recovery

这也是为什么当前阶段更值得补的是：

- `contract`
- `evaluation`
- `recovery`

而不是继续扩更重的 DAG / state machine / agent teams。

## 当前仓库里的 Harness

这层能力原本是分散存在的。当前已经开始往 `src/features/chat/agent-runtime/` 收口。

### 当前运行时主链路

```text
UI / Workbench
  -> useChatWorkbench
  -> useChatSession (wrapper)
  -> useAgentSession
  -> /api/chat
  -> src/features/chat/server/chat.ts
  -> src/features/chat/agent-runtime/*
  -> streamText(...)
  -> UI message stream
```

### 当前已进入 harness 的能力

- Models
- Memory
- Search
- Sandbox
- MCP
- RAG
- Skills
- Subagents

其中 `Subagents V1` 当前仍然是最小串行 `Orchestrator-Subagent`：只支持串行 delegation，不支持并行 subagent orchestration。

### 当前还没真正进入 harness 的能力

- Durable run storage / resume

## 当前已落地的收口结果

目前 `agent-runtime` 目录已经存在，并承接了前几轮重构结果：

```text
src/features/chat/agent-runtime/
├── client.ts
├── server.ts
├── types.ts
├── build-agent-run-request.ts
├── use-agent-session.ts
├── resolve-agent-run-context.ts
├── resolve-agent-rag-context.ts
├── build-agent-toolset.ts
├── build-agent-input.ts
├── execute-agent-run.ts
├── create-agent-run-response.ts
├── finish-agent-run.ts
├── workspace-manifest.ts
├── workspace-session.ts
├── run-metadata.ts
├── run-telemetry.ts
└── index.ts
```

这些文件当前职责如下：

- `client.ts`
  client-safe 出口，只暴露 `useAgentSession` 和 request build
- `server.ts`
  server-safe 出口，统一暴露 runtime orchestration 能力
- `build-agent-run-request.ts`
  统一构造 `/api/chat` 的请求体
- `use-agent-session.ts`
  统一前端聊天 transport，替代把运行时拼装散落在 hook 内
- `resolve-agent-run-context.ts`
  加载 memory、summary、settings，并构建 toolset
- `resolve-agent-rag-context.ts`
  负责 RAG query、retrieval、`ragSources`
- `build-agent-toolset.ts`
  合并 Search、Sandbox、MCP tools
- `build-agent-input.ts`
  统一 system prompt、summary、memory、RAG 上下文拼装
- `execute-agent-run.ts`
  统一 `streamText(...)` 执行
- `create-agent-run-response.ts`
  统一 UI stream response、metadata、error、finish handler 接线
- `finish-agent-run.ts`
  统一消息持久化、memory auto-write、资源释放
- `workspace-manifest.ts`
  统一从 `sandboxSettings` 派生 workspace manifest
- `workspace-session.ts`
  统一 sandbox session lifecycle 和最小 workspace telemetry
- `run-metadata.ts`
  统一聚合 run-level metadata，避免 response / finish / telemetry 各自拼字段
- `run-telemetry.ts`
  统一记录 `prepared / failed / finished` 这三类运行日志

为了避免一次性大搬家，当前还保留了兼容 wrapper：

- `src/features/chat/hooks/use-chat-session.ts`
- `src/features/chat/server/chat-request-context.ts`
- `src/features/chat/server/chat-finish.ts`

这些 wrapper 现在的职责只是兼容旧引用，不应该再继续增长业务逻辑。

当前已经确认的一条规则：

- client 代码不要直接 import `@/features/chat/agent-runtime`
- client 只走 `@/features/chat/agent-runtime/client`
- server 只走 `@/features/chat/agent-runtime/server`

## 当前推荐的分层

目标分层应当是下面这样：

```text
Product / UI Layer
  ChatWorkbench / Dialogs / Sidebar / Message UI

Client Orchestration Layer
  useChatWorkbench
  useAgentSession
  buildAgentRunRequest

Server Entry Layer
  /api/chat
  src/features/chat/server/chat.ts

Agent Harness Layer
  resolveAgentRunContext
  resolveAgentRagContext
  buildAgentToolset
  buildAgentInput
  executeAgentRun
  createAgentRunResponse
  finishAgentRun

Capability Providers
  Search
  Sandbox
  MCP
  Memory
  RAG
  Subagents
  Skills
```

这里最关键的边界有四个：

1. `/api/chat` 只做入口，不负责 capability 编排
2. `agent-runtime` 只做 orchestration，不直接长成新的 feature 杂物间
3. `Search / Sandbox / MCP / RAG / Memory / Subagents / Skills` 负责提供 capability adapter
4. UI 层不再自己知道每类 capability 在服务端如何拼接

## 目标结构

当前推荐继续沿着下面这个结构走，不必再回退到“按历史文件位置分散组织”：

```text
src/features/chat/
├── agent-runtime/
│   ├── types.ts
│   ├── build-agent-run-request.ts
│   ├── use-agent-session.ts
│   ├── resolve-agent-run-context.ts
│   ├── resolve-agent-rag-context.ts
│   ├── build-agent-toolset.ts
│   ├── build-agent-input.ts
│   ├── execute-agent-run.ts
│   ├── create-agent-run-response.ts
│   ├── finish-agent-run.ts
│   └── index.ts
├── hooks/
├── server/
├── storage/
└── ai/
```

当前已经补出来的最小基础层：

- `workspace-manifest.ts`
- `workspace-session.ts`
- `run-metadata.ts`
- `run-telemetry.ts`

后续如果继续演进，优先考虑的仍然是：

- `resolve-skill-manifests.ts`
- `compile-skill-overlays.ts`
- `build-skill-tool-policy.ts`

## 当前共识

### 1. 不重写聊天主链路

当前聊天主链路仍然以 `Vercel AI SDK` 为基础，现阶段不做“整体切换到外部 agent framework”。

### 2. 不让 `/api/chat` 再变胖

`chat.ts` 现在应保持在“入口编排”范围内：

- request validate
- auth
- 调用 `agent-runtime`
- 错误收口

不应再把这些逻辑重新塞回去：

- RAG retrieval 细节
- finish persistence
- tool registration
- step loop 细节

### 3. 不让兼容 wrapper 长逻辑

兼容 wrapper 只为过渡服务。后续新增逻辑应直接落到 `agent-runtime`。

### 4. 继续收紧 runtime contract，再做更重的 Skills / orchestration

`Skills` 现在已经进入 runtime V1，但当前能力仍然是：

- 本地安装包
- `runtimeSkills` 投影
- `load_skill / read_skill_file`

它还不是权限系统，也不是更重的 agent policy layer。

更复杂的多代理编排也同理，必须等 harness 的 run context、workspace、finish、telemetry 这些基础层稳定后再接。

多代理模式和拆分边界的参考，见：

- [multi-agent/multi-agent-coordination-patterns.md](./multi-agent/multi-agent-coordination-patterns.md)
- [multi-agent/building-multi-agent-systems-when-and-how-to-use-them.md](./multi-agent/building-multi-agent-systems-when-and-how-to-use-them.md)
- [multi-agent/ai-sdk-subagents.md](./multi-agent/ai-sdk-subagents.md)

## 当前状态判断

当前 `agent harness` 的状态可以定义为：

- 主骨架已成型
- client / server 边界已明确
- workspace lifecycle 已有最小模型
- run-level metadata 和 telemetry 已经接通
- Skills runtime V1 已接通
- 但还没有进入 durable run / 更复杂 orchestration 阶段

更准确地说：

- 现在已经不是“散落的聊天逻辑”
- 也还不是“完整 agent runtime 平台”
- 当前最合理的判断是：**V1 harness 已经可用，接下来应优先做稳定化**

## 当前真正必要的后续工作

现在真正必须做的，不是继续扩抽象，而是继续稳定化：

1. 补主链路高价值测试
2. 让文档持续与代码同步
3. 继续守住 wrapper 只做兼容层
4. 收紧 skills payload 和本地状态边界

当前已经完成、但不要再重复设计的内容：

- `workspace-manifest.ts` 和 `workspace-session.ts` 已经落地
- `run-metadata.ts` 和 `run-telemetry.ts` 已经接通
- client / server 出口已经拆开
- 最小测试现在已经覆盖：
  - `build-agent-run-request`
  - `workspace-manifest`
  - `workspace-session`
  - `run-metadata`
  - `create-agent-run-response`

当前还值得继续补的测试，优先是：

1. `resolve-agent-run-context`
2. `finish-agent-run`
3. 更多 `/api/chat` 集成边界

如果继续往下推进，只考虑这些小步，而不是重新开一轮大设计：

1. 在确有产品需求时，再给 `Skills` 增加更细 activation / policy contract
2. 在确有用户可见收益时，再考虑 durable run storage / replay
3. 在前两者都稳定后，再考虑是否需要更复杂的 orchestration

当前不需要马上做的事情：

- 更重的 sandbox/provider abstraction
- 新一轮目录拆分
- 迁移到外部 agent framework

## 当前不建议做

- 直接把聊天主链路迁移到 OpenAI Agents SDK
- 为了 subagent 提前重写整套 UI
- 在 `Skills` 还没有更清楚的 activation / policy contract 前，把它扩成更重的权限系统
- 在没有 workspace lifecycle 之前扩大量 sandbox tool
- 在没有 telemetry / durability 之前做复杂多代理并发
- 把新的运行时逻辑继续塞回 `src/features/chat/server/chat.ts`

## 工作时的判断标准

如果后续改动符合下面三条，通常说明方向是对的：

1. `app/api/chat/route.ts` 和 `src/features/chat/server/chat.ts` 变得更薄，而不是更厚
2. 新能力通过 `agent-runtime` 编排进入聊天，而不是在 UI hook 或 server wrapper 中散落拼装
3. feature 模块提供自己的 capability adapter，但不反向接管聊天主链路

如果后续改动违反下面任一条，通常说明方向偏了：

1. `useChatWorkbench` 开始知道太多 Search / Sandbox / MCP 执行细节
2. `chat.ts` 再次承载 retrieval、tool wiring、finish persistence 细节
3. `Skills` 直接以临时 if/else 混进 prompt
4. `Sandbox` 在没有 workspace 概念的情况下继续扩更多执行入口

## 与其他文档的关系

- 当前真实代码结构：看 [architecture.md](./architecture.md)
- 当前落地范围和完成度：看 [project-status.md](./project-status.md)
- 全局推进顺序：看 [roadmap.md](./roadmap.md)
- Search / Sandbox / MCP / RAG / Skills 的当前边界：统一看 [project-status.md](./project-status.md)

本文件只负责回答一件事：

后续 agent 相关能力，应该沿着什么运行时结构继续推进。
