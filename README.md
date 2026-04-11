# AI Agent 学习模板

> 🎓 从零开始，循序渐进地学习和构建网页版 AI Agent

## 📚 项目简介

这是一个专为学习 AI Agent 开发而设计的教程项目。你将学习如何使用 **Next.js + AI SDK** 构建一个功能完整的 AI Agent，包括：

- ✅ 流式对话界面
- ✅ 工具调用 (Function Calling)
- ✅ 记忆和上下文管理
- ✅ RAG (检索增强生成)
- ✅ 多步骤任务规划
- ✅ 生产级安全和监控

## 🚀 快速开始

### 选择你的学习路径

#### 🏃 快速体验（10 分钟）
想马上看到效果？

**⚡ [快速开始指南 →](docs/QUICK_START.md)**
- 10 分钟搭建一个可对话的 AI Agent
- 最小化配置，快速上手
- 适合想快速了解 AI SDK 的开发者

#### 📚 系统学习（推荐）
想深入理解每个概念？

**📖 [详细学习计划 →](docs/plan.md)**
- 小步快跑，每个步骤 30 分钟到 2 小时
- 详尽的代码注释，理解每一行代码的作用
- 理论与实践结合，先理解再动手
- 完整的验证步骤，确保每一步都成功

**📋 [学习检查清单 →](docs/LEARNING_CHECKLIST.md)**
- 跟踪你的学习进度
- 记录笔记和心得
- 自我测试和验证

### 2. 学习理论基础

在开始编码之前，建议先阅读：

**AI Agent 核心概念**：
- [01-intro-to-ai-agents.md](docs/ai-agents-for-beginners/01-intro-to-ai-agents.md) - 理解什么是 AI Agent
- [04-tool-use-design-pattern.md](docs/ai-agents-for-beginners/04-tool-use-design-pattern.md) - 掌握工具调用机制

**可选深入阅读**：
- `docs/ai-agents-for-beginners/` - 完整的 AI Agent 开发教程
- `docs/mcp-for-beginners/` - Model Context Protocol (MCP) 学习资源

### 3. 开始实践

按照 [plan.md](plan.md) 中的步骤，从步骤 1 开始：

```bash
# 创建项目
bun create next-app ai-agent-app --typescript --tailwind --app

# 进入目录
cd ai-agent-app

# 安装依赖
bun add ai @ai-sdk/openai zod

# 启动开发服务器
bun run dev
```

## 📁 项目结构

```
ai-agent-template/
├── README.md                   # 本文件 - 项目总览
├── AGENT.md                    # GitHub Copilot Agent 配置
├── .gitignore.example          # Git 忽略规则模板
│
├── docs/                       # 📚 学习文档
│   ├── plan.md                 # 详细学习计划 ⭐️
│   ├── QUICK_START.md          # 10分钟快速体验
│   ├── LEARNING_CHECKLIST.md   # 学习进度检查清单
│   ├── ai-agents-for-beginners/    # AI Agent 教程（13 章）
│   └── mcp-for-beginners/          # MCP 协议教程（11 章）
│
├── src/
│   ├── app/                    # Next.js 路由入口层（尽量保持薄）
│   │   ├── api/                # Route Handlers
│   │   ├── test-deepseek/      # 测试页面路由
│   │   ├── layout.tsx          # 根布局
│   │   └── page.tsx            # 首页路由入口
│   ├── features/               # 按业务能力组织的前端代码
│   │   ├── chat/               # 聊天功能域
│   │   │   ├── components/     # 聊天 UI 组件
│   │   │   ├── lib/            # 聊天配置和消息处理函数
│   │   │   └── pages/          # 页面级组合组件
│   │   └── tools/              # 工具调用相关展示
│   │       └── components/     # ToolInvocation / ToolStats
│   ├── server/                 # 服务端能力层
│   │   ├── ai/                 # 模型和工具定义
│   │   │   ├── providers/      # 模型提供方配置
│   │   │   └── tools/          # AI 工具集
│   │   └── http/               # API 路由处理逻辑
│   │       └── routes/         # Chat / test-deepseek handlers
│   └── shared/                 # 预留共享层
│       └── lib/                # 通用 helper、常量、类型
├── .env.local                  # 环境变量 (不提交到 Git)
└── package.json                # 依赖配置
```

