# Review Findings

最后核对时间：2026-04-16

这份文档只记录按 feature 复盘时发现的真实问题，方便后续集中处理。

## Overall

### Snapshot

- 当前没有剩余的 must-fix 记录。
- `auth` 和 `subagents` 当前没有发现新的阻塞性 must-fix，更像 follow-up 稳定化。

### What Looks Healthy

- `src/features/auth`
  - 边界清楚，问题主要是维护性 follow-up。
- `src/features/memory`
  - UI 和主链路都比较克制，当前主要是错误处理过宽。
- `src/features/subagents`
  - 已经是可工作的 `V1`，当前更多是预算、telemetry 和能力补齐。

### Stage Assessment

- 如果按用户可见主能力看：
  - 项目已经进入 `Core Capabilities V1`
- 如果按工程稳定性看：
  - 还处在 `V1 + 稳定化收尾` 阶段
- 如果按平台能力看：
  - `MCP completion / production-hardening` 仍未完成

## `src/features/auth`

### Must Fix

- 当前没有发现阻塞性的 must-fix 问题。

### Follow-up

- `useAppProfile` 这轮已经补了更稳的 loading 语义：
  - guest -> 登录、账号切换到未缓存用户时，会先显式回到 loading，并先按当前用户/缓存重建 profile 再拉远端
  - [../src/features/auth/profile/use-app-profile.ts](../src/features/auth/profile/use-app-profile.ts)
- profile settings 的服务端 schema 和 normalize 逻辑是双份维护的，后续继续扩字段时容易漂移。
  - [../src/features/auth/server/profile-route.ts](../src/features/auth/server/profile-route.ts)
  - [../src/features/auth/profile/profile-settings.ts](../src/features/auth/profile/profile-settings.ts)
- `AppProfile.locale` / `AppProfile.theme` 当前更像草稿快照，而不是稳定持久化偏好，字段语义还可以再明确。
  - [../src/features/auth/profile/profile-draft.ts](../src/features/auth/profile/profile-draft.ts)
  - [../src/features/auth/profile/types.ts](../src/features/auth/profile/types.ts)

## `src/features/chat`

### Must Fix

- 当前没有剩余的阻塞性 must-fix。

### Follow-up

- 这轮已经补了侧边栏搜索分页：
  - `useSidebarSearch` 现在支持 `loadMore`
  - `useSidebarConversations` 在搜索态会真正走 search 分页，而不是错误地复用普通列表分页
  - [../src/features/chat/hooks/use-sidebar-search.ts](../src/features/chat/hooks/use-sidebar-search.ts)
  - [../src/features/chat/hooks/use-sidebar-conversations.ts](../src/features/chat/hooks/use-sidebar-conversations.ts)
  - [../tests/unit/features/chat/hooks/use-sidebar-conversations.test.tsx](../tests/unit/features/chat/hooks/use-sidebar-conversations.test.tsx)

- `chat` 请求 schema 和 profile settings schema 都各自维护一份 feature settings 结构；虽然职责不同，但字段持续扩展时仍有同步成本。
  - [../src/features/chat/server/schemas.ts](../src/features/chat/server/schemas.ts)
  - [../src/features/auth/server/profile-route.ts](../src/features/auth/server/profile-route.ts)
- `Subagents V1` 目前是最小串行 `Orchestrator-Subagent`，还需要继续补 delegation budget、失败反馈和更清楚的 telemetry。
  - [../src/features/chat/ai/tools/delegate_to_subagent.ts](../src/features/chat/ai/tools/delegate_to_subagent.ts)
  - [../src/features/chat/agent-runtime/execute-agent-run.ts](../src/features/chat/agent-runtime/execute-agent-run.ts)

## `src/features/mcp`

### Must Fix

- 当前没有剩余的阻塞性 must-fix。

### Follow-up

- 这轮已经补了两条关键稳定化：
  - `saveServer / deleteServer` 现在都基于当前 `localSettings` 生成下一份设置，不再覆盖同面板里的未保存改动
  - 多 server 初始化中途失败时，已打开的 MCP client 会被统一关闭，不再遗留连接资源
  - [../src/features/mcp/hooks/use-mcp-server-actions.ts](../src/features/mcp/hooks/use-mcp-server-actions.ts)
  - [../src/features/mcp/server-state.ts](../src/features/mcp/server-state.ts)
  - [../src/features/mcp/server/mcp-client.ts](../src/features/mcp/server/mcp-client.ts)

- `useMcpServerActions` 里维护了 `testResults` 状态，但当前 `McpContent` 实际只使用即时返回值来弹测试结果对话框，没有消费这份缓存状态。
  - 这不是 bug，但说明这里有一层多余状态可以后面收掉。
  - [../src/features/mcp/hooks/use-mcp-server-actions.ts](../src/features/mcp/hooks/use-mcp-server-actions.ts)

