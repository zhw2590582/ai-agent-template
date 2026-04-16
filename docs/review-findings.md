# Review Findings

最后核对时间：2026-04-16

这份文档只记录按 feature 复盘时发现的真实问题，方便后续集中处理。

## Overall

### Snapshot

- 当前一共记录了 `13` 条 must-fix。
- 问题主要集中在：
  - `models / rag / sandbox / mcp`
  - 其次是 `chat / memory / search / skills`
- `auth` 和 `subagents` 当前没有发现新的阻塞性 must-fix，更像 follow-up 稳定化。

### What Looks Healthy

- `src/features/auth`
  - 边界清楚，问题主要是维护性 follow-up。
- `src/features/memory`
  - UI 和主链路都比较克制，当前主要是错误处理过宽。
- `src/features/subagents`
  - 已经是可工作的 `V1`，当前更多是预算、telemetry 和能力补齐。

### What Is Most Fragile

- `src/features/models`
  - 远端 profile 加载和本地草稿同步还不稳，容易覆盖真实配置。
- `src/features/rag`
  - 导入 / 重建索引不是事务性的，容易落入半成功坏状态。
- `src/features/sandbox`
  - access policy 和运行时暴露没有真正打通，测试连接也比真实运行乐观。
- `src/features/mcp`
  - 保存流会覆盖未保存本地改动，多 server 初始化失败还有资源清理缺口。
- `src/features/skills`
  - 现在仍然不是可工作的能力，只是 settings UI + 持久化壳子。

### Recommended Fix Order

1. `src/features/models`
   - 避免 profile 加载后草稿覆盖真实配置
   - provider 连接变化后刷新模型目录
2. `src/features/rag`
   - 修导入 / 重建索引的事务性
   - 修加载失败时直接清空文档列表
3. `src/features/sandbox`
   - 让 access policy 真正影响 runtime 工具暴露
   - 让测试连接更接近真实运行前置条件
4. `src/features/mcp`
   - 修保存/删除 server 覆盖未保存本地改动
   - 修多 server 初始化失败时的 client 清理
5. `src/features/search`
   - 让 `search.enabled` 真正控制 `web_*` 工具注册
6. `src/features/memory`
   - 不再把 memory 读取失败静默吞成空数组
7. `src/features/chat`
   - 修侧边栏搜索分页
8. `src/features/skills`
   - 决定是继续占位，还是真正接入 runtime

### Stage Assessment

- 如果按用户可见主能力看：
  - 项目已经进入 `Core Capabilities V1`
- 如果按工程稳定性看：
  - 还处在 `V1 + 稳定化收尾` 阶段
- 如果按平台能力看：
  - `skills / MCP completion / production-hardening` 仍未完成

## `src/features/auth`

### Must Fix

- 当前没有发现阻塞性的 must-fix 问题。

### Follow-up

- `useAppProfile` 的 `isLoading` 只在首次初始化时依赖 cache 计算；当用户从 guest 切到登录态，或切换到另一个未缓存账号时，不会先显式回到 loading 状态。
  - [../src/features/auth/profile/use-app-profile.ts](../src/features/auth/profile/use-app-profile.ts)
- profile settings 的服务端 schema 和 normalize 逻辑是双份维护的，后续继续扩字段时容易漂移。
  - [../src/features/auth/server/profile-route.ts](../src/features/auth/server/profile-route.ts)
  - [../src/features/auth/profile/profile-settings.ts](../src/features/auth/profile/profile-settings.ts)
- `AppProfile.locale` / `AppProfile.theme` 当前更像草稿快照，而不是稳定持久化偏好，字段语义还可以再明确。
  - [../src/features/auth/profile/profile-draft.ts](../src/features/auth/profile/profile-draft.ts)
  - [../src/features/auth/profile/types.ts](../src/features/auth/profile/types.ts)

## `src/features/chat`

### Must Fix

