# Architecture

本文档只描述当前代码怎么组织，不描述远期愿景。

## 目标

当前架构的重点是三件事：

- 让聊天主链路保持稳定
- 让新能力能按边界逐步接入
- 不为了“未来可能需要”而提前过度设计

## 当前结构

```text
src/
├── app/
│   ├── [locale]/            # 路由和布局入口
│   ├── api/chat/route.ts    # API 入口，保持很薄
│   └── api/conversations/   # 会话读写与分页/搜索
├── components/
│   ├── ai-elements/         # AI Elements 组件源码
│   ├── ui/                  # shadcn/ui 基础组件
│   ├── language-switcher.tsx
│   └── theme-toggle.tsx
├── features/chat/           # 当前唯一真实业务域
├── config/                  # app/env/i18n/theme 等配置
├── i18n/                    # next-intl 请求配置
├── lib/                     # 共享工具、错误处理、日志
├── locales/                 # 翻译文件
├── proxy.ts                 # locale 检测和重定向
└── server/
    ├── ai/
    │   ├── models.ts
    │   ├── prompts.ts
    │   └── tools/
    ├── chat.ts
    ├── storage/
    └── types.ts
```

## 模块职责

### `src/app`

只放 Next.js 路由入口和布局。

- 页面文件只负责挂载页面级组件
- `route.ts` 只负责转发到 handler
- 不在这里写模型、工具、业务编排逻辑

### `src/features/chat`

当前唯一真实业务域。

- `pages/`: 页面级组装
- `components/`: 聊天相关 UI（侧边栏、顶部栏、消息区）
- `lib/`: 前端侧轻量 helper（同步、分页、搜索）

注意：很多导航页虽然存在，但本质上仍是复用 chat workbench 的占位视图，不代表已经形成独立业务域。

### `src/components`

放基础 UI 和第三方组件源码。

- 优先复用，不要在业务层平行造轮子
- 如果要改第三方组件行为，做最小修改

### `src/config`

放所有集中配置。

- `env.ts`: 环境变量校验
- `app.ts`: 默认模型、token 限制等应用配置
- `i18n.ts`: locale 配置
- `theme.ts`: 主题相关常量

### `src/lib`

放跨域共享工具。

- `errors.ts`: 错误分类与统一响应
- `logger.ts`: 日志封装
- `i18n.ts`: 辅助翻译函数
- `utils.ts`: 通用纯函数

### `src/server`

放服务端 AI 编排逻辑。

- `chat.ts`: 当前聊天请求主入口
- `ai/models.ts`: 模型/provider 封装
- `ai/prompts.ts`: 系统 prompt
- `ai/tools/`: 工具定义和注册
- `storage/`: Supabase 会话读写与搜索
- `types.ts`: 为后续 Memory / RAG / Planning / Multi-Agent 预留共享类型

## 当前请求链路

```text
UI input
  -> useChat
  -> /api/chat
  -> src/server/chat.ts
  -> model + tools
  -> stream response
  -> chat UI

Sidebar list/search
  -> /api/conversations
  -> src/server/storage/conversations.ts
  -> Supabase
```

## 当前架构判断

已经稳定的部分：

- 聊天主链路
- 工具模块化
- prompt 抽离
- i18n 路由
- 基础配置、错误处理、日志

还没形成真实模块的部分：

- memory
- provider 管理
- agents
- plugins
- skills
- settings

## 扩展规则

后续新能力按这个方向接：

1. 新的服务端编排逻辑放 `src/server`
2. 新的业务界面放 `src/features/<domain>`
3. 可跨域复用的纯工具函数才放 `src/lib`
4. 路由层继续保持薄，不把业务逻辑塞进 `app`
