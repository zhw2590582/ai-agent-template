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
│   ├── api/mcp/route.ts        # 当前仅占位
│   └── auth/callback/route.ts  # Supabase OAuth 回调
├── components/
│   ├── ai-elements/            # AI Elements 组件源码
│   ├── ui/                     # shadcn/ui 基础组件
│   └── ui-settings/            # 语言和主题切换
├── config/                     # app/env/i18n 等集中配置
├── features/
│   ├── auth/                   # 登录 UI、用户快照、profile 同步
│   ├── chat/                   # 聊天工作台与会话链路
│   ├── memory/                 # 长期记忆、摘要与 Memory 页面
│   └── models/                 # provider 配置、模型同步、自定义 provider/model
├── i18n/                       # next-intl 请求配置
├── lib/                        # 共享工具、错误处理、日志、Supabase client
└── proxy.ts                    # locale 检测和 session 更新
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

当前已经形成的关键边界：

- `use-chat-workbench`: 页面总编排，不再直接承载所有副作用
- `use-conversation-records`: 会话记录读写和 guest / auth 适配
- `use-conversation-list-store`: sidebar 乐观列表状态
- `conversation-operations.ts`: guest / 已登录会话操作统一出口
- `local-conversation-store.ts`: guest 本地线程存储和订阅
- `local-conversation-title.ts`: guest 标题生成
- `ai/core/*`: 运行时模型与默认 prompt
- `ai/memory/*`: 标题和摘要生成

### `src/features/memory`

当前已经是第三个真实业务域。

- `pages/`: Memory 页面
- `components/`: controls、memory list、summary list、编辑弹窗
- `hooks/`: 页面编排
- `storage/`: repository、抽取、归并、检索、导出等 memory 管理逻辑
- `types.ts`: canonical memory kinds 与结构定义

当前已经形成的关键边界：

- `use-memory-page.ts`: 页面级交互与 optimistic state
- `memory-repository.ts`: Supabase 读写
- `memory-extraction.ts`: AI SDK structured output 抽取
- `memory-merge.ts`: dedupe / merge / canonical kind
- `memory-retrieval.ts`: relevance top-k 检索和上下文拼接

### `src/features/models`

当前第二个真实业务域。

- `pages/`: models 工作台页面
- `components/`: provider 列表、provider 设置、模型列表
- `hooks/`: profile.settings 的读写、保存串行化、页面编排
- `server/`: provider 测试连接和模型同步
- `utils/`: provider/model 归一化、runtime option 推导

它的职责不是管理平台内置模型，而是管理用户自己接入的第三方 provider 与模型。

当前已经形成的关键边界：

- `use-model-profile`: profile 加载、同步和对外 API
- `profile-storage.ts`: localStorage / remote profile / event 同步
- `profile-persistence.ts`: 保存串行化与写库
- `profile-actions.ts`: provider / model 更新动作
- `use-models-page.ts`: Models 页面级编排

### `src/features/auth`

负责认证相关的最小闭环：

- 登录弹窗和 OAuth 按钮
- 用户快照上下文
- 从认证用户同步 `profiles` 表

它是一个真实 feature，但范围明显小于 `features/chat`。

### `src/components`

放基础 UI 和第三方组件源码。

- 优先复用，不要在业务层平行造轮子
- 如果要改第三方组件行为，做最小修改

### `src/config`

放所有集中配置。

- `env.ts`: 环境变量校验
- `app.ts`: 模型、导航、主题等应用配置
- `api-rate-limit.ts`: API 频率限制配置
- `i18n.ts`: locale 配置

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
  -> useModelsPage
  -> useModelProfile
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

还没形成真实模块的部分：

- rag
- agents / subagents
- sandbox
- mcp 管理
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
