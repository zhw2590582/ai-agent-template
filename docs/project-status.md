# Project Status

最后核对时间：2026-04-13

## 项目定位

这是一个可持续扩展的 AI Agent Web App 骨架。

当前目标不是做完整平台，而是把以下几层稳定下来：

- 聊天主链路
- 用户可配置的模型/provider 入口
- 登录与会话持久化
- Memory V1
- 为 RAG、Planning、多代理预留清晰边界

## 当前真实状态

### 已完成

- 基于 `useChat` 的流式聊天
- 服务端 `/api/chat` 到 `streamText(...)` 的主链路
- `Models` 顶部弹窗已成为真实配置入口
- 运行时模型配置：OpenAI 兼容 / Anthropic 兼容
- provider 配置持久化：guest 存本地，登录用户写入 `profiles.settings`
- 自定义 provider：新增、删除、显式保存
- 自定义模型：新增、编辑、删除
- 测试连接：真实请求 provider，并同步模型列表
- 国际化：`en-US` / `zh-CN`，默认语言为英文
- 国际化消息已按领域拆成 `blocks/*` 聚合，而不是继续维护单一超大 locale 文件
- 主题切换（已处理 hydration 问题）
- Supabase 社交登录（GitHub / Google）
- 会话创建、消息持久化、标题生成
- 会话列表、分页和搜索
- guest 本地会话列表，以及 sidebar 的乐观插入 / 重命名 / 删除
- guest 本地会话标题在流式回复完成后再单独生成，避免和消息流写入互相覆盖
- Memory V1：会话摘要压缩、长期记忆写入、跨会话注入
- Memory V1：已接入最小版单维度 memory consolidation
- `Memory` 顶部弹窗：控制项、记忆编辑/删除/导出、会话摘要编辑/删除
- API rate limiting：主要 `/api/*` 路由已接统一频率限制和 429 错误处理
- 环境变量校验、错误处理、日志、CI
- 测试基础：Vitest 单元测试和集成测试

### 半完成

- 顶部工作台导航已统一成弹窗，但除聊天、Models、Memory 外大多仍是占位内容
- 聊天模型选择已接入，但会话级模型偏好仍保存在 `profile.settings`
- 默认系统提示词目前仍是内置配置，后续计划交给用户自定义
- `/api/mcp` 已有占位 endpoint，但没有真实 MCP 管理能力
- `server/types.ts` 已为 RAG / Planning / Multi-Agent 预留类型

### 仍是占位

- RAG
- Planning
- Multi-Agent / Subagent
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
- Models 页可用
- 登录后会话可持久化、分页、搜索
- 未登录用户也有本地会话线程和侧边栏列表
- 模型/provider 由用户自行接入，不再依赖服务端预置 API Key
- 多数导航页存在，但主要用于展示未来边界，不代表功能已完成

## 当前代码结构

```text
src/
├── app/                    # Next.js 路由入口和 API route
├── components/             # 基础 UI 和 AI Elements 组件源码
├── config/                 # env / app / i18n 等配置
├── features/
│   ├── auth/               # 登录与 profile 同步
│   ├── chat/               # 聊天工作台、消息链路、会话存储
│   ├── memory/             # 长期记忆、摘要、Memory 页面
│   └── models/             # provider 配置、模型同步、自定义 provider/model
├── i18n/                   # next-intl 请求配置
├── lib/                    # 通用工具、错误处理、日志、Supabase client
└── proxy.ts                # i18n + session 代理
```

## 核心请求链路

```text
Chat UI
  -> useChat + runtimeModel
  -> /api/chat
  -> src/features/chat/server/chat.ts
  -> model + tools
  -> UI message stream

Models UI
  -> src/features/models/hooks/use-models-page.ts
  -> src/features/models/hooks/use-model-profile.ts
  -> localStorage or Supabase profile.settings

Test connection / sync models
  -> /api/models/providers
  -> src/features/models/server/providers.ts
  -> provider response -> profile.settings.models.providers[*].models

Sidebar list/search/create
  -> /api/conversations
  -> src/features/chat/storage/conversations.ts (authenticated)
  -> src/features/chat/storage/local-conversation-store.ts (guest)
  -> Supabase or localStorage

Memory write/read
  -> src/features/chat/server/chat.ts
  -> src/features/memory/storage/*
  -> Supabase conversations.summary / memories

API rate limiting
  -> src/lib/rate-limit.ts
  -> src/config/api-rate-limit.ts
  -> route-level 429 responses
```

## 当前关键实现位置

