# Project Status

最后核对时间：2026-04-12

## 项目定位

这是一个可持续扩展的 AI Agent Web App 骨架。

当前目标不是做完整平台，而是把以下三层稳定下来：

- 聊天主链路
- 服务端工具调用骨架
- 后续接入 Memory、RAG、Planning、多代理的结构边界

## 当前真实状态

### 已完成

- 基于 `useChat` 的流式聊天
- 服务端 `/api/chat` 到 `streamText(...)` 的主链路
- DeepSeek 模型接入，兼容 OpenAI SDK 方式调用
- 工具调用骨架：天气、计算器、时间
- 国际化：`zh-CN` / `en-US`
- 主题切换（含 hydration 修复）
- Supabase 社交登录（GitHub/Google）
- 会话列表、标题生成、分页和搜索
- 会话持久化（`conversations` 表）
- 环境变量校验、错误处理、日志、CI
- 测试基础：Vitest 单元测试和集成测试

### 半完成

- 聊天工作台导航已调整为 `Sandbox / MCP`，多数页面仍是占位视图
- 模型选择 UI 已接入，但 provider abstraction 还比较浅
- `server/types.ts` 已为 Memory / RAG / Planning / Multi-Agent 预留类型

### 仍是占位

- Memory
- Models
- Agents
- Sandbox
- MCP 管理页
- Skills 管理页
- Settings
- E2E 自动化测试
- Profiles / Memory / Settings 表结构

## 当前产品范围

现在真正可用的是“聊天演示骨架”，不是“完整 agent 平台”。

更准确地说：

- 聊天页可用（含会话列表、搜索、分页）
- 若干导航页存在（多数仍是占位）
- 登录可用，但账号设置与偏好管理未完成

## 当前代码结构

```text
src/
├── app/                  # Next.js 路由入口
├── components/           # 基础 UI 和第三方组件源码
├── features/chat/        # 当前唯一真实业务域
├── config/               # env / app / i18n / theme 等配置
├── lib/                  # 共享工具、错误处理、日志
├── locales/              # 翻译文件
└── server/               # 模型、prompt、工具、chat handler
```

## 核心请求链路

```text
Chat UI
  -> useChat
  -> /api/chat
  -> src/server/chat.ts
  -> model + tools
  -> UI message stream
```

## 当前关键实现位置

- 聊天页面：[src/features/chat/pages/chat-home-page.tsx](../src/features/chat/pages/chat-home-page.tsx)
- 聊天服务端入口：[src/server/chat.ts](../src/server/chat.ts)
- 模型配置：[src/server/ai/models.ts](../src/server/ai/models.ts)
- 工具注册：[src/server/ai/tools/index.ts](../src/server/ai/tools/index.ts)
- 国际化布局：[src/app/[locale]/layout.tsx](../src/app/[locale]/layout.tsx)
- 环境变量校验：[src/config/env.ts](../src/config/env.ts)

## 已知现实约束

- `DEEPSEEK_API_KEY` 是当前运行必需项
- 当前不是 memory-first 架构，只有 `conversations` 落库，profiles/memory 未完成
- 数据库接入仅覆盖会话，不覆盖用户设置与长期记忆
- 当前测试覆盖的是基础链路，不是完整产品行为
- README 比代码更乐观，判断状态时以代码和本文件为准

## 下一优先级

1. Memory：profiles/memory 表、会话摘要压缩、长期偏好
2. Models：把模型/provider 配置从当前的半硬编码整理成可扩展抽象
3. 页面去占位化：至少让 `Models`、`Sandbox`、`MCP`、`Settings` 变成真实页面
4. 测试补齐：补聊天主链路和 hydration 场景，之后再补 E2E
5. 文档继续收敛：让 README 与代码现状保持一致

## AI 协作建议

如果你是 AI 助手，先按这个顺序理解项目：

1. 看本文件确认“真实状态”
2. 看 [architecture.md](./architecture.md) 理解边界
3. 看 [conventions.md](./conventions.md) 再动代码
4. 如果要推进功能，优先按 [roadmap.md](./roadmap.md) 的顺序做
