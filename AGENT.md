# AI Agent 学习项目 - Agent 协助指南

> 🤖 本文件为 GitHub Copilot 和 AI 助手提供项目上下文，帮助更好地协助开发

## 项目概述

这是一个**渐进式学习项目**，旨在帮助开发者从零开始学习和构建网页版 AI Agent。项目采用"小步快跑"的方式，每个步骤都有详细的注释和说明。

### 核心原则

1. **循序渐进** - 每个步骤只关注一个核心概念
2. **详细注释** - 每个函数都有完整的文档说明
3. **理论实践结合** - 先理解"为什么"，再动手"怎么做"
4. **可验证性** - 每个步骤都有明确的验证方法

## 技术栈

### 前端框架
- **Next.js 15+** (App Router) - React 服务端组件
- **TypeScript** - 严格模式，类型安全
- **Tailwind CSS** - 工具类优先的 CSS 框架

### AI SDK
- **Vercel AI SDK** - 核心 AI 能力
  - `generateText` - 同步文本生成
  - `streamText` - 流式响应
  - `useChat` - React hooks for 聊天
  - Tool Calling - 函数调用能力

### 数据层
- **Supabase** - 数据库和认证
  - PostgreSQL - 关系型数据库
  - pgvector - 向量存储（用于 RAG）
  - Auth - 内置认证系统

### 工具
- **Bun** - 包管理器（比 npm 更快）
- **Zod** - 参数验证和类型推断

## 项目结构

```
ai-agent-template/
├── app/                    # Next.js 应用（App Router）
│   ├── api/                # API 路由
│   │   ├── chat/           # 聊天 API
│   │   └── generate/       # 基础生成 API
│   ├── chat/               # 聊天页面
│   └── page.tsx            # 首页
│
├── lib/                    # 核心逻辑库
│   ├── tools/              # AI 工具定义
│   │   ├── weather.ts      # 天气查询工具
│   │   ├── calculator.ts   # 计算器工具
│   │   ├── datetime.ts     # 时间工具
│   │   └── index.ts        # 工具索引
│   ├── db/                 # 数据库层（后续添加）
│   └── vector/             # 向量存储（后续添加）
│
├── components/             # React 组件
│   ├── tool-invocation.tsx # 工具调用展示
│   └── tool-stats.tsx      # 工具统计
│
├── docs/                   # 📚 学习文档
│   ├── plan.md             # 详细学习计划
│   ├── QUICK_START.md      # 快速开始
│   ├── LEARNING_CHECKLIST.md # 学习检查清单
│   ├── ai-agents-for-beginners/ # AI Agent 理论
│   └── mcp-for-beginners/       # MCP 协议
│
├── .env.local              # 环境变量（不提交）
├── package.json            # 依赖配置
└── README.md               # 项目说明
```

## 当前学习阶段

### ✅ 第一阶段：基础建设（已规划）
- 步骤 1: 环境准备和项目初始化
- 步骤 2: 创建第一个 AI API 路由
- 步骤 3: 实现流式文本生成
- 步骤 4: 使用 AI SDK UI Hooks

### ✅ 第二阶段：工具调用（已规划）
- 步骤 5: 理解工具调用机制（理论）
- 步骤 6: 实现第一个工具 - 天气查询
- 步骤 7: 实现更多工具 - 计算器和时间
- 步骤 8: 工具调用 UI 优化

### 📝 第三阶段：状态管理（规划中）
- 数据库配置（Supabase）
- 用户认证（Supabase Auth）
- 对话历史持久化
- 短期和长期记忆

### 📝 后续阶段（预告）
- 第四阶段：RAG（检索增强生成）
- 第五阶段：多步骤任务规划
- 第六阶段：生产就绪（安全、监控、部署）

## 协助开发指南

### 编写代码时的要求

1. **详细注释优先**
   ```typescript
   /**
    * 函数功能简介
    * 
    * 功能: 详细说明这个函数做什么
    * 
    * 学习要点:
    * 1. 第一个关键概念
    * 2. 第二个关键概念
    * 
    * @param paramName - 参数说明
    * @returns 返回值说明
    * 
    * 注意事项:
    * - 需要注意的坑
    * - 最佳实践建议
    */
   ```

2. **单一职责原则**
   - 每个文件只做一件事
   - 文件名要清晰表达功能
   - 避免创建过大的文件

3. **类型安全**
   - 使用 TypeScript 严格模式
   - 为所有函数定义返回类型
   - 使用 Zod 验证外部输入

