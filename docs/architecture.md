# Architecture

本文档只描述当前代码怎么组织，不描述远期愿景。

## 目标

当前架构的重点是三件事：

- 让聊天主链路保持稳定
- 让模型/provider 配置成为真实能力
- 让登录与会话持久化清晰落地
- 让 Memory 成为真实能力而不是占位
- 让新能力能按边界逐步接入，而不是提前过度设计

## 当前结构

```text
src/
├── app/
│   ├── [locale]/               # 路由和布局入口
│   ├── api/chat/route.ts       # 聊天 API 入口，保持很薄
│   ├── api/conversations/      # 会话读写、分页、搜索
│   ├── api/mcp/route.ts        # 预留给未来本项目自己的 MCP server
│   ├── api/mcp/test/route.ts   # 当前用于测试远程 MCP server
│   └── auth/callback/route.ts  # Supabase OAuth 回调
├── components/
│   ├── ai-elements/            # AI Elements 组件源码
│   ├── ui/                     # shadcn/ui 基础组件
│   └── ui-settings/            # 语言和主题切换
├── config/                     # app/env/i18n 等集中配置
├── features/
│   ├── auth/                   # 登录 UI、用户快照、profile 同步
│   ├── chat/                   # 聊天工作台与会话链路
│   ├── memory/                 # 长期记忆、摘要与 Memory 弹窗内容
│   ├── models/                 # provider 配置、模型同步、自定义 provider/model
│   ├── mcp/                    # 远程 MCP server 配置、测试、tool client
│   ├── sandbox/                # E2B runtime 配置、执行策略、环境变量
│   └── search/                 # Tavily 搜索设置、连接测试、服务端 client
├── i18n/                       # next-intl 请求配置
├── lib/                        # 共享工具、错误处理、日志、Supabase client
└── middleware.ts               # locale 检测和 session 更新
```

## 模块职责

### `src/app`

只放 Next.js 路由入口和布局。

- 页面文件只负责挂载页面级组件
- `route.ts` 只负责转发到 handler 或返回薄响应
- 不在这里写模型、工具、业务编排逻辑

### `src/features/chat`

当前核心业务域。

- `pages/`: 页面级组装
- `components/`: 聊天相关 UI
- `data/`: guest / 已登录会话操作适配层
- `hooks/`: workbench、session、sidebar、标题、非法会话保护等编排 hook
- `server/`: 聊天请求 handler 和 schema
- `storage/`: 已登录会话存储、guest 本地会话 store、标题生成
- `utils/`: 轻量纯函数和配置辅助
- `ai/`: 模型、prompt、记忆辅助生成、工具、workflow 入口
- `components/workbench/*`: 顶部工作台弹窗壳与共享布局

当前已经形成的关键边界：

- `use-chat-workbench`: 页面总编排，不再直接承载所有副作用
- `use-conversation-records`: 会话记录读写和 guest / auth 适配
- `use-conversation-list-store`: sidebar 乐观列表状态
- `conversation-operations.ts`: guest / 已登录会话操作统一出口
- `local-conversation-store.ts`: guest 本地线程存储和订阅
- `local-conversation-title.ts`: guest 标题生成
- `ai/core/*`: 运行时模型与默认 prompt
- `ai/memory/*`: 标题和摘要生成
- `ai/tools/*`: search / extract / crawl 等 tool 封装
- `ai/workflows/*`: 最基础的 `streamText` workflow，以及后续更复杂编排的落点

### `src/features/memory`

当前已经是第三个真实业务域。

- `components/`: controls、memory list、summary list、编辑弹窗
- `hooks/`: 页面编排
- `hooks/use-memory-settings-draft.ts`: settings draft、保存、重置
- `storage/`: repository、抽取、归并、检索、导出等 memory 管理逻辑
- `types.ts`: canonical memory kinds 与结构定义

当前已经形成的关键边界：