- 已登录状态下，侧边栏搜索结果无法继续分页加载。
  - `useSidebarConversations` 在 `isSearching === true` 时，`hasMore` 和 `isLoadingMore` 已经切换到 search 分支，但 `loadMore` 仍然固定返回 `pagination.loadMore`。
  - `useSidebarSearch` 目前也只有首屏搜索，没有对应的 `loadMore` 实现。
  - 结果是：搜索命中很多会话时，列表只能拿到第一页，后续滚动不会真正继续加载。
  - [../src/features/chat/hooks/use-sidebar-conversations.ts](../src/features/chat/hooks/use-sidebar-conversations.ts)
  - [../src/features/chat/hooks/use-sidebar-search.ts](../src/features/chat/hooks/use-sidebar-search.ts)

### Follow-up

- `chat` 请求 schema 和 profile settings schema 都各自维护一份 feature settings 结构；虽然职责不同，但字段持续扩展时仍有同步成本。
  - [../src/features/chat/server/schemas.ts](../src/features/chat/server/schemas.ts)
  - [../src/features/auth/server/profile-route.ts](../src/features/auth/server/profile-route.ts)
- `Subagents V1` 目前是最小串行 `Orchestrator-Subagent`，还需要继续补 delegation budget、失败反馈和更清楚的 telemetry。
  - [../src/features/chat/ai/tools/delegate_to_subagent.ts](../src/features/chat/ai/tools/delegate_to_subagent.ts)
  - [../src/features/chat/agent-runtime/execute-agent-run.ts](../src/features/chat/agent-runtime/execute-agent-run.ts)

## `src/features/mcp`

### Must Fix

- 在 MCP 面板里，`saveServer` / `deleteServer` 是基于 `savedSettings` 构造下一份设置，而不是基于当前 `localSettings`。
  - 结果是：如果用户先改了全局 `enabled`、或改了别的 server 的本地状态但还没点总保存，再去“保存某个 server”或“删除某个 server”，这些未保存改动有机会被覆盖掉。
  - [../src/features/mcp/hooks/use-mcp-server-actions.ts](../src/features/mcp/hooks/use-mcp-server-actions.ts)

- 多个远程 MCP server 初始化时，如果中途某个 server 在 `listTools()` 阶段抛错，之前已经创建成功的 MCP client 不会被关闭。
  - `buildAgentToolset` 会吞掉初始化错误并继续请求，但 `createMcpAgentToolBundles` 在抛错前已经打开的 client 没有清理路径。
  - 结果是：聊天请求失败回退时可能泄露已建立的 MCP 连接资源。
  - [../src/features/mcp/server/mcp-client.ts](../src/features/mcp/server/mcp-client.ts)
  - [../src/features/chat/agent-runtime/build-agent-toolset.ts](../src/features/chat/agent-runtime/build-agent-toolset.ts)

### Follow-up

- `useMcpServerActions` 里维护了 `testResults` 状态，但当前 `McpContent` 实际只使用即时返回值来弹测试结果对话框，没有消费这份缓存状态。
  - 这不是 bug，但说明这里有一层多余状态可以后面收掉。
  - [../src/features/mcp/hooks/use-mcp-server-actions.ts](../src/features/mcp/hooks/use-mcp-server-actions.ts)

## `src/features/memory`

### Must Fix

- `listMemoriesForUser` 在查询报错或 `data` 为空时，会直接返回空数组，而不是把读取失败显式暴露出来。
  - 结果是：跨会话 memory 注入这条链路会把“数据库读失败”误当成“用户没有记忆”，上下文会静默丢失。
  - 同时 `saveConversationMemories` 的 merge 逻辑也会把这类读失败当成“当前没有 existing memories”，后续可能做出错误的 insert / update 决策。
  - [../src/features/memory/storage/memory-repository.ts](../src/features/memory/storage/memory-repository.ts)
  - [../src/features/memory/storage/memories.ts](../src/features/memory/storage/memories.ts)
  - [../src/features/chat/agent-runtime/resolve-agent-run-context.ts](../src/features/chat/agent-runtime/resolve-agent-run-context.ts)