- 现在已经补了 MCP 本地状态合并和 client 清理的最小回归，但还没有更完整的设置页 / runtime 级测试。
  - [../tests/unit/features/mcp/server-state.test.ts](../tests/unit/features/mcp/server-state.test.ts)
  - [../tests/unit/features/mcp/mcp-client.test.ts](../tests/unit/features/mcp/mcp-client.test.ts)

## `src/features/memory`

### Must Fix

- 当前没有剩余的阻塞性 must-fix。

### Follow-up

- 这轮已经补了关键失败语义：
  - `listMemoriesForUser()` 查询失败时会显式抛错，不再把数据库读失败伪装成“没有记忆”
  - 这会同时让跨会话 memory 注入和 memory merge 路径停止静默丢上下文
  - [../src/features/memory/storage/memory-repository.ts](../src/features/memory/storage/memory-repository.ts)
  - [../tests/unit/features/memory/memory-repository.test.ts](../tests/unit/features/memory/memory-repository.test.ts)

- 当前没有发现 dedicated memory 测试覆盖 `memory-repository / memories.ts` 这条读写链路。
  - 这不是当前 bug，但意味着像“读取失败被静默吞掉”这类问题不容易被回归测试发现。
  - [../src/features/memory/storage/memory-repository.ts](../src/features/memory/storage/memory-repository.ts)
  - [../src/features/memory/storage/memories.ts](../src/features/memory/storage/memories.ts)

## `src/features/models`

### Must Fix

- 当前没有剩余的阻塞性 must-fix。

### Follow-up

- 模型页这轮已经补了两条关键稳定化：
  - profile 远端加载完成后，编辑器只会在源数据 ready 后再挂载，避免默认草稿覆盖真实配置
  - 保存前会对连接信息发生变化的 provider 重新刷新模型目录，不再只在“目录为空”时 probe
  - [../src/features/models/components/models-content.tsx](../src/features/models/components/models-content.tsx)
  - [../src/features/models/hooks/use-models-page.ts](../src/features/models/hooks/use-models-page.ts)
  - [../src/features/models/utils/provider-sync.ts](../src/features/models/utils/provider-sync.ts)

- 当前只补了 provider refresh 的纯逻辑测试，`models` 页面整体仍缺少更完整的组件 / hook 级回归。
  - [../tests/unit/features/models/provider-sync.test.ts](../tests/unit/features/models/provider-sync.test.ts)

## `src/features/rag`

### Must Fix

- 当前没有剩余的阻塞性 must-fix。

### Follow-up

- 这轮已经补了两条关键稳定化：
  - 导入失败时会删除半成品 document，重建索引失败时会尽量恢复旧 chunks
  - 文档列表加载失败时会保留已有列表，并给出明确错误提示
  - [../src/features/rag/server/ingestion.ts](../src/features/rag/server/ingestion.ts)
  - [../src/features/rag/hooks/use-rag-documents.ts](../src/features/rag/hooks/use-rag-documents.ts)

- RAG 自动触发当前仍然偏宽，数学题、纯推理题等无关请求也可能误触发检索。
  - 这条已经在 `project-status / roadmap` 里单独记过，后面应改成更稳的语言无关 gate 或独立判定步骤。
  - [../src/features/chat/agent-runtime/resolve-agent-rag-context.ts](../src/features/chat/agent-runtime/resolve-agent-rag-context.ts)

- 现在已经补了导入回滚和文档列表加载失败的最小回归，但 `rag` 仍缺少更完整的检索/组件层测试。
  - [../tests/unit/features/rag/ingestion.test.ts](../tests/unit/features/rag/ingestion.test.ts)
  - [../tests/unit/features/rag/use-rag-documents.test.tsx](../tests/unit/features/rag/use-rag-documents.test.tsx)

## `src/features/sandbox`

### Must Fix

- 当前没有剩余的阻塞性 must-fix。

### Follow-up

- 这轮已经补了两条关键稳定化：
  - access policy 已接入设置页，并真正影响 runtime 的 `allowCommands / allowFilesystem`
  - 连接测试现在会准备工作目录并执行最小命令，不再只测 `create/kill`
  - [../src/features/sandbox/components/sandbox-content.tsx](../src/features/sandbox/components/sandbox-content.tsx)
  - [../src/features/sandbox/settings.ts](../src/features/sandbox/settings.ts)
  - [../src/features/sandbox/server/e2b-client.ts](../src/features/sandbox/server/e2b-client.ts)

- `allowFileUpload / allowFileDownload / allowPty` 这些字段仍然更多是前置策略配置，当前还没有完整的运行时消费者。
  - 这不是当前 bug，但说明 sandbox capability policy 仍有后续产品化空间。
  - [../src/features/sandbox/types.ts](../src/features/sandbox/types.ts)
  - [../src/features/sandbox/components/sandbox-access-section.tsx](../src/features/sandbox/components/sandbox-access-section.tsx)

