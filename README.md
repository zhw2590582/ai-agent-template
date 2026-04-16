# AI Agent App

[![CI](https://github.com/zhw2590582/ai-agent-template/workflows/CI/badge.svg)](https://github.com/zhw2590582/ai-agent-template/actions)

一个面向长期扩展的 AI Agent Web App 骨架。

## 当前定位

当前项目不是完整 agent 平台，而是一个已经跑通的聊天工作台骨架，重点在：

- 流式聊天主链路
- 用户自配置的模型/provider 接入
- 登录、会话持久化、分页和搜索
- 已落地的 Memory V1
- 已落地的 Search / Tavily 工具接入
- 已落地的 Sandbox V1：E2B 配置、连接测试和首批工具
- 已落地的远程 MCP tools integration
- 已落地的 RAG V1：文档上传、向量检索、Voyage rerank 与来源展示
- 已收口的聊天 `agent-runtime` harness
- 为 RAG、Planning、多代理预留结构边界

## 当前真实状态

已完成：

- 基于 `useChat` 的流式聊天
- 服务端 `/api/chat` 到 `streamText(...)` 的主链路
- `Models` 配置弹窗已落地
- 运行时模型配置：OpenAI 兼容 / Anthropic 兼容
- provider 配置持久化：guest 存本地，登录用户写入 `profile.settings`
- 自定义 provider：可新增、删除、显式保存
- 模型同步和自定义模型管理
- 国际化：`en-US` / `zh-CN`，默认语言为英文
- 主题切换
- Supabase 社交登录（GitHub / Google）
- 会话持久化（`conversations` 表）
- 会话列表、分页、搜索、标题生成
- guest 本地会话线程、列表与标题生成
- sidebar 的乐观插入 / 重命名 / 删除
- Memory V1：会话摘要、长期记忆、跨会话注入
- Memory V1：最小版单维度 consolidation
- `Memory` 配置弹窗：控制项、记忆编辑/删除/导出、会话摘要编辑/删除
- `Search` 配置弹窗：Tavily key、Search / Extract / Crawl 设置、连接测试
- Tavily tools：`web_search`、`web_extract`、`web_crawl`
- `Sandbox` 配置弹窗：E2B key、template、运行目录、连接测试
- Sandbox tools：`sandbox_run_command`、`sandbox_read_file`、`sandbox_write_file`
- Sandbox workspace/session/telemetry 骨架
- `MCP` 配置弹窗：多远程 server 配置、连接测试、结果展示
- 聊天时合并远程 MCP tools
- 基础 tool loop 与聊天 workflow 分层
- 聊天 `agent-runtime`：request、context、toolset、workspace、response、finish 收口
- API 频率限制与 429 错误提示
- 环境变量校验、错误处理、日志、CI
- Vitest 单元测试和集成测试

仍未完成或仍是占位：

- Planning
- Multi-Agent
- Skills runtime
- durable run storage / resume
- 本项目自己的正式 MCP server
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

聊天模型改为在顶部 `Models` 弹窗里由用户自行配置。

未登录用户也可以使用聊天，但模型配置和会话线程只保存在当前浏览器本地。

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
├── config/               # 按主题拆分的配置
├── features/
│   ├── auth/             # 登录和 profile 同步
│   ├── chat/             # 聊天工作台、消息链路、会话存储
│   │   └── agent-runtime/ # 聊天运行时编排层
│   ├── debug/            # 调试工具和诊断辅助
│   ├── mcp/              # 远程 MCP server 配置、测试、tool client
│   ├── memory/           # 长期记忆、摘要列表、Memory 页面
│   ├── models/           # provider 配置、模型同步、自定义 provider/model
│   ├── rag/              # 文档上传、向量检索、来源展示
│   ├── sandbox/          # E2B runtime 配置与 tools
│   ├── search/           # Tavily 搜索设置、连接测试、服务端 client
│   ├── settings/         # 用户设置聚合与页面层
│   ├── skills/           # Skills workbench UI 与设置持久化
│   └── subagent/         # 预留的多代理边界
├── i18n/                 # next-intl 请求配置
├── lib/                  # 通用工具、错误处理、日志、Supabase client
└── middleware.ts         # locale 检测与 session 更新
```

## 文档入口

AI 或新协作者建议按这个顺序看：

1. [docs/project-status.md](./docs/project-status.md)
2. [docs/architecture.md](./docs/architecture.md)
3. [docs/agent-harness.md](./docs/agent-harness.md)（只在改聊天 runtime 时看）
4. [docs/conventions.md](./docs/conventions.md)
5. [docs/roadmap.md](./docs/roadmap.md)

其他文档：

- [docs/SETUP.md](./docs/SETUP.md)
- [docs/testing.md](./docs/testing.md)
- [docs/i18n-guide.md](./docs/i18n-guide.md)
- [docs/README.md](./docs/README.md)

参考资料目录：

- [docs/ai-agents-for-beginners](./docs/ai-agents-for-beginners)
- [docs/mcp-for-beginners](./docs/mcp-for-beginners)