### Follow-up

- 当前没有发现 dedicated memory 测试覆盖 `memory-repository / memories.ts` 这条读写链路。
  - 这不是当前 bug，但意味着像“读取失败被静默吞掉”这类问题不容易被回归测试发现。
  - [../src/features/memory/storage/memory-repository.ts](../src/features/memory/storage/memory-repository.ts)
  - [../src/features/memory/storage/memories.ts](../src/features/memory/storage/memories.ts)

## `src/features/models`

### Must Fix

- 模型页的 draft 只在首次 mount 时用 `profile.settings.models` 初始化，后续远端 profile 加载完成后不会自动同步。
  - `useModelsPage` 明明已经拿到了 `isLoading`，但 `ModelsContent` 没有用它挡住初始渲染。
  - 同时 `useModelsDraft` 也没有任何 `useEffect` 去跟随新的 `models` prop 重置本地草稿。
  - 结果是：用户打开模型设置时，如果远端 profile 还没加载完，页面会先用默认 providers 初始化；远端配置回来后，草稿仍然停在旧默认值，后续保存有机会覆盖真实配置。
  - [../src/features/models/hooks/use-models-page.ts](../src/features/models/hooks/use-models-page.ts)
  - [../src/features/models/hooks/use-models-draft.ts](../src/features/models/hooks/use-models-draft.ts)
  - [../src/features/models/components/models-content.tsx](../src/features/models/components/models-content.tsx)

- 当前“保存时自动拉取最新模型列表”只在 `selectedProvider.models.length === 0` 时才触发。
  - 结果是：如果用户改了 provider 的 `apiKey / baseUrl / apiFormat`，但这个 provider 之前已经有一份旧模型列表，保存时不会重新 probe，旧模型会被原样保留。
  - 这会让 provider 连接信息和已保存的模型目录脱节，后面聊天可能继续引用不存在于当前 provider 的旧模型。
  - [../src/features/models/hooks/use-models-page.ts](../src/features/models/hooks/use-models-page.ts)
  - [../src/features/models/hooks/use-provider-probe.ts](../src/features/models/hooks/use-provider-probe.ts)

### Follow-up

- 当前没有看到 dedicated models 测试覆盖 `useModelsDraft / useModelsPage / useProviderProbe` 这条主链路。
  - 这不是当前 bug，但意味着像“profile 加载后草稿不重置”或“provider 连接修改后模型目录仍是旧值”这类问题不容易被自动测试发现。
  - [../src/features/models/hooks/use-models-draft.ts](../src/features/models/hooks/use-models-draft.ts)
  - [../src/features/models/hooks/use-models-page.ts](../src/features/models/hooks/use-models-page.ts)
  - [../src/features/models/hooks/use-provider-probe.ts](../src/features/models/hooks/use-provider-probe.ts)

## `src/features/rag`

### Must Fix

- RAG 文档导入和重建索引当前都不是事务性的。
  - 导入路径里会先插入 `rag_documents`，再插入 `rag_chunks`；如果 chunk 写入失败，就会留下没有 chunk 的半成品 document。
  - 重建索引路径里会先删除旧 chunks，再插入新 chunks；如果新 chunk 写入失败，文档会落到“document 还在，但 chunks 已被清空”的坏状态。
  - 这会直接影响后续检索结果，而且当前代码没有补偿清理或回滚路径。
  - [../src/features/rag/server/ingestion.ts](../src/features/rag/server/ingestion.ts)