- 现在已经补了 policy 传导和连接测试的最小回归，但仍缺更完整的 toolset 级测试。
  - [../tests/unit/features/sandbox/settings.test.ts](../tests/unit/features/sandbox/settings.test.ts)
  - [../tests/unit/features/sandbox/server/e2b-client.test.ts](../tests/unit/features/sandbox/server/e2b-client.test.ts)
  - [../tests/unit/features/chat/agent-runtime/workspace-manifest.test.ts](../tests/unit/features/chat/agent-runtime/workspace-manifest.test.ts)

## `src/features/search`

### Must Fix

- 当前没有剩余的阻塞性 must-fix。

### Follow-up

- 这轮已经补了关键 runtime gating：
  - `buildSearchAgentTools()` 现在会先检查 `search.enabled`，关闭 Search 时不会再注册 `web_search / web_extract / web_crawl`
  - [../src/features/chat/agent-runtime/build-agent-toolset.ts](../src/features/chat/agent-runtime/build-agent-toolset.ts)
  - [../tests/unit/features/chat/agent-runtime/build-agent-toolset.test.ts](../tests/unit/features/chat/agent-runtime/build-agent-toolset.test.ts)

- Search 设置页这轮也补了更明确的连接错误反馈：
  - “测试连接”失败时会优先展示服务端返回的结构化错误消息，而不再只弹通用失败文案
  - [../src/features/search/hooks/use-search-settings.ts](../src/features/search/hooks/use-search-settings.ts)
  - [../tests/unit/features/search/use-search-settings.test.tsx](../tests/unit/features/search/use-search-settings.test.tsx)

- Search provider abstraction 已经建立，但 UI 和类型目前仍然明显 Tavily-first。
  - 例如 `SearchSettings` 仍使用 Tavily-shaped `topic / searchDepth / extractDepth`，设置页也直接写死 Tavily 的获取 key 链接。
  - 这不是当前 bug，但说明“可替换 provider”更多还是 runtime 层，产品层还没 provider-neutral。
  - [../src/features/search/types.ts](../src/features/search/types.ts)
  - [../src/features/search/components/search-content.tsx](../src/features/search/components/search-content.tsx)

- 当前只看到 `settings / providers / tavily-client` 的测试，没有看到 dedicated 测试覆盖聊天 runtime 里的 `web_*` 工具 gating。
  - 这不是当前 bug，但正是为什么上面的 `enabled` 漏洞还能留在当前代码里。
  - [../src/features/search/settings.ts](../src/features/search/settings.ts)
  - [../src/features/search/server/providers/index.ts](../src/features/search/server/providers/index.ts)
  - [../src/features/chat/agent-runtime/build-agent-toolset.ts](../src/features/chat/agent-runtime/build-agent-toolset.ts)

## `src/features/subagents`

### Must Fix

- 当前没有发现新的阻塞性 must-fix 问题。

### Follow-up

- 目前还没有 delegation budget / 次数上限。
  - 主 agent 现在可以在一轮回复里继续多次调用 `delegate_to_subagent`，这仍然是最现实的超时和卡顿来源。
  - 这不是实现错误，但如果后面要继续稳定化，优先级会比较高。
  - [../src/features/chat/ai/tools/delegate_to_subagent.ts](../src/features/chat/ai/tools/delegate_to_subagent.ts)
  - [../src/features/chat/agent-runtime/execute-agent-run.ts](../src/features/chat/agent-runtime/execute-agent-run.ts)

- `rag` 权限当前只是消费本轮已经拿到的 `ragContext`，不是真正独立的知识库检索能力。
  - `rag_agent` 现在能基于主请求已有的检索结果工作，但还不能自己重新发起 KB retrieval。
  - 这不是当前 bug，但能力边界比 UI 名称看起来更窄，后面最好再明确或继续补齐。
  - [../src/features/chat/ai/tools/delegate_to_subagent.ts](../src/features/chat/ai/tools/delegate_to_subagent.ts)

- 当前的 subagent telemetry 主要还是日志，没有进入统一的 run metadata / 统计视角。
  - 现在能看到 `started / completed / failed` 日志，但如果后面要统计哪个 subagent 最常被调用、最慢、最容易失败，这层还不够。
  - [../src/features/chat/ai/tools/delegate_to_subagent.ts](../src/features/chat/ai/tools/delegate_to_subagent.ts)
  - [../src/features/chat/agent-runtime/run-metadata.ts](../src/features/chat/agent-runtime/run-metadata.ts)

- 当前只看到 settings 和 delegation tool 的测试，缺少组件层回归。
  - 特别是 `Delegate To Subagent` 卡片的展开/收起、流式进度和编辑弹窗这几条 UI 主路径，还没有 dedicated 测试保护。
  - [../src/features/subagents/settings.ts](../src/features/subagents/settings.ts)
  - [../src/features/chat/ai/tools/delegate_to_subagent.ts](../src/features/chat/ai/tools/delegate_to_subagent.ts)
  - [../src/features/subagents/components/subagent-content.tsx](../src/features/subagents/components/subagent-content.tsx)
  - [../src/features/subagents/components/subagent-editor-dialog.tsx](../src/features/subagents/components/subagent-editor-dialog.tsx)