4. **错误处理**
   - 所有 API 路由都要有 try-catch
   - 错误信息要对用户友好
   - 记录详细的错误日志

### 创建新功能时

遵循"增量开发"原则：

1. **先创建最小可用版本**
   - 只包含核心功能
   - 使用模拟数据（如果需要）
   - 确保可以运行和验证

2. **添加详细注释**
   - 解释"为什么"这样写
   - 提供学习建议
   - 标注常见错误

3. **提供验证步骤**
   - 如何测试这个功能
   - 预期的输出是什么
   - 如何判断成功

4. **逐步增强**
   - 先实现基础功能
   - 再添加错误处理
   - 最后优化 UI/UX

### 回答问题时

1. **先理论后实践**
   - 先解释概念和原理
   - 再提供代码示例
   - 引用相关文档

2. **提供多个层次的答案**
   - 简短的 TL;DR
   - 详细的解释
   - 相关资源链接

3. **结合学习计划**
   - 参考 `docs/plan.md` 中的步骤
   - 指出当前处于哪个阶段
   - 建议下一步做什么

## 环境变量

当前项目需要的环境变量（`.env.local`）：

```bash
# OpenAI API Key（必需）
OPENAI_API_KEY=sk-xxx

# Supabase 配置（后续添加）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# 应用配置
NODE_ENV=development
```

## 常见任务

### 添加新工具

1. 在 `lib/tools/` 创建新文件，例如 `search.ts`
2. 定义工具 schema（使用 Zod）
3. 实现 execute 函数
4. 在 `lib/tools/index.ts` 中导出
5. 更新 API 路由的 tools 配置

### 创建新页面

1. 在 `app/` 下创建目录和 `page.tsx`
2. 使用 `'use client'` 如果需要客户端功能
3. 在首页添加导航链接
4. 提供清晰的功能说明

### 添加新 API 路由

1. 在 `app/api/` 下创建目录和 `route.ts`
2. 导出 `GET` 或 `POST` 函数
3. 处理请求体和错误
4. 返回标准的 Response 对象

## 学习资源

### 项目内文档
- **学习计划**: [`docs/plan.md`](docs/plan.md) - 完整的步骤说明
- **快速开始**: [`docs/QUICK_START.md`](docs/QUICK_START.md) - 10分钟体验
- **检查清单**: [`docs/LEARNING_CHECKLIST.md`](docs/LEARNING_CHECKLIST.md) - 跟踪进度

### 理论基础
- **AI Agent 概念**: `docs/ai-agents-for-beginners/`
  - 01: Agent 基础概念
  - 04: 工具调用设计模式
  - 05: RAG 实现
  - 13: 记忆系统
  
- **MCP 协议**: `docs/mcp-for-beginners/`
  - 01: 核心概念
  - 08: 最佳实践

### 外部资源
- [AI SDK 文档](https://ai-sdk.dev/)
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Vercel Chatbot 参考](https://github.com/vercel/chatbot)

## 开发命令

```bash
# 开发
bun run dev          # 启动开发服务器（端口 3000）
bun run build        # 构建生产版本
bun run start        # 启动生产服务器

# 依赖管理
bun add <package>    # 安装依赖
bun remove <package> # 移除依赖
bun install          # 安装所有依赖

# 代码质量
bun run lint         # ESLint 检查
```

## 注意事项

### 安全
- ⚠️ **永远不要**将 `.env.local` 提交到 Git
- ⚠️ **不要**在客户端代码中使用 `OPENAI_API_KEY`
- ⚠️ **始终**验证用户输入（使用 Zod）

### 性能
- ✅ 优先使用 Server Components
- ✅ 使用流式响应提升体验
- ✅ 合理使用缓存策略

### 可维护性
- ✅ 保持文件小而专注
- ✅ 使用清晰的命名
- ✅ 编写测试用例（后续添加）

## 协助原则

当用户请求帮助时：

1. **理解上下文**
   - 用户处于学习的哪个阶段？
   - 是想学习理论还是实现功能？
   - 是否遇到具体错误？

2. **提供适当的帮助**
   - 初学者：详细解释 + 完整代码
   - 有经验：关键提示 + 文档链接
   - 调试问题：系统化排查步骤

3. **保持克制**
   - 不要一次性提供太多信息
   - 不要跳过中间步骤
   - 不要添加未规划的功能

4. **鼓励学习**
   - 解释"为什么"而不只是"怎么做"
   - 引导用户查阅相关文档
   - 提供延伸学习建议

---

**最后更新**: 2026年4月11日
**项目状态**: 基础框架已搭建，准备开始步骤 2