- `useRagDocuments` 在加载文档列表时，只要 `GET /api/rag/documents` 返回非 2xx，就会把当前 `documents` 直接清空。
  - 结果是：临时网络失败、认证失败或服务端异常时，用户看到的是“像真的没有文档”一样的空列表，而不是保留上一次成功加载的数据。
  - 这属于错误反馈不准确，而且会让已有文档在 UI 上瞬间消失。
  - [../src/features/rag/hooks/use-rag-documents.ts](../src/features/rag/hooks/use-rag-documents.ts)

### Follow-up

- RAG 自动触发当前仍然偏宽，数学题、纯推理题等无关请求也可能误触发检索。
  - 这条已经在 `project-status / roadmap` 里单独记过，后面应改成更稳的语言无关 gate 或独立判定步骤。
  - [../src/features/chat/agent-runtime/resolve-agent-rag-context.ts](../src/features/chat/agent-runtime/resolve-agent-rag-context.ts)

- 当前只看到 `settings / providers` 的测试，没有看到 dedicated RAG 测试覆盖导入、重建索引、检索和前端 hooks 这几条主链路。
  - 这不是当前 bug，但会让“半成功导入”“加载失败时清空列表”这类问题更难被自动回归发现。
  - [../src/features/rag/server/ingestion.ts](../src/features/rag/server/ingestion.ts)
  - [../src/features/rag/server/retrieval.ts](../src/features/rag/server/retrieval.ts)
  - [../src/features/rag/hooks/use-rag-documents.ts](../src/features/rag/hooks/use-rag-documents.ts)

## `src/features/sandbox`

### Must Fix

- Sandbox 的 access/policy 设置当前没有被完整接进运行时。
  - `SandboxAccessSection` 组件已经存在，但 `SandboxContent` 根本没有渲染它，所以大部分访问策略开关现在在 UI 里都不可见。
  - 更关键的是，runtime 里的 `getSandboxToolPolicy()` 只看 `settings.enabled`，完全忽略了 `access.allowCommands` 和 `access.allowFilesystem`。
  - 结果是：即使后面把这些开关显示出来，`sandbox_run_command / sandbox_read_file / sandbox_write_file` 的暴露与否仍然不会跟着策略变化。
  - `allowFileUpload / allowFileDownload / allowPty` 这些字段目前也没有实际消费者，属于“配置已存在，但能力没接上”。
  - [../src/features/sandbox/components/sandbox-content.tsx](../src/features/sandbox/components/sandbox-content.tsx)
  - [../src/features/sandbox/components/sandbox-access-section.tsx](../src/features/sandbox/components/sandbox-access-section.tsx)
  - [../src/features/sandbox/settings.ts](../src/features/sandbox/settings.ts)
  - [../src/features/chat/agent-runtime/build-agent-toolset.ts](../src/features/chat/agent-runtime/build-agent-toolset.ts)

- Sandbox 的“测试连接”现在过于乐观，不能覆盖真实运行前置条件。
  - `testE2BSandboxConnection()` 只验证了 `Sandbox.create()` 和 `kill()`，并没有检查工作目录是否可创建，也没有跑任何最小命令。
  - 但真实运行时，`E2BSandboxSession.getSandbox()` 还会额外执行 `mkdir -p <workspaceRoot>`；这意味着某些工作目录配置问题会在“测试连接通过”后，直到第一次真正运行工具时才暴露出来。
  - [../src/features/sandbox/server/e2b-client.ts](../src/features/sandbox/server/e2b-client.ts)

### Follow-up

- 当前有 `settings / providers / e2b-client` 的单元测试，但还没有看到 dedicated 测试覆盖“access policy 传导到工具暴露”或“连接测试与真实运行前置条件一致”。
  - 这不是当前 bug，但会让上面两类问题继续存在而不容易被回归发现。
  - [../src/features/sandbox/settings.ts](../src/features/sandbox/settings.ts)
  - [../src/features/sandbox/server/e2b-client.ts](../src/features/sandbox/server/e2b-client.ts)
  - [../src/features/chat/agent-runtime/build-agent-toolset.ts](../src/features/chat/agent-runtime/build-agent-toolset.ts)