- `use-memory-page.ts`: 页面级交互与 optimistic state
- `memory-repository.ts`: Supabase 读写
- `memory-extraction.ts`: AI SDK structured output 抽取
- `memory-merge.ts`: dedupe / merge / canonical kind
- `memory-retrieval.ts`: 记忆注入上下文拼接与数量上限控制
- `memory-consolidation.ts`: 单维度 memory consolidation（达到阈值后用 LLM 做归并）

### `src/features/models`

当前第二个真实业务域。

- `components/`: provider 列表、provider 设置、模型列表
- `hooks/`: profile.settings 的读写、保存串行化、页面编排
- `server/`: provider 测试连接和模型同步
- `utils/`: provider/model 归一化、runtime option 推导

它的职责不是管理平台内置模型，而是管理用户自己接入的第三方 provider 与模型。

当前已经形成的关键边界：

- `use-models-page.ts`: Models 内容级编排
- `use-models-draft.ts`: provider / model draft state
- `use-provider-probe.ts`: provider 连接测试

### `src/features/search`

当前已成为一个真实 feature，而不是占位页。

- `components/`: Search 弹窗内容和三类设置分组
- `hooks/`: Search settings draft、保存、连接测试
- `server/`: Tavily client 和 test helper
- `settings.ts`: Search settings normalize / access 判断
- `types.ts`: Search settings 结构

当前已经形成的关键边界：

- `use-search-settings.ts`: Search 弹窗的 settings controller
- `tavily-client.ts`: Tavily 请求与错误处理统一入口
- `chat/ai/tools/*`: 只负责 AI tool 封装，不再各自手写 Tavily fetch

### `src/features/sandbox`

当前已经不是纯占位，但范围还只限于“sandbox settings management”。

- `components/`: Sandbox 弹窗内容、运行时概览和各设置分组
- `hooks/`: Sandbox settings draft、保存、重置
- `settings.ts`: Sandbox settings normalize / access 判断
- `types.ts`: Sandbox settings 结构

当前关键边界：

- `use-sandbox-settings.ts`: Sandbox 弹窗的 settings controller
- `sandbox-content.tsx`: Sandbox 设置入口与分组编排
- `profile.settings.sandbox`: 当前唯一真实落点

注意：

- 当前还没有真实 E2B client
- 还没有 `/api/sandbox/test`
- 还没有把 sandbox runtime 接进聊天工具链

### `src/features/mcp`

当前已经是一个真实 feature，但范围还只限于“远程 MCP tools integration”。

- `components/`: MCP 弹窗、server 列表、编辑弹窗、测试结果弹窗
- `hooks/`: MCP settings draft、保存、测试
- `server/`: 远程 MCP client 初始化、tools 列表、tool set 构建
- `settings.ts`: MCP settings normalize / access 判断
- `types.ts`: MCP 多 server 结构定义

当前关键边界：

- `use-mcp-settings.ts`: MCP 弹窗的 settings controller
- `mcp-client.ts`: 远程 MCP client 生命周期和多 server tool merge
- `app/api/mcp/test/route.ts`: 测试远程 MCP server，并返回 tools / resources / prompts / capabilities

注意：

- `src/features/mcp` 现在描述的是“本项目作为 MCP client”
- 不是“本项目自己的 MCP server”
- 测试弹窗里展示 resources / prompts / capabilities，不代表这些能力已经接入聊天运行时

### `src/features/auth`

负责认证相关的最小闭环：

- 登录弹窗和 OAuth 按钮
- 用户快照上下文
- 从认证用户同步 `profiles` 表

它是一个真实 feature，但范围明显小于 `features/chat`。另外，`profile.settings` 的聚合、归一化、持久化已经收敛在 `src/features/auth/profile/*`。

### `src/components`

放基础 UI 和第三方组件源码。

- 优先复用，不要在业务层平行造轮子
- 如果要改第三方组件行为，做最小修改

### `src/config`

放所有集中配置，已经按主题拆分。

