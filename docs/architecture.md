# Architecture

## Goals

当前项目的目标不是一次性做成大而全的平台，而是建立一个可以持续生长的 AI Agent 应用骨架：

- UI 可以持续扩展
- Server 逻辑可以逐步增强
- 新能力可以沿着现有边界自然接入
- 在依赖保持克制的前提下，代码仍然清晰

## Runtime Structure

```text
src/
├── app/
│   ├── api/
│   │   └── chat/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ai-elements/
│   └── ui/
├── features/
│   └── chat/
│       ├── components/
│       ├── lib/
│       └── pages/
├── lib/
│   └── utils.ts
└── server/
    ├── ai/
    │   ├── models.ts
    │   └── tools.ts
    └── chat.ts
```

## Layer Responsibilities

### `src/app`

只保留 Next.js 路由入口。

- `page.tsx`: 挂载页面级组合组件
- `api/chat/route.ts`: 挂载服务端 handler
- `layout.tsx`: 主题、provider、全局壳子

规则：

- 不在这里写复杂业务逻辑
- 不在这里堆工具、模型、数据转换

### `src/features/chat`

这是当前唯一业务域。

- `pages/`: 页面级组合，负责把多个组件拼装起来
- `components/`: 聊天 UI 组件
- `lib/`: 轻量配置、消息处理函数、纯前端 helper

未来如果新增业务域，按同级继续扩：

- `features/memory`
- `features/rag`
- `features/planning`
- `features/settings`

### `src/components`

这里放第三方组件源码和基础 UI 组件。

- `components/ai-elements`: AI Elements 组件
- `components/ui`: shadcn/ui 基础组件

规则：

- 尽量优先复用这里已有组件
- 非必要不要在业务层重复造输入框、消息容器、工具展示组件
- 如果要改第三方组件行为，优先做最小修改

### `src/server`

服务端 AI 能力集中在这里。

- `server/chat.ts`: 当前 chat handler
- `server/ai/models.ts`: 模型配置
- `server/ai/tools.ts`: 工具定义

未来推荐扩成：

```text
src/server/
├── ai/
│   ├── models.ts
│   ├── prompts.ts
│   ├── tools/
│   ├── memory/
│   ├── rag/
│   └── planners/
├── chat.ts
└── storage/
```

## Current Request Flow

```text
User Input
  -> useChat
  -> /api/chat
  -> server/chat.ts
  -> streamText(...)
  -> registered tools
  -> UI message stream
  -> AI Elements chat UI
```

## Extension Strategy

后续新增能力时，优先按下面原则扩展：

1. 新增 prompt / orchestration 逻辑，放 `src/server`
2. 新增业务界面，放 `src/features/<domain>`
3. 复用聊天 UI 时，优先基于 `AI Elements` 组合
4. 只有跨域复用的纯工具函数，才放 `src/lib`

## Near-Term Refactors

当前结构已经能继续开发，但为了后续功能更顺，建议在新能力接入前逐步完成这些拆分：

1. 把 `src/server/ai/tools.ts` 拆成多个工具文件
2. 把系统 prompt 从 `src/server/chat.ts` 抽到 `src/server/ai/prompts.ts`
3. 给消息、工具输出、未来 memory/rag 结果定义共享类型
4. 当有持久化需求时，再引入 `storage` 或 `repositories` 层

