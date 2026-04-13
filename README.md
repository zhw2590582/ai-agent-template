# AI Agent App

[![CI](https://github.com/zhw2590582/ai-agent-template/workflows/CI/badge.svg)](https://github.com/zhw2590582/ai-agent-template/actions)

一个面向长期扩展的 AI Agent Web App 骨架。

## 当前定位

当前项目不是完整 agent 平台，而是一个已经跑通的聊天工作台骨架，重点在：

- 流式聊天主链路
- 用户自配置的模型/provider 接入
- 登录、会话持久化、分页和搜索
- 为 Memory、RAG、Planning、多代理预留结构边界

## 当前真实状态

已完成：

- 基于 `useChat` 的流式聊天
- 服务端 `/api/chat` 到 `streamText(...)` 的主链路
- `/models` 页面已落地
- 运行时模型配置：OpenAI 兼容 / Anthropic 兼容
- provider 配置持久化：guest 存本地，登录用户写入 `profile.settings`
- 自定义 provider：可新增、删除、自动保存
- 模型同步和自定义模型管理
- 国际化：`en-US` / `zh-CN`，默认语言为英文
- 主题切换
- Supabase 社交登录（GitHub / Google）
- 会话持久化（`conversations` 表）
- 会话列表、分页、搜索、标题生成
- 环境变量校验、错误处理、日志、CI
- Vitest 单元测试和集成测试

仍未完成或仍是占位：

- Memory
- RAG
- Planning
- Multi-Agent
- 除聊天和 Models 外的大多数工作台页面的真实业务实现
- E2E 自动化测试

更准确的状态说明见 [docs/project-status.md](./docs/project-status.md)。

## 快速开始

```bash
bun install
cp .env.example .env.local
bun run dev
```

访问地址：

- 英文：`http://localhost:3000/en-US`
- 中文：`http://localhost:3000/zh-CN`
- 默认：`http://localhost:3000`（英文）

最低可运行环境变量：

- 无

聊天模型改为在 `/models` 页面由用户自行配置。

如果要启用登录和会话持久化，还需要配置：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 技术栈

- Next.js 16
- React 19
- AI SDK
- AI Elements
- shadcn/ui
- Tailwind CSS v4
- next-intl
- Supabase
- Zod
- Bun

## 当前结构

```text
src/
├── app/                  # Next.js 路由入口与 API route
├── components/           # 基础 UI 和 AI Elements 组件
├── config/               # env / app / i18n 等配置
├── features/
│   ├── auth/             # 登录和 profile 同步
│   ├── chat/             # 聊天工作台、消息链路、会话存储
│   └── models/           # provider 配置、模型同步、自定义 provider/model
├── i18n/                 # next-intl 请求配置
├── lib/                  # 通用工具、错误处理、日志、Supabase client
└── proxy.ts              # locale 检测与 session 更新
```

## 文档入口

AI 或新协作者建议按这个顺序看：

1. [docs/project-status.md](./docs/project-status.md)
2. [docs/architecture.md](./docs/architecture.md)
3. [docs/conventions.md](./docs/conventions.md)
4. [docs/roadmap.md](./docs/roadmap.md)

其他文档：

- [docs/SETUP.md](./docs/SETUP.md)
- [docs/testing.md](./docs/testing.md)
- [docs/i18n-guide.md](./docs/i18n-guide.md)
- [docs/README.md](./docs/README.md)

参考资料目录：

- [docs/ai-agents-for-beginners](./docs/ai-agents-for-beginners)
- [docs/mcp-for-beginners](./docs/mcp-for-beginners)
