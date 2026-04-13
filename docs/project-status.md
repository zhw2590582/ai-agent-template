# Project Status

最后核对时间：2026-04-13

## 项目定位

这是一个可持续扩展的 AI Agent Web App 骨架。

当前目标不是做完整平台，而是把以下几层稳定下来：

- 聊天主链路
- 服务端工具调用骨架
- 登录与会话持久化
- 为 Memory、RAG、Planning、多代理预留清晰边界

## 当前真实状态

### 已完成

- 基于 `useChat` 的流式聊天
- 服务端 `/api/chat` 到 `streamText(...)` 的主链路
- DeepSeek 模型接入，兼容 OpenAI SDK 风格调用
- 工具调用骨架：天气、计算器、时间
- 国际化：`zh-CN` / `en-US`
- 主题切换（已处理 hydration 问题）
- Supabase 社交登录（GitHub / Google）
- 会话创建、消息持久化、标题生成
- 会话列表、分页和搜索
- 环境变量校验、错误处理、日志、CI
- 测试基础：Vitest 单元测试和集成测试

### 半完成

- 顶部工作台导航已存在，但除聊天外大多仍是占位页面
- 模型选择 UI 已接入，但 provider abstraction 还比较浅
- `/api/mcp` 已有占位 endpoint，但没有真实 MCP 管理能力
- `server/types.ts` 已为 Memory / RAG / Planning / Multi-Agent 预留类型

### 仍是占位

- Memory
- RAG
- Planning
- Multi-Agent / Subagent
- Models 页面
- Sandbox 页面
- MCP 管理页
- Skills 管理页
- Search 页面
- Settings 页面
- E2E 自动化测试
- 长期记忆、用户偏好、工具市场等完整产品能力

## 当前产品范围

现在真正可用的是“带登录和会话持久化的聊天演示骨架”，不是“完整 agent 平台”。

更准确地说：

- 聊天页可用
- 登录后会话可持久化、分页、搜索
- 工具调用可用，但工具数量和深度都还很有限
- 多数导航页存在，但主要用于展示未来边界，不代表功能已完成

## 当前代码结构

```text
src/
├── app/                    # Next.js 路由入口和 API route
├── components/             # 基础 UI 和 AI Elements 组件源码
├── config/                 # env / app / i18n 等配置
├── features/
│   ├── auth/               # 登录与 profile 同步
│   └── chat/               # 当前唯一真实业务域
├── i18n/                   # next-intl 请求配置
├── lib/                    # 通用工具、错误处理、日志、Supabase client
└── proxy.ts                # i18n + session 代理
```

## 核心请求链路

```text
Chat UI
  -> useChat
  -> /api/chat
  -> src/features/chat/server/chat.ts
  -> model + tools
  -> UI message stream

Sidebar list/search/create
  -> /api/conversations
  -> src/features/chat/storage/conversations.ts
  -> Supabase
```

## 当前关键实现位置

- 聊天页面：[src/features/chat/pages/chat-home-page.tsx](../src/features/chat/pages/chat-home-page.tsx)
- 页面壳层：[src/features/chat/pages/chat-shell-page.tsx](../src/features/chat/pages/chat-shell-page.tsx)
- 聊天服务端入口：[src/features/chat/server/chat.ts](../src/features/chat/server/chat.ts)
- 会话 API：[src/app/api/conversations/route.ts](../src/app/api/conversations/route.ts)
- 会话存储：[src/features/chat/storage/conversations.ts](../src/features/chat/storage/conversations.ts)
- 模型配置：[src/features/chat/ai/models.ts](../src/features/chat/ai/models.ts)
- 工具注册：[src/features/chat/ai/tools/index.ts](../src/features/chat/ai/tools/index.ts)
- 国际化布局：[src/app/[locale]/layout.tsx](../src/app/[locale]/layout.tsx)
- 环境变量校验：[src/config/env.ts](../src/config/env.ts)

## 已知现实约束

- 聊天能力依赖用户在 `/models` 页面先完成 provider 和模型配置
- 未配置 Supabase 时，登录和会话持久化不可用
- 当前只有 `profiles` 和 `conversations` 表真正接上了业务
- 当前不是 memory-first 架构，也没有长期上下文压缩链路
- 当前测试覆盖的是基础链路，不是完整产品行为
- 多数工作台页面仍是占位，不要把导航存在误认为功能完成

## 下一优先级

1. Memory：会话摘要压缩、长期偏好、跨会话记忆
2. Models：把当前较浅的模型/provider 配置整理成可扩展抽象
3. 页面去占位化：至少让 `Models`、`Sandbox`、`MCP`、`Settings` 成为真实页面
4. 测试补齐：补聊天主链路边界、工具展示和 hydration 场景，之后再补 E2E
5. 文档继续收敛：让 README、Setup、Roadmap 与代码现状同步

## AI 协作建议

如果你是 AI 助手，先按这个顺序理解项目：

1. 看本文件确认“真实状态”
2. 看 [architecture.md](./architecture.md) 理解边界
3. 看 [conventions.md](./conventions.md) 再动代码
4. 如果要推进功能，优先按 [roadmap.md](./roadmap.md) 的顺序做