### 当前目录设计原则

- `src/app`: 只做 Next.js 路由注册和页面入口，避免把业务逻辑堆进 route/page 文件
- `src/features`: 以功能域拆分前端代码，后续加记忆、RAG、认证时不会互相污染
- `src/server`: 专门放模型配置、工具、API 处理，明确客户端和服务端边界
- `src/shared`: 预留给跨功能复用的类型、工具函数和常量

这套结构的目标是先建立清晰边界，而不是一次性引入大量框架和依赖。

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **AI SDK**: Vercel AI SDK
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **包管理**: Bun
- **模型**: DeepSeek（默认）/ OpenAI（备用）

## 📖 学习路径

### 第一阶段: 基础建设 (2-3天)
学习 Next.js + AI SDK 的基本用法，实现简单的对话功能。

### 第二阶段: 工具调用 (3-4天) 
掌握 AI Agent 的核心能力 - 让 AI 调用外部工具完成任务。

### 第三阶段: 状态管理 (3-4天)
实现对话历史、用户认证和记忆系统。

### 第四阶段: 知识增强 (3-4天)
添加 RAG 能力，让 AI 基于你的文档回答问题。

### 第五阶段: 高级模式 (3-4天)
实现多步骤任务规划和复杂工作流。

### 第六阶段: 生产就绪 (2-3天)
安全加固、监控和部署。

## 💡 学习建议

1. **按顺序学习**: 每个阶段都基于前一阶段的知识
2. **动手实践**: 不要只看代码，要亲自敲一遍
3. **理重要提示

### 环境配置
- ✅ 你需要一个 OpenAI API Key（从 [OpenAI 平台](https://platform.openai.com/) 获取）
- ✅ 将 `.gitignore.example` 复制为 `.gitignore`
- ⚠️ **永远不要**将 `.env.local` 提交到 Git（包含 API Key）

### 获取帮助
- 遇到问题时，先查看 [docs/plan.md](docs/plan.md) 中的"常见问题"部分
- 每个步骤都有详细的验证方法
- 使用 [docs/LEARNING_CHECKLIST.md](docs/LEARNING_CHECKLIST.md) 记录问题和解决方案

### 学习建议
- 📖 **先理论后实践**: 每个步骤都标注了推荐阅读的文档
- 🔍 **理解注释**: 代码中的注释解释了"为什么"，不只是"怎么做"
- ✅ **及时验证**: 完成每个步骤后立即测试功能
- 📝 **做笔记**: 使用检查清单记录你的学习过程

**官方文档**:
- [AI SDK 文档](https://ai-sdk.dev/)
- [Next.js 文档](https://nextjs.org/docs)
- [Bun 文档](https://bun.sh/docs)

**参考项目**:
- [Vercel Chatbot](https://github.com/vercel/chatbot) - 官方聊天机器人模板
- [AI SDK Examples](https://github.com/vercel/ai/tree/main/examples) - 各种示例

## 📝 注意事项

- 你需要一个 OpenAI API Key（可以从 [OpenAI 平台](https://platform.openai.com/) 获取）
- `.env.local` 文件不要提交到 Git
- 遇到问题时，先查看 [plan.md](plan.md) 中的"常见问题"部分

## 🎯 学习目标

完成这个项目后，你将能够：

- ✅ 独立构建一个功能完整的 AI Agent 应用
- ✅ 理解 AI SDK 的核心概念和最佳实践
- ✅ 掌握工具调用、RAG、记忆等高级特性
- ✅ 具备将 AI Agent 部署到生产环境的能力

---

**准备好了吗？** 打开 [docs/plan.md](docs/plan.md) 开始你的 AI Agent 开发之旅！ 🚀