## `src/features/search`

### Must Fix

- `search.enabled` 当前没有真正挡住聊天 runtime 里的 `web_*` 工具暴露。
  - `buildSearchAgentTools()` 会无条件把 `searchSettings` 传给 `createWebSearchTool / createWebExtractTool / createWebCrawlTool`。
  - 但这些 tool 的可用性判断走的是 `hasResolvedSearchAccess()`，它只检查 `apiKey`，完全不看 `enabled`。
  - 结果是：只要用户保存过 search API key，即使在 UI 里把 Search 关掉，聊天 runtime 里 `web_search / web_extract / web_crawl` 仍然会继续注册。
  - [../src/features/search/server/providers/index.ts](../src/features/search/server/providers/index.ts)
  - [../src/features/chat/agent-runtime/build-agent-toolset.ts](../src/features/chat/agent-runtime/build-agent-toolset.ts)

### Follow-up

- Search 设置页的“测试连接”在失败时只弹通用错误文案，没有消费服务端返回的结构化错误信息。
  - 这不是运行时 bug，但用户排查 API key / 网络问题时拿不到像 Tavily HTTP status 或网络错误这类更具体的信息。
  - [../src/features/search/hooks/use-search-settings.ts](../src/features/search/hooks/use-search-settings.ts)

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

## `src/features/skills`

### Must Fix

- `skills.enabled` 和 `skills.skills[]` 当前只有 settings UI 和持久化，没有任何 runtime 消费者。
  - 现在 `SkillsContent` 可以保存总开关和技能列表，但聊天 runtime、toolset、prompt 组装里都没有读取或注入这些设置。
  - 结果是：用户在 UI 里看到的是“像已经配置了 skills”，但对实际聊天行为完全没有影响。
  - [../src/features/skills/components/skills-content.tsx](../src/features/skills/components/skills-content.tsx)
  - [../src/features/chat/hooks/use-chat-workbench.ts](../src/features/chat/hooks/use-chat-workbench.ts)
  - [../src/features/auth/profile/use-app-profile.ts](../src/features/auth/profile/use-app-profile.ts)

- “新增 skill” 这条主路径当前没有打通。
  - `SkillList` 顶部的 add 按钮是永久 `disabled`，只显示 tooltip。
  - `createSkillDraft()` 已存在，但没有任何调用点；`useSkillsSettings.saveSkill(..., 'add')` 的 add 分支也是死路径。
  - 结果是：当前页面只能编辑或删除已经存在的 skill，无法真正新增，这和 UI/类型层已经准备好的能力不一致。
  - [../src/features/skills/components/skill-list.tsx](../src/features/skills/components/skill-list.tsx)
  - [../src/features/skills/settings.ts](../src/features/skills/settings.ts)
  - [../src/features/skills/hooks/use-skills-settings.ts](../src/features/skills/hooks/use-skills-settings.ts)

### Follow-up

- `SkillCapabilityBadges` 组件和 `SkillDefinition.capabilities` 字段当前几乎没有进入实际编辑/展示主链路，说明能力模型还停留在结构预留阶段。
  - 这不是当前 bug，但和 `skills` 的 runtime 缺失一起表明：这块更像“配置草图”，还不是可工作的 V1。
  - [../src/features/skills/components/skill-capability-badges.tsx](../src/features/skills/components/skill-capability-badges.tsx)
  - [../src/features/skills/types.ts](../src/features/skills/types.ts)

- 当前没有看到任何 dedicated skills 测试。
  - 这不是当前 bug，但意味着这块后面真正接 runtime 时，行为回归几乎没有自动保护。
  - [../src/features/skills/hooks/use-skills-settings.ts](../src/features/skills/hooks/use-skills-settings.ts)
  - [../src/features/skills/components/skills-content.tsx](../src/features/skills/components/skills-content.tsx)

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
