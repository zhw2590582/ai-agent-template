# AI Agent App

[![CI](https://github.com/zhw2590582/ai-agent-template/workflows/CI/badge.svg)](https://github.com/zhw2590582/ai-agent-template/actions)

一个面向长期扩展的 AI Agent Web App 骨架。

## 当前定位

当前项目不是完整 agent 平台，而是一个已经跑通的聊天骨架，重点在：

- 流式聊天主链路
- 服务端工具调用骨架
- 为 Memory、RAG、Planning、多代理预留结构边界

## 当前真实状态

已完成：

- 基于 `useChat` 的流式聊天
- DeepSeek 模型接入
- 工具调用骨架：天气、计算器、时间
- 国际化：`zh-CN` / `en-US`
- 主题切换
- 环境变量校验、错误处理、日志、CI
- Vitest 单元测试和集成测试

仍未完成：

- 会话持久化
- 用户系统
- RAG
- Planning
- Multi-Agent
- 多数工作台页面的真实业务实现

更准确的状态说明见 [docs/project-status.md](./docs/project-status.md)。

## 快速开始

```bash
bun install
cp .env.example .env.local
bun run dev
```

访问地址：

- 中文：`http://localhost:3000/zh-CN`
- 英文：`http://localhost:3000/en-US`
- 默认：`http://localhost:3000`

必需环境变量：

- `DEEPSEEK_API_KEY`

## 技术栈

- Next.js 16
- React 19
- AI SDK
- AI Elements
- shadcn/ui
- Tailwind CSS v4
- Zod
- Bun

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
