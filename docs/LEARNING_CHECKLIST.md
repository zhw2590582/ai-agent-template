# AI Agent 学习检查清单

> 📋 按照 [plan.md](plan.md) 的顺序完成，记录你的学习进度

## 使用说明

- 完成每个步骤后，将 `[ ]` 改为 `[x]`
- 在"笔记"栏记录你的收获或遇到的问题
- 在"完成日期"栏记录完成时间

---

## 🏗️ 第一阶段: 基础建设

### 步骤 1: 环境准备和项目初始化 (30分钟)

- [ ] 阅读完 [01-intro-to-ai-agents.md](docs/ai-agents-for-beginners/01-intro-to-ai-agents.md) 前 2 节
- [ ] 成功创建 Next.js 项目
- [ ] 安装核心依赖 (ai, @ai-sdk/openai, zod)
- [ ] 启动开发服务器，能访问默认页面

**完成日期**: ___________

**笔记**:
```
你在这个步骤学到了什么？遇到了什么问题？




```

---

### 步骤 2: 创建第一个 AI API 路由 (1小时)

- [ ] 阅读完 [01-intro-to-ai-agents.md](docs/ai-agents-for-beginners/01-intro-to-ai-agents.md) 完整文档
- [ ] 创建 `.env.local` 并添加 OpenAI API Key
- [ ] 实现 `/api/generate` 路由
- [ ] 使用 curl 成功测试 API

**完成日期**: ___________

**核心概念理解**:
- [ ] 理解 `generateText` 的作用
- [ ] 知道如何配置 OpenAI model
- [ ] 明白环境变量的作用

**笔记**:
```
遇到的问题:



解决方案:



```

---

### 步骤 3: 实现流式文本生成 (1小时)

- [ ] 实现 `/api/chat-stream` 路由
- [ ] 创建测试页面 `/test-stream`
- [ ] 观察到文字逐字显示的效果
- [ ] 理解 ReadableStream 的工作原理

**完成日期**: ___________

**核心概念理解**:
- [ ] 理解流式响应的优势
- [ ] 知道 `streamText` 和 `generateText` 的区别
- [ ] 明白 Server-Sent Events (SSE) 的机制

**笔记**:
```
generateText vs streamText 的使用场景:

- generateText: 


- streamText: 


```

---

### 步骤 4: 使用 AI SDK UI Hooks (1-2小时)

- [ ] 创建 `/api/chat` 路由
- [ ] 实现聊天页面 `/chat`
- [ ] 使用 `useChat` hook
- [ ] 测试多轮对话，验证上下文保持

**完成日期**: ___________

**核心概念理解**:
- [ ] 理解 `useChat` hook 的工作原理
- [ ] 知道 messages 数组的结构
- [ ] 明白自动上下文管理的好处

**第一阶段总结**:
```
你最大的收获:



你觉得最难的部分:



下一步想学什么:


```

---

## 🛠️ 第二阶段: 核心能力 - 工具调用

### 步骤 5: 理解工具调用机制 (1小时 - 理论)

- [ ] 阅读完 [04-tool-use-design-pattern.md](docs/ai-agents-for-beginners/04-tool-use-design-pattern.md)
- [ ] 理解 Function Calling 的流程
- [ ] 知道如何设计工具 schema
- [ ] 完成思考练习（设计股票查询工具）

**完成日期**: ___________

**思考练习 - 股票查询工具设计**:
```typescript
// 我的设计:
const stockTool = {
  name: '',
  description: '',
  parameters: z.object({
    // ...
  }),
};
```

**笔记**:
```
工具设计的 4 个原则:
1. 
2. 
3. 
4. 
```

---

### 步骤 6: 实现第一个工具 - 天气查询 (1-2小时)

- [ ] 创建 `lib/tools/` 目录
- [ ] 实现 `weather.ts` 工具
- [ ] 创建 `/api/chat-with-tools` 路由
- [ ] 创建测试页面 `/chat-tools`
- [ ] 成功观察到 AI 自动调用工具

**完成日期**: ___________

**核心概念理解**:
- [ ] 理解 Zod schema 的作用
- [ ] 知道 `description` 对 AI 决策的影响
- [ ] 明白 `toolChoice: 'auto'` 的含义

**测试结果**:
```
测试 1 - 询问天气:
用户输入: 
AI 响应: 
是否调用工具: 是 / 否

测试 2 - 普通对话:
用户输入: 
AI 响应: 
是否调用工具: 是 / 否
```

---

### 步骤 7: 实现更多工具 - 计算器和时间 (1-2小时)

- [ ] 实现 `calculator.ts` 工具
- [ ] 实现 `datetime.ts` 工具
- [ ] 创建 `tools/index.ts` 索引文件
- [ ] 更新 API 使用所有工具
- [ ] 测试多工具组合场景

**完成日期**: ___________

**测试场景记录**:
```
场景 1 - 多工具组合:
输入: 
调用的工具: 
结果: 

场景 2 - 复杂计算:
输入: 
调用的工具: 
结果: 
```

---

### 步骤 8: 工具调用 UI 优化 (1-2小时)

- [ ] 安装 shadcn/ui 和 AI SDK Elements
- [ ] 创建 `ToolInvocationDisplay` 组件
- [ ] 创建 `ToolStats` 组件
- [ ] 更新聊天页面使用新组件
- [ ] 观察到美观的工具调用展示

**完成日期**: ___________

**第二阶段总结**:
```
你实现了多少个工具: 

你最喜欢的功能:



你觉得最复杂的部分:



如果让你自己设计一个工具，你会做什么:


```

---

## 💾 第三阶段: 状态管理与持久化

> 📌 此阶段将在后续迭代中详细展开

- [ ] 步骤 9: 配置数据库 (Neon Postgres + Drizzle)
- [ ] 步骤 10: 实现用户认证 (Auth.js)
- [ ] 步骤 11: 对话历史持久化
- [ ] 步骤 12: 短期记忆管理

---

## 🎯 总体学习进度

**已完成步骤**: _____ / 30+

**总学习时间**: _____ 小时

**最大的成就**:
```



```

**遇到的最大挑战**:
```



```

**给未来自己的建议**:
```



```

---

## 📚 额外学习资源

完成基础步骤后，你可以探索：

- [ ] 阅读 [05-agentic-rag.md](docs/ai-agents-for-beginners/05-agentic-rag.md) 了解 RAG
- [ ] 阅读 [07-planning-design-pattern.md](docs/ai-agents-for-beginners/07-planning-design-pattern.md) 了解任务规划
- [ ] 阅读 [13-memory-for-ai-agents.md](docs/ai-agents-for-beginners/13-memory-for-ai-agents.md) 了解记忆系统
- [ ] 研究 Vercel Chatbot 源码: https://github.com/vercel/chatbot
- [ ] 探索 AI SDK 示例: https://github.com/vercel/ai/tree/main/examples

---

**提示**: 定期回顾这个检查清单，记录你的进步！学习是一个持续的过程。🚀
