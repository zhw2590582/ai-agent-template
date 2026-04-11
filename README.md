# AI Agent App

一个面向长期扩展的 AI Agent Web App 骨架。

当前版本聚焦三件事：

- 宽屏暗黑聊天布局，接近 `chatgpt.com`
- 使用 `AI Elements` 和 `shadcn/ui` 作为主要 UI 组件来源
- 建立可持续扩展的代码结构，为后续接入 memory、RAG、planning 和 multi-agent 做准备

## Current Scope

当前已经具备：

- 基于 `useChat` 的流式聊天
- 服务端工具调用
- 暗黑主题聊天界面
- 功能域与服务端分层

当前还没有做：

- 会话持久化
- 用户系统
- RAG
- 任务规划
- 多代理协作

这些能力会在现有结构上逐步接入，而不是推倒重来。

## Run

```bash
bun install
bun run dev
```

默认入口：

- App: `http://localhost:3000`

## Structure

```text
src/
├── app/
│   ├── api/chat/route.ts
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

## Docs

新的文档入口在 [docs/README.md](./docs/README.md)。

建议阅读顺序：

1. [docs/architecture.md](./docs/architecture.md)
2. [docs/conventions.md](./docs/conventions.md)
3. [docs/roadmap.md](./docs/roadmap.md)

保留的参考资料：

- [docs/ai-agents-for-beginners](./docs/ai-agents-for-beginners)
- [docs/mcp-for-beginners](./docs/mcp-for-beginners)

## Stack

- Next.js 16
- React 19
- Vercel AI SDK
- AI Elements
- shadcn/ui
- Tailwind CSS v4
- Zod
- Bun

## Theme

当前项目固定为暗黑主题。

目标不是做一套完整主题系统，而是先把聊天产品体验和结构稳定下来。

## Near-Term Direction

下一阶段推荐先做这些整理，再继续接功能：

1. 把 `src/server/ai/tools.ts` 拆成多个工具文件
2. 把系统 prompt 抽离到 `src/server/ai/prompts.ts`
3. 补充共享类型，给 memory / rag / planning 做准备

