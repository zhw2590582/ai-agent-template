# Architecture

本文档只描述当前代码怎么组织，不描述远期愿景。

## 目标

当前架构的重点是三件事：

- 让聊天主链路保持稳定
- 让登录与会话持久化清晰落地
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
│   └── chat/                   # 当前唯一真实业务域
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

当前唯一真实业务域。

- `pages/`: 页面级组装
- `components/`: 聊天相关 UI
- `lib/`: 前端侧 helper、同步、分页、搜索
- `server/`: 聊天请求 handler 和 schema
- `storage/`: 会话存储与查询
- `ai/`: 模型、prompt、工具、标题生成

注意：很多导航页虽然存在，但本质上仍是复用 chat workbench 的占位视图，不代表已经形成独立业务域。

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
- `i18n.ts`: locale 配置

### `src/lib`

放跨域共享工具。

- `errors.ts`: 错误分类与统一响应
- `logger.ts`: 日志封装
- `i18n.ts`: 翻译辅助
- `supabase/*`: server/client/proxy 侧 Supabase 封装
- `utils.ts`: 通用纯函数

## 当前请求链路

```text
UI input
  -> useChat
  -> /api/chat
  -> src/features/chat/server/chat.ts
  -> model + tools
  -> stream response
  -> chat UI

Sidebar list/search/create
  -> /api/conversations
  -> src/features/chat/storage/conversations.ts
  -> Supabase

OAuth sign-in
  -> Supabase auth
  -> /auth/callback
  -> profiles upsert
  -> redirect back to locale route
```

## 当前架构判断

已经稳定的部分：

- 聊天主链路
- 工具模块化
- prompt 抽离
- i18n 路由
- 主题与 hydration 处理
- Supabase 登录和会话持久化
- 基础配置、错误处理、日志

还没形成真实模块的部分：

- memory
- rag
- provider 管理抽象
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