- `env.ts`: 环境变量校验
- `chat.ts`: AI / chat / UI 时序相关配置
- `memory.ts`: memory 与 consolidation 相关配置
- `models.ts`: model sync 配置
- `search.ts`: Tavily endpoint 和默认搜索配置
- `api.ts` / `api-rate-limit.ts`: API 相关配置
- `i18n.ts`: locale 配置
- `limits.ts` / `navigation.ts` / `theme.ts` / `dev.ts`: 其余主题配置

### `src/lib`

放跨域共享工具。

- `errors.ts`: 错误分类与统一响应
- `logger.ts`: 日志封装
- `i18n.ts`: 翻译辅助
- `rate-limit.ts`: route-level 频率限制
- `supabase/*`: server/client/proxy 侧 Supabase 封装
- `utils.ts`: 通用纯函数

## 当前请求链路

```text
UI input
  -> useChat + runtimeModel
  -> /api/chat
  -> src/features/chat/server/chat.ts
  -> model + tools
  -> stream response
  -> chat UI

Models UI
  -> workbench dialog
  -> useModelsPage
  -> useAppProfile
  -> /api/profile
  -> localStorage or Supabase profile.settings

Test connection
  -> /api/models/providers
  -> src/features/models/server/providers.ts
  -> sync models back into profile.settings

Sidebar list/search/create
  -> conversation-operations
  -> src/features/chat/storage/conversations.ts or local-conversation-store.ts
  -> Supabase or localStorage

Memory extraction / retrieval
  -> src/features/chat/server/chat.ts
  -> src/features/memory/storage/*
  -> conversations.summary / public.memories

Memory UI
  -> workbench dialog
  -> useMemoryPage
  -> /api/profile + /api/memories + /api/conversations
  -> settings / memories / summaries

Search UI
  -> workbench dialog
  -> useSearchSettings
  -> /api/profile + /api/search/test
  -> Tavily-backed tools

Sandbox UI
  -> workbench dialog
  -> useSandboxSettings
  -> /api/profile
  -> profile.settings.sandbox

MCP UI
  -> workbench dialog
  -> useMcpSettings
  -> /api/profile + /api/mcp/test
  -> remote MCP tools

API routes
  -> src/lib/rate-limit.ts
  -> src/config/api-rate-limit.ts
  -> 429 + Retry-After

OAuth sign-in
  -> Supabase auth
  -> /auth/callback
  -> profiles upsert
  -> redirect back to locale route
```

## 当前架构判断

已经稳定的部分：

- 聊天主链路
- 用户侧 provider / model 配置
- prompt 抽离
- Memory V1（summary + long-term memories + cross-conversation injection）
- i18n 路由
- locale 文件按领域分块聚合
- 主题与 hydration 处理
- Supabase 登录和会话持久化
- route-level API rate limiting
- 基础配置、错误处理、日志
- Sandbox settings UI 与持久化

还没形成真实模块的部分：

- rag
- agents / subagents
- sandbox runtime
- skills 管理
- settings

## 扩展规则

后续新能力按这个方向接：

1. 新的服务端编排逻辑优先放 `src/features/<domain>/server`，跨 feature 的纯服务端基础设施再考虑进 `src/lib`
2. 新的业务界面放 `src/features/<domain>`
3. 可跨域复用的纯工具函数才放 `src/lib`
4. 路由层继续保持薄，不把业务逻辑塞进 `app`
5. 只有在某个能力真正成形后，才把它从占位页升级成独立 feature

## i18n 组织方式

当前语言文件不再继续维护成单一超大对象，而是：

- `src/i18n/locales/en-US.ts`
- `src/i18n/locales/zh-CN.ts`

作为聚合入口；

- `src/i18n/locales/blocks/en-US/*`
- `src/i18n/locales/blocks/zh-CN/*`

按领域拆分消息块。新增 feature 文案时，优先补对应领域文件，再由聚合入口统一导出。
