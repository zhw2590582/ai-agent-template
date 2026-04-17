# Architecture

这份文档只回答一件事：

当前代码按什么边界组织。

它不负责说明“哪些能力已经做完”。功能范围统一看 [project-status.md](./project-status.md)。

## 当前结构

```text
src/
├── app/
│   ├── [locale]/               # 页面和布局入口
│   ├── api/chat/route.ts       # 聊天 API 入口，保持很薄
│   ├── api/conversations/      # 会话读写、分页、搜索
│   ├── api/mcp/route.ts        # demo / 预留 MCP server 入口
│   ├── api/mcp/test/route.ts   # 远程 MCP server 测试
│   └── auth/callback/route.ts  # Supabase OAuth 回调
├── components/
│   ├── ai-elements/            # AI Elements 原子组件
│   ├── ui/                     # shadcn/ui 原子组件
│   └── ui-settings/            # 语言和主题切换
├── config/                     # env / i18n / limits / chat 等集中配置
├── features/
│   ├── auth/                   # 认证、profile、settings 持久化
│   ├── chat/                   # 聊天 UI、会话链路、agent runtime
│   ├── memory/                 # 记忆和摘要
│   ├── models/                 # provider / model 配置
│   ├── mcp/                    # 远程 MCP client 集成
│   ├── rag/                    # 文档导入和检索
│   ├── sandbox/                # Sandbox provider 配置和服务端执行边界
│   ├── search/                 # Tavily 配置和服务端 client
│   ├── settings/               # app 级 settings schema / normalize 共享层
│   └── skills/                 # Skills settings UI
├── i18n/                       # next-intl 配置和消息聚合
├── lib/                        # 跨域共享工具、错误、日志、Supabase client
└── proxy.ts                    # locale 检测和 session 更新
```

## 目录边界

### `src/app`

只放 Next.js 路由入口和布局。

- 页面文件只挂载页面级组件
- `route.ts` 只转发到 handler
- 不在这里堆业务编排

### `src/features`

真实业务域都放这里。

每个 feature 默认按需要逐步生长：

- `components/`
- `hooks/`
- `server/`
- `storage/`
- `settings.ts`
- `types.ts`

不是每个 feature 都必须同时拥有这些目录，按真实复杂度增长即可。

### `src/features/chat`

聊天是主业务域，但现在已经分成两层：

1. 页面和交互层
2. `agent-runtime/` 编排层

当前 `chat/` 内最重要的边界是：

- `hooks/`: 页面编排、会话状态、transport wrapper
- `server/`: 聊天请求入口和 schema
- `agent-runtime/`: request、context、toolset、workspace、response、finish
- `storage/`: 会话存储和 guest 本地线程
- `ai/`: 模型、prompt、memory helper、底层 tool / workflow 适配

规则：

- 新的聊天运行时逻辑优先进 `agent-runtime/`
- `chat.ts` 保持薄入口
- `ai/workflows/*` 是底层执行适配，不再承担新的业务编排

### 其他 feature

`memory / models / search / sandbox / mcp / rag / skills` 都保持“自己的 UI、自己的 settings、自己的 server adapter”。

它们提供 capability 或数据，不反向接管聊天主链路。

### `src/components`

这里只放原子组件和很薄的通用包装。

规则：

- 优先复用
- 不在业务层平行造一套基础组件
- `src/components/ui/*` 和 `src/components/ai-elements/*` 视为原子层

### `src/config`

所有集中配置都放这里，例如：

- `env.ts`
- `chat.ts`
- `memory.ts`
- `models.ts`
- `search.ts`
- `api-rate-limit.ts`
- `i18n.ts`

### `src/lib`

这里只放跨 feature 共享的基础设施：

- 错误处理
- 日志
- rate limit
- Supabase client
- 通用纯函数

判断标准：

- 如果逻辑明显属于某个业务域，就放回 `features/<domain>`
- 只有真正跨域复用的能力才进 `lib`

## 核心链路

### 聊天主链路

```text
Chat UI
  -> useChatSession (wrapper)
  -> useAgentSession
  -> /api/chat
  -> src/features/chat/server/chat.ts
  -> src/features/chat/agent-runtime/* (runtimeOverrides)
  -> model + context + tools
  -> stream response
  -> chat UI
```

### 用户设置链路

```text
Workbench Dialog
  -> feature hook
  -> /api/profile
  -> src/features/settings/*
  -> profiles.settings
  -> localStorage fallback for guest when applicable
```

这个模式适用于：

- Models
- Memory settings
- Search
- Sandbox
- MCP
- Skills
- RAG settings

### 会话存储链路

```text
Sidebar / Chat actions
  -> conversation-operations
  -> src/features/chat/sources/conversation-record-source.ts
  -> authenticated: src/features/chat/storage/conversations.ts
  -> guest: src/features/chat/storage/local-conversation-store.ts (IndexedDB-backed)
```

### 认证链路

```text
OAuth sign-in
  -> Supabase auth
  -> /auth/callback
  -> profiles upsert / sync
  -> redirect back to locale route
```

## 运行时边界

### Agent Runtime

`agent-runtime/` 是当前聊天能力的统一编排层。

它负责：

- 组织请求
- 解析运行时上下文
- 合并 tools
- 构建 workspace/session
- 执行 stream response
- finish persistence 和 telemetry

它不负责：

- 页面交互
- feature 自己的 settings UI
- 某个单独 provider 的具体实现细节

### Client / Server 边界

`agent-runtime` 需要严格区分 client 和 server：

- client 只从 `src/features/chat/agent-runtime/client.ts` 导入
- server 只从 `src/features/chat/agent-runtime/server.ts` 导入

不要在 client 代码里直接走 server-heavy 的 barrel。

## i18n 组织

语言消息按领域拆分，再统一聚合：

- `src/i18n/locales/blocks/en-US/*`
- `src/i18n/locales/blocks/zh-CN/*`
- `src/i18n/locales/en-US.ts`
- `src/i18n/locales/zh-CN.ts`

新增 feature 文案时，优先补对应 block。

## 扩展规则

后续改动优先遵守这几条：

1. `app` 保持薄
2. 新能力先放进自己的 feature
3. 聊天 runtime 相关编排走 `agent-runtime`
4. 不把 feature 细节重新堆回 `chat.ts`
5. 不因为预期中的远期需求，提前拆太深目录

## 相关文档

- 功能范围和当前状态：看 [project-status.md](./project-status.md)
- 聊天 runtime 方向：看 [agent-harness.md](./agent-harness.md)
- 开发约束：看 [conventions.md](./conventions.md)
- 推进顺序：看 [roadmap.md](./roadmap.md)