- 聊天页面：[src/features/chat/pages/chat-home-page.tsx](../src/features/chat/pages/chat-home-page.tsx)
- 页面壳层：[src/features/chat/pages/chat-shell-page.tsx](../src/features/chat/pages/chat-shell-page.tsx)
- 工作台弹窗壳：[src/features/chat/components/workbench/workbench-dialog.tsx](../src/features/chat/components/workbench/workbench-dialog.tsx)
- 工作台弹窗面板：[src/features/chat/components/workbench/workbench-dialog-panel.tsx](../src/features/chat/components/workbench/workbench-dialog-panel.tsx)
- 聊天服务端入口：[src/features/chat/server/chat.ts](../src/features/chat/server/chat.ts)
- 会话 API：[src/app/api/conversations/route.ts](../src/app/api/conversations/route.ts)
- 会话存储：[src/features/chat/storage/conversations.ts](../src/features/chat/storage/conversations.ts)
- guest 本地会话存储：[src/features/chat/storage/local-conversation-store.ts](../src/features/chat/storage/local-conversation-store.ts)
- guest 本地标题生成：[src/features/chat/storage/local-conversation-title.ts](../src/features/chat/storage/local-conversation-title.ts)
- guest 本地摘要生成：[src/features/chat/storage/local-conversation-summary.ts](../src/features/chat/storage/local-conversation-summary.ts)
- 会话操作适配层：[src/features/chat/data/conversation-operations.ts](../src/features/chat/data/conversation-operations.ts)
- 模型运行时构造：[src/features/chat/ai/core/models.ts](../src/features/chat/ai/core/models.ts)
- 默认 prompt：[src/features/chat/ai/core/prompts.ts](../src/features/chat/ai/core/prompts.ts)
- 标题生成：[src/features/chat/ai/memory/title.ts](../src/features/chat/ai/memory/title.ts)
- 摘要生成：[src/features/chat/ai/memory/summary.ts](../src/features/chat/ai/memory/summary.ts)
- Models 内容：[src/features/models/components/models-content.tsx](../src/features/models/components/models-content.tsx)
- Models 状态持久化：[src/features/models/hooks/use-model-profile.ts](../src/features/models/hooks/use-model-profile.ts)
- Models 页面编排：[src/features/models/hooks/use-models-page.ts](../src/features/models/hooks/use-models-page.ts)
- provider / model 归一化：[src/features/models/utils/profile.ts](../src/features/models/utils/profile.ts)
- provider 探测与模型同步：[src/features/models/server/providers.ts](../src/features/models/server/providers.ts)
- Memory 内容：[src/features/memory/components/memory-content.tsx](../src/features/memory/components/memory-content.tsx)
- Memory 页面状态：[src/features/memory/hooks/use-memory-page.ts](../src/features/memory/hooks/use-memory-page.ts)
- Memory 存储入口：[src/features/memory/storage/memories.ts](../src/features/memory/storage/memories.ts)
- rate limiting 配置：[src/config/api-rate-limit.ts](../src/config/api-rate-limit.ts)
- rate limiting 实现：[src/lib/rate-limit.ts](../src/lib/rate-limit.ts)
- 工具注册：[src/features/chat/ai/tools/index.ts](../src/features/chat/ai/tools/index.ts)
- 国际化布局：[src/app/[locale]/layout.tsx](../src/app/[locale]/layout.tsx)
- 国际化消息聚合：[src/i18n/locales/en-US.ts](../src/i18n/locales/en-US.ts) / [src/i18n/locales/zh-CN.ts](../src/i18n/locales/zh-CN.ts)
- 国际化消息分块：[src/i18n/locales/blocks](../src/i18n/locales/blocks)
- 环境变量校验：[src/config/env.ts](../src/config/env.ts)

## 已知现实约束

- 聊天能力依赖用户先在顶部 `Models` 弹窗里完成 provider 和模型配置
- 未配置 Supabase 时，登录和会话持久化不可用
- 当前 `profiles`、`conversations`、`memories` 表都已接上真实业务
- provider 配置是 `profile.settings` 的一部分，不是独立数据库表
- 当前 Memory 仍是 Supabase-first 的基础版，不包含向量检索和外部 memory provider
- 当前测试覆盖的是基础链路，不是完整产品行为
- 多数工作台页面仍是占位，不要把导航存在误认为功能完成

## 当前已知问题

- 浏览器标签页标题在会话标题自动生成后，可能会先更新成 `{appName} - {conversationTitle}`，随后又被重置回默认站名
- 当前判断这不是标题生成或 sidebar 数据本身的问题，而是 `router.refresh()` 之后的 metadata / remount 时序覆盖问题
- 页面手动刷新后标题通常会恢复正确，说明问题集中在会话内的自动更新链路
- Memory consolidation 当前没有 job 历史、snapshot、rollback 和质量观测，只是最小可用版

## 下一优先级

1. Memory：继续做导入/导出、相关性检索优化、记忆归并和编辑体验
2. Models：继续补 provider 重命名、失败回滚、会话级模型偏好等细节
3. 页面去占位化：至少让 `Sandbox`、`MCP`、`Settings` 成为真实页面
4. 测试补齐：补聊天主链路边界、工具展示、Memory 行为和 hydration 场景，之后再补 E2E
5. 文档继续收敛：让 README、Setup、Roadmap 与代码现状同步

## AI 协作建议

如果你是 AI 助手，先按这个顺序理解项目：

1. 看本文件确认“真实状态”
2. 看 [architecture.md](./architecture.md) 理解边界
3. 看 [conventions.md](./conventions.md) 再动代码
4. 如果要推进功能，优先按 [roadmap.md](./roadmap.md) 的顺序做
