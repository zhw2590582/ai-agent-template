# AI Agent 学习实践计划

> 🎯 **目标**: 循序渐进地学习和构建一个网页版 AI Agent，每一步都专注于一个核心概念
> 
> 🛠️ **技术栈**: Next.js 15 + AI SDK + Supabase + Bun
> 
> 📚 **学习方式**: 理论 → 实践 → 验证 → 扩展

---

## 🔧 技术选型

### 核心框架
- **Next.js 15** (App Router) - 现代化的 React 框架
- **AI SDK** - Vercel 官方的 AI 集成工具包
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Bun** - 高性能的 JavaScript 运行时和包管理器

### AI 和模型
- **OpenAI GPT-4 Turbo** - 主要的语言模型
- **Vercel AI Gateway** (可选) - 多模型支持和负载均衡

### 数据和认证（第三阶段开始使用）
- **Supabase** - 一站式后端解决方案
  - PostgreSQL + pgvector 扩展 (数据库和向量存储)
  - Supabase Auth (用户认证)
  - Supabase Storage (文件存储)
  - Row Level Security (数据安全)

### 为什么选择 Supabase？
1. **一体化方案**: 数据库、认证、存储都在一个平台
2. **开发者友好**: 自动生成的 TypeScript 类型
3. **实时功能**: 内置的实时订阅支持
4. **向量搜索**: pgvector 扩展支持 RAG
5. **免费额度**: 适合学习和小型项目

---

## 📋 总体原则

### 代码规范
- ✅ **详细注释**: 每个函数、组件都有清晰的用途说明
- ✅ **类型安全**: 使用 TypeScript 严格模式
- ✅ **单一职责**: 一个文件只做一件事
- ✅ **渐进增强**: 每个步骤都是可运行的完整功能

### 文件组织
- ✅ **功能分层**: 按职责划分目录（UI/逻辑/数据）
- ✅ **命名规范**: 见名知意，使用 kebab-case 或 camelCase
- ✅ **依赖管理**: 使用 Bun 作为包管理器

### 学习路径
- ✅ **小步快跑**: 每个步骤聚焦一个概念
- ✅ **即时验证**: 完成后立即测试功能
- ✅ **增量构建**: 新功能基于已有基础

---

## 🗺️ 学习路线图

```
第一阶段: 基础建设 (第 1-4 步)
  └─ 理解 Next.js + AI SDK 基本架构

第二阶段: 核心能力 (第 5-8 步)
  └─ 掌握 AI Agent 的工具调用机制

第三阶段: 状态管理 (第 9-12 步)
  └─ 实现记忆和数据持久化

第四阶段: 知识增强 (第 13-16 步)
  └─ 添加 RAG 能力

第五阶段: 高级模式 (第 17-20 步)
  └─ 多步骤任务和规划

第六阶段: 生产就绪 (第 21-24 步)
  └─ 安全、监控和部署
```

---

## 📖 详细步骤

### 🏗️ 第一阶段: 基础建设 (2-3天)

#### 步骤 1: 环境准备和项目初始化 (30分钟)

**学习目标**: 
- 理解 Next.js 15 的 App Router 架构
- 熟悉 Bun 包管理器的基本命令

**前置阅读**: 
- [docs/ai-agents-for-beginners/01-intro-to-ai-agents.md](docs/ai-agents-for-beginners/01-intro-to-ai-agents.md) (前 2 节)

**操作步骤**:
```bash
# 1. 进入项目目录
cd /Users/harvey/Desktop/github/ai-agent-template

# 2. 安装核心依赖
bun add ai @ai-sdk/openai zod

# 4. 安装开发依赖
bun add -d @types/node
```

**创建的文件**:
- `package.json` — 依赖配置（使用 Bun）
- `tsconfig.json` — TypeScript 配置
- `next.config.ts` — Next.js 配置
- `app/` — Next.js 应用目录

**验证步骤**:
```bash
bun run dev
# 访问 http://localhost:3000，看到 Next.js 默认页面
```

**核心概念**:
- Next.js App Router 使用文件系统路由
- `app/` 目录是应用的根目录
- Bun 比 npm 更快，兼容 npm 生态

---

#### 步骤 2: 创建第一个 AI API 路由 (1小时)

**学习目标**:
- 理解 Next.js API Routes 的工作原理
- 掌握 AI SDK 的 `generateText` 基本用法
- 了解环境变量管理

**前置阅读**:
- [docs/ai-agents-for-beginners/01-intro-to-ai-agents.md](docs/ai-agents-for-beginners/01-intro-to-ai-agents.md) (完整)
- AI SDK 文档: https://ai-sdk.dev/docs/ai-sdk-core/generating-text

**操作步骤**:

1. **创建环境变量文件** `.env.local`:
```env
# OpenAI API Key
# 从 https://platform.openai.com/api-keys 获取
OPENAI_API_KEY=sk-xxx

# 应用配置
NODE_ENV=development
```

2. **创建 API 路由** `app/api/generate/route.ts`:
```typescript
/**
 * AI 文本生成 API 路由
 * 
 * 功能: 接收用户提示，调用 OpenAI 生成文本响应
 * 学习要点:
 * 1. Next.js API Routes 使用 export 的方式定义 HTTP 方法
 * 2. AI SDK 的 generateText 是最基础的文本生成函数
 * 3. 环境变量通过 process.env 访问
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

/**
 * POST /api/generate
 * 请求体: { prompt: string }
 * 响应: { text: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const { prompt } = await request.json();

    // 2. 验证输入
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的 prompt' },
        { status: 400 }
      );
    }

    // 3. 调用 AI SDK 生成文本
    const { text } = await generateText({
      // 使用 OpenAI 的 GPT-4 模型
      model: openai('gpt-4-turbo'),
      // 用户的提示
      prompt: prompt,
    });

    // 4. 返回生成的文本
    return NextResponse.json({ text });

  } catch (error) {
    // 错误处理
    console.error('生成文本失败:', error);
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

**验证步骤**:
```bash
# 使用 curl 测试 API
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "用一句话解释什么是 AI Agent"}'

# 期望响应:
# {"text":"AI Agent 是一个能够感知环境、做出决策并采取行动来完成特定目标的智能系统。"}
```

**核心概念**:
- `generateText`: 同步等待 AI 完成全部生成
- `model`: 指定使用的 AI 模型
- `prompt`: 发送给 AI 的指令
- API Routes 的请求和响应都是标准的 HTTP

**下一步预告**: 我们将实现流式响应，让 AI 的回复实时显示

---

#### 步骤 3: 实现流式文本生成 (1小时)

**学习目标**:
- 理解流式响应的优势（实时反馈，更好的用户体验）
- 掌握 AI SDK 的 `streamText` 用法
- 了解 ReadableStream 和 Server-Sent Events

**前置阅读**:
- AI SDK 文档: https://ai-sdk.dev/docs/ai-sdk-core/streaming

**操作步骤**:

1. **创建流式 API 路由** `app/api/chat-stream/route.ts`:
```typescript
/**
 * AI 流式对话 API 路由
 * 
 * 功能: 使用流式响应实时返回 AI 生成的内容
 * 
 * 流式响应的优势:
 * - 用户无需等待完整响应，体验更流畅
 * - 减少首字节时间 (TTFB)
 * - 适合长文本生成场景
 * 
 * 学习要点:
 * 1. streamText 返回一个可读流
 * 2. toDataStreamResponse 将流转换为 HTTP 响应
 * 3. 前端需要特殊处理来接收流式数据
 */

import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

/**
 * POST /api/chat-stream
 * 请求体: { message: string }
 * 响应: 流式文本 (Server-Sent Events)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const { message } = await request.json();

    // 2. 验证输入
    if (!message || typeof message !== 'string') {
      return new Response('请提供有效的消息', { status: 400 });
    }

    // 3. 创建流式响应
    const result = streamText({
      model: openai('gpt-4-turbo'),
      // 设置系统提示，定义 AI 的角色
      system: '你是一个友好的 AI 助手，专门帮助用户学习 AI Agent 开发。',
      // 用户的消息
      prompt: message,
    });

    // 4. 将流转换为 HTTP 响应
    // toDataStreamResponse() 自动处理 SSE 格式
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('流式生成失败:', error);
    return new Response('生成失败', { status: 500 });
  }
}
```

2. **创建测试页面** `app/test-stream/page.tsx`:
```typescript
/**
 * 流式响应测试页面
 * 
 * 功能: 手动实现流式数据的接收和显示
 * 学习要点: 如何使用 ReadableStream 处理 SSE 数据
 */

'use client';

import { useState } from 'react';

export default function TestStreamPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 发送消息并接收流式响应
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setResponse(''); // 清空之前的响应

    try {
      // 发起请求
      const res = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error('请求失败');

      // 获取响应流
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('无法读取响应流');

      // 读取流数据
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // 解码并累加到响应中
        const chunk = decoder.decode(value, { stream: true });
        setResponse(prev => prev + chunk);
      }

    } catch (error) {
      console.error('请求错误:', error);
      setResponse('发生错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">流式响应测试</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          className="w-full p-2 border rounded mb-2"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isLoading ? '生成中...' : '发送'}
        </button>
      </form>

      {/* 响应显示区域 */}
      <div className="p-4 border rounded bg-gray-50 min-h-[200px]">
        <p className="whitespace-pre-wrap">{response || '响应将在这里显示...'}</p>
      </div>
    </div>
  );
}
```

**验证步骤**:
1. 访问 http://localhost:3000/test-stream
2. 输入 "什么是 AI Agent？请详细解释"
3. 观察文本是否逐字逐句地实时显示
4. 打开浏览器 Network 面板，查看 `chat-stream` 请求的 Response 类型

**核心概念**:
- **流式响应**: 数据边生成边发送，不等待完成
- **Server-Sent Events (SSE)**: 服务器向客户端推送数据的标准
- **ReadableStream**: JavaScript 处理流式数据的 API
- `toDataStreamResponse()`: AI SDK 提供的便捷方法

**对比 generateText vs streamText**:
| 特性 | generateText | streamText |
|------|-------------|-----------|
| 响应方式 | 等待全部完成 | 实时流式 |
| 用户体验 | 延迟感明显 | 流畅实时 |
| 适用场景 | 短文本、批处理 | 聊天、长文本 |
| 实现复杂度 | 简单 | 需处理流 |

---

#### 步骤 4: 使用 AI SDK UI Hooks (1-2小时)

**学习目标**:
- 理解 AI SDK 提供的 React hooks 如何简化开发
- 掌握 `useChat` hook 的基本用法
- 了解 AI SDK 的消息格式和状态管理

**前置阅读**:
- AI SDK 文档: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot

**操作步骤**:

1. **创建聊天 API 路由** `app/api/chat/route.ts`:
```typescript
/**
 * AI 聊天 API 路由 (使用 AI SDK 标准格式)
 * 
 * 功能: 处理多轮对话，自动管理上下文
 * 
 * AI SDK 的消息格式:
 * - role: 'system' | 'user' | 'assistant'
 * - content: 消息内容
 * 
 * 学习要点:
 * 1. streamText 接收 messages 数组而不是单个 prompt
 * 2. AI SDK 会自动管理对话历史
 * 3. 配合前端的 useChat hook，实现开箱即用的聊天
 */

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  try {
    // 1. 解析请求体 - AI SDK 标准格式
    const { messages } = await request.json();

    // 2. 调用 streamText，传入对话历史
    const result = streamText({
      model: openai('gpt-4-turbo'),
      
      // 系统提示 - 定义 AI 的角色和行为规范
      system: `你是一个专业的 AI Agent 开发导师。
你的职责是:
1. 用简单易懂的语言解释技术概念
2. 提供实用的代码示例
3. 鼓励用户动手实践
4. 及时纠正常见的误解

回答时请:
- 使用中文
- 避免过于学术化的表达
- 多用类比和实例
- 结构清晰（使用列表和分段）`,

      // 对话历史 - 包含所有 user 和 assistant 消息
      messages,
      
      // 可选配置
      temperature: 0.7, // 控制随机性，0=确定，1=创意
      maxTokens: 2000,  // 最大生成长度
    });

    // 3. 返回流式响应
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('聊天 API 错误:', error);
    return new Response('聊天失败', { status: 500 });
  }
}
```

2. **创建聊天界面** `app/chat/page.tsx`:
```typescript
/**
 * 聊天界面组件
 * 
 * 功能: 使用 useChat hook 实现完整的聊天体验
 * 
 * useChat hook 自动处理:
 * - 消息状态管理
 * - 流式响应接收
 * - 输入框绑定
 * - 加载状态
 * - 错误处理
 * 
 * 学习要点: AI SDK 的 hooks 大幅简化了聊天应用的开发
 */

'use client';

import { useChat } from 'ai/react';

export default function ChatPage() {
  /**
   * useChat hook 返回的关键属性:
   * - messages: 消息历史数组
   * - input: 当前输入框的值
   * - handleInputChange: 输入框 onChange 处理器
   * - handleSubmit: 表单提交处理器
   * - isLoading: 是否正在等待响应
   */
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    // API 路由地址
    api: '/api/chat',
    
    // 可选: 初始消息
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是你的 AI Agent 开发导师。有什么我可以帮助你的吗？',
      },
    ],
  });

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* 标题 */}
      <h1 className="text-2xl font-bold mb-4">AI Agent 聊天助手</h1>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-8'
                : 'bg-gray-100 mr-8'
            }`}
          >
            {/* 角色标签 */}
            <div className="text-xs font-semibold mb-1 text-gray-600">
              {message.role === 'user' ? '你' : 'AI 助手'}
            </div>
            
            {/* 消息内容 */}
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}

        {/* 加载指示器 */}
        {isLoading && (
          <div className="bg-gray-100 mr-8 p-4 rounded-lg">
            <div className="text-gray-600">正在思考...</div>
          </div>
        )}
      </div>

      {/* 输入表单 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="输入你的问题... (按 Enter 发送)"
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </form>

      {/* 使用提示 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        提示: 你可以问我任何关于 AI Agent 开发的问题
      </div>
    </div>
  );
}
```

3. **更新首页** `app/page.tsx`:
```typescript
/**
 * 应用首页 - 导航页面
 */

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">AI Agent 学习项目</h1>
      
      <div className="space-y-4 w-full max-w-md">
        {/* 测试页面链接 */}
        <Link
          href="/test-stream"
          className="block p-4 border rounded hover:bg-gray-50 text-center"
        >
          <h2 className="font-bold">流式响应测试</h2>
          <p className="text-sm text-gray-600">学习如何处理 AI 的流式输出</p>
        </Link>

        {/* 聊天页面链接 */}
        <Link
          href="/chat"
          className="block p-4 border rounded hover:bg-gray-50 text-center"
        >
          <h2 className="font-bold">AI 聊天助手</h2>
          <p className="text-sm text-gray-600">使用 useChat hook 构建的聊天界面</p>
        </Link>
      </div>

      {/* 学习进度 */}
      <div className="mt-12 p-4 bg-blue-50 rounded max-w-md">
        <h3 className="font-bold mb-2">✅ 已完成</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• 步骤 1: 项目初始化</li>
          <li>• 步骤 2: 基础文本生成 API</li>
          <li>• 步骤 3: 流式响应</li>
          <li>• 步骤 4: useChat hook</li>
        </ul>
      </div>
    </div>
  );
}
```

**验证步骤**:
1. 访问 http://localhost:3000
2. 点击"AI 聊天助手"进入聊天页面
3. 尝试多轮对话:
   - "什么是 AI Agent？"
   - "它和普通的聊天机器人有什么区别？"
   - "能给我举个例子吗？"
4. 观察对话历史是否正确保持

**核心概念**:
- **useChat hook**: AI SDK 提供的 React hook，封装了所有聊天逻辑
- **messages 数组**: 包含 user 和 assistant 的完整对话历史
- **自动上下文管理**: hook 自动将历史消息发送给 API
- **流式响应**: useChat 自动处理流式数据，无需手动编码

**第一阶段总结**:
✅ 你已经学会了:
1. 使用 Bun 初始化 Next.js 项目
2. 调用 AI SDK 的基础 API (generateText, streamText)
3. 实现流式响应和手动处理流数据
4. 使用 useChat hook 快速构建聊天界面

📚 下一阶段预告: 
我们将学习 AI Agent 的核心能力 — **工具调用 (Tool Calling)**，让 AI 不仅能"说"，还能"做"！

---

### 🛠️ 第二阶段: 核心能力 - 工具调用 (3-4天)

> **核心理念**: AI Agent = LLM + 工具调用能力
> 
> 普通聊天机器人只能生成文本，AI Agent 能够调用外部工具（函数、API）来完成实际任务。

#### 步骤 5: 理解工具调用机制 (1小时 - 理论)

**学习目标**:
- 理解什么是 Function Calling
- 掌握工具的 schema 定义
- 了解 AI 如何决定调用哪个工具

**前置阅读**: 
- **必读**: [docs/ai-agents-for-beginners/04-tool-use-design-pattern.md](docs/ai-agents-for-beginners/04-tool-use-design-pattern.md)
- AI SDK 文档: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling

**关键概念笔记**:

```typescript
/**
 * 工具调用流程:
 * 
 * 1. 定义工具: 提供工具的名称、描述和参数 schema
 * 2. 注册工具: 将工具传递给 streamText
 * 3. LLM 决策: AI 根据用户提示和工具描述，决定是否调用工具
 * 4. 执行工具: AI SDK 自动调用对应的函数
 * 5. 返回结果: 工具结果被添加到对话上下文
 * 6. 生成响应: AI 基于工具结果生成最终回复
 * 
 * 示例场景:
 * 用户: "今天北京天气怎么样？"
 * → AI 识别需要天气信息
 * → 调用 getWeather({city: "北京"})
 * → 获取结果: {temp: 22, condition: "晴"}
 * → 生成回复: "北京今天晴天，温度 22°C"
 */

// 工具定义示例
const weatherTool = {
  // 工具名称（AI 会看到）
  name: 'getWeather',
  
  // 工具描述（帮助 AI 理解何时使用）
  description: '获取指定城市的实时天气信息',
  
  // 参数 schema（使用 Zod 定义）
  parameters: z.object({
    city: z.string().describe('城市名称，如：北京、上海'),
  }),
  
  // 工具的执行逻辑
  execute: async ({ city }) => {
    // 实际调用天气 API
    const weather = await fetchWeatherAPI(city);
    return weather;
  },
};
```

**工具设计原则** (来自文档):
1. **单一职责**: 每个工具只做一件事
2. **清晰描述**: description 是 AI 决策的关键
3. **严格验证**: 使用 Zod schema 验证参数
4. **错误处理**: 工具执行可能失败，要有降级方案

**无需编写代码，完成以下思考练习**:
- 如果要实现一个"查询股票价格"的工具，应该如何定义？
- 工具的 description 应该写什么？
- 参数 schema 需要哪些字段？

---

#### 步骤 6: 实现第一个工具 - 天气查询 (1-2小时)

**学习目标**:
- 使用 Zod 定义工具参数
- 实现工具的 execute 函数
- 在 streamText 中注册工具

**操作步骤**:

1. **创建工具目录** `lib/tools/`:
```bash
mkdir -p lib/tools
```

2. **实现天气工具** `lib/tools/weather.ts`:
```typescript
/**
 * 天气查询工具
 * 
 * 功能: 根据城市名称返回模拟的天气数据
 * 
 * 学习要点:
 * 1. 使用 Zod 定义参数 schema
 * 2. description 字段对 AI 的决策至关重要
 * 3. execute 函数返回的数据会被 AI 用于生成回复
 * 
 * 注意: 这里使用模拟数据，实际项目中应该调用真实的天气 API
 */

import { z } from 'zod';

/**
 * 工具参数的 schema 定义
 * 
 * .describe() 方法的作用:
 * - 告诉 AI 这个参数的含义
 * - 帮助 AI 正确提取用户输入中的参数值
 */
export const weatherToolSchema = z.object({
  city: z.string().describe('要查询天气的城市名称，例如：北京、上海、深圳'),
});

/**
 * 工具定义对象
 * 
 * AI SDK 要求的标准格式
 */
export const weatherTool = {
  // 工具名称 - 必须是合法的标识符
  name: 'getWeather',
  
  /**
   * 工具描述 - 非常重要！
   * 
   * AI 会根据这个描述来决定是否调用这个工具。
   * 好的描述应该:
   * - 清楚说明工具的功能
   * - 说明适用场景
   * - 提供使用示例
   */
  description: `获取指定城市的实时天气信息，包括温度、天气状况、湿度和风速。
适用于用户询问天气相关问题时使用。
例如: "北京天气怎么样？"、"上海今天会下雨吗？"`,

  // 参数 schema
  parameters: weatherToolSchema,

  /**
   * 工具执行函数
   * 
   * @param city - 从 AI 提取的城市名称
   * @returns 天气数据对象
   * 
   * 注意事项:
   * - 参数已经通过 Zod 验证，类型安全
   * - 可以是异步函数
   * - 应该处理错误情况（如城市不存在）
   */
  execute: async ({ city }: z.infer<typeof weatherToolSchema>) => {
    console.log(`[工具调用] getWeather: city=${city}`);

    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟天气数据
    // 实际项目中，这里应该调用真实的天气 API，例如:
    // const response = await fetch(`https://api.weather.com/v1/current?city=${city}`);
    // const data = await response.json();
    const weatherData = {
      city,
      temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
      condition: ['晴', '多云', '阴', '小雨'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
      windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
      timestamp: new Date().toLocaleString('zh-CN'),
    };

    console.log(`[工具结果] getWeather:`, weatherData);

    return weatherData;
  },
};

// 导出类型定义（用于 TypeScript 类型检查）
export type WeatherToolParams = z.infer<typeof weatherToolSchema>;
```

3. **创建带工具的聊天 API** `app/api/chat-with-tools/route.ts`:
```typescript
/**
 * 带工具调用的聊天 API
 * 
 * 功能: AI 可以根据用户提问自动调用工具
 * 
 * 学习要点:
 * 1. 在 streamText 中注册 tools
 * 2. AI SDK 会自动判断是否需要调用工具
 * 3. 工具调用是透明的，前端无需特殊处理
 */

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { weatherTool } from '@/lib/tools/weather';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const result = streamText({
      model: openai('gpt-4-turbo'),
      
      // 系统提示 - 告诉 AI 如何使用工具
      system: `你是一个有用的助手，可以帮助用户查询信息。
      
当用户询问天气时，你应该使用 getWeather 工具来获取实时数据，而不是编造信息。

使用工具后，请用自然的语言向用户报告结果。`,

      messages,

      /**
       * 注册工具
       * 
       * tools 是一个对象，key 是工具名称，value 是工具定义
       * AI SDK 会将这些工具信息发送给 LLM
       */
      tools: {
        getWeather: weatherTool,
        // 未来可以添加更多工具:
        // getStock: stockTool,
        // searchWeb: searchTool,
      },

      /**
       * 工具选择模式
       * 
       * - 'auto': AI 自动决定是否使用工具（默认，推荐）
       * - 'required': 强制 AI 必须调用工具
       * - 'none': 禁用工具调用
       */
      toolChoice: 'auto',

      // 最大工具调用轮次（防止无限循环）
      maxSteps: 5,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('聊天 API 错误:', error);
    return new Response('聊天失败', { status: 500 });
  }
}
```

4. **创建测试页面** `app/chat-tools/page.tsx`:
```typescript
/**
 * 工具调用测试页面
 * 
 * 功能: 与带工具能力的 AI 对话
 * 学习要点: 观察 AI 如何自动决策是否调用工具
 */

'use client';

import { useChat } from 'ai/react';

export default function ChatWithToolsPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat-with-tools',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我现在可以帮你查询天气了。试着问我 "北京今天天气怎么样？"',
      },
    ],
  });

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Agent - 工具调用演示</h1>

      {/* 功能说明 */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <p className="font-semibold mb-1">💡 测试建议:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>问天气: "上海今天天气怎么样？"</li>
          <li>对比: "北京和深圳哪个城市温度更高？"</li>
          <li>普通对话: "你是谁？"（不会调用工具）</li>
        </ul>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-12'
                : 'bg-gray-100 mr-12'
            }`}
          >
            <div className="text-xs font-semibold mb-2 text-gray-600">
              {message.role === 'user' ? '👤 你' : '🤖 AI Agent'}
            </div>
            
            {/* 消息内容 */}
            <div className="whitespace-pre-wrap">{message.content}</div>

            {/**
             * 显示工具调用信息
             * 
             * message.toolInvocations 包含工具调用的详细信息:
             * - toolName: 工具名称
             * - args: 调用参数
             * - result: 执行结果
             */}
            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="mt-3 p-2 bg-white border border-gray-300 rounded text-xs">
                <div className="font-semibold text-gray-700 mb-1">🔧 工具调用:</div>
                {message.toolInvocations.map((tool, idx) => (
                  <div key={idx} className="mb-2 last:mb-0">
                    <div className="text-gray-600">
                      <span className="font-mono">{tool.toolName}</span>
                      {' '}({JSON.stringify(tool.args)})
                    </div>
                    {tool.result && (
                      <div className="mt-1 p-2 bg-gray-50 rounded">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(tool.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="bg-gray-100 mr-12 p-4 rounded-lg">
            <div className="text-gray-600">🤔 思考中...</div>
          </div>
        )}
      </div>

      {/* 输入表单 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="问我任何天气相关的问题..."
          className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>
  );
}
```

5. **更新首页导航** `app/page.tsx`:
```typescript
// 在现有的链接列表中添加:

<Link
  href="/chat-tools"
  className="block p-4 border rounded hover:bg-gray-50 text-center"
>
  <h2 className="font-bold">AI Agent - 工具调用</h2>
  <p className="text-sm text-gray-600">🔧 AI 可以调用天气查询工具</p>
</Link>
```

**验证步骤**:
1. 访问 http://localhost:3000/chat-tools
2. 测试以下对话:
   ```
   你: 北京今天天气怎么样？
   AI: [调用 getWeather 工具] 北京今天晴天，温度 25°C...
   
   你: 上海和深圳哪个更热？
   AI: [调用两次 getWeather] 让我查一下... 深圳 28°C，上海 23°C，深圳更热
   
   你: 你好
   AI: [不调用工具] 你好！我是...
   ```
3. 打开浏览器控制台，查看工具调用日志
4. 观察 UI 中显示的工具调用详情

**核心概念**:
- **Function Calling**: LLM 识别用户意图后，主动调用工具
- **Schema 验证**: Zod 确保参数类型安全
- **自动决策**: AI SDK 的 `toolChoice: 'auto'` 让 AI 自主判断
- **透明集成**: 前端代码无需改动，AI SDK 自动处理工具调用流程

**常见问题**:
Q: AI 什么时候会调用工具？
A: 当用户的问题匹配工具的 description 描述的场景时。

Q: 如果工具执行失败怎么办？
A: 应该在 execute 函数中捕获错误，返回错误信息，AI 会向用户解释。

Q: 一次对话可以调用多个工具吗？
A: 可以！设置 `maxSteps` 控制最大调用次数。

---

#### 步骤 7: 实现更多工具 - 计算器和时间 (1-2小时)

**学习目标**:
- 练习工具定义的标准流程
- 理解不同类型工具的设计模式
- 掌握工具组合使用

**操作步骤**:

1. **计算器工具** `lib/tools/calculator.ts`:
```typescript
/**
 * 计算器工具
 * 
 * 功能: 执行基本的数学运算
 * 
 * 学习要点:
 * 1. 如何设计多参数工具
 * 2. 使用 enum 限制参数值
 * 3. 错误处理（如除零）
 */

import { z } from 'zod';

/**
 * 参数 schema - 包含多个字段
 */
export const calculatorSchema = z.object({
  // 第一个操作数
  a: z.number().describe('第一个数字'),
  
  // 运算符 - 使用 enum 限制可选值
  operation: z.enum(['+', '-', '*', '/']).describe('运算符: 加(+)、减(-)、乘(*)、除(/)'),
  
  // 第二个操作数
  b: z.number().describe('第二个数字'),
});

export const calculatorTool = {
  name: 'calculate',
  
  description: `执行基本的数学运算（加、减、乘、除）。
适用于用户需要计算数学表达式时。
例如: "23 加 45 等于多少？"、"100 除以 4"`,

  parameters: calculatorSchema,

  execute: async ({ a, operation, b }: z.infer<typeof calculatorSchema>) => {
    console.log(`[工具调用] calculate: ${a} ${operation} ${b}`);

    let result: number;

    switch (operation) {
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '*':
        result = a * b;
        break;
      case '/':
        // 错误处理: 除零检查
        if (b === 0) {
          throw new Error('除数不能为零');
        }
        result = a / b;
        break;
      default:
        throw new Error(`不支持的运算符: ${operation}`);
    }

    console.log(`[工具结果] calculate: ${result}`);

    return {
      expression: `${a} ${operation} ${b}`,
      result,
      // 提供额外的格式化结果
      formatted: `${a} ${operation} ${b} = ${result}`,
    };
  },
};
```

2. **时间工具** `lib/tools/datetime.ts`:
```typescript
/**
 * 时间日期工具
 * 
 * 功能: 获取当前时间、日期或时区信息
 * 
 * 学习要点:
 * 1. 可选参数的处理
 * 2. 返回结构化数据
 * 3. 国际化支持
 */

import { z } from 'zod';

export const datetimeSchema = z.object({
  // 可选参数: 时区
  timezone: z.string().optional().describe('时区，例如: Asia/Shanghai, America/New_York。不提供则使用本地时区'),
  
  // 可选参数: 格式化选项
  format: z.enum(['full', 'date', 'time']).optional().describe('返回格式: full(完整日期时间), date(仅日期), time(仅时间)'),
});

export const datetimeTool = {
  name: 'getDateTime',
  
  description: `获取当前的日期和时间信息。
可以指定时区和返回格式。
适用于用户询问时间、日期相关问题时。
例如: "现在几点了？"、"今天是几月几号？"、"纽约现在什么时间？"`,

  parameters: datetimeSchema,

  execute: async ({ timezone, format = 'full' }: z.infer<typeof datetimeSchema>) => {
    console.log(`[工具调用] getDateTime: timezone=${timezone}, format=${format}`);

    // 创建 Date 对象
    const now = new Date();

    // 配置格式化选项
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long',
    };

    // 根据 format 参数调整显示内容
    if (format === 'date') {
      delete options.hour;
      delete options.minute;
      delete options.second;
    } else if (format === 'time') {
      delete options.year;
      delete options.month;
      delete options.day;
      delete options.weekday;
    }

    // 格式化为中文
    const formatter = new Intl.DateTimeFormat('zh-CN', options);
    const formatted = formatter.format(now);

    const result = {
      timestamp: now.toISOString(),
      timezone: timezone || 'local',
      formatted,
      // 额外信息
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
    };

    console.log(`[工具结果] getDateTime:`, result);

    return result;
  },
};
```

3. **创建工具索引文件** `lib/tools/index.ts`:
```typescript
/**
 * 工具集合索引
 * 
 * 功能: 统一导出所有工具，方便使用
 * 
 * 好处:
 * - 集中管理所有工具
 * - 简化导入语句
 * - 便于后续扩展
 */

import { weatherTool } from './weather';
import { calculatorTool } from './calculator';
import { datetimeTool } from './datetime';

/**
 * 所有可用工具的集合
 * 
 * 键名会作为工具标识符在 AI SDK 中使用
 * 值是工具定义对象
 */
export const allTools = {
  // 天气查询
  getWeather: weatherTool,
  
  // 数学计算
  calculate: calculatorTool,
  
  // 时间日期
  getDateTime: datetimeTool,
  
  // 未来可以继续添加:
  // searchWeb: searchTool,
  // getStock: stockTool,
  // translateText: translationTool,
};

// 导出单个工具（供按需使用）
export { weatherTool, calculatorTool, datetimeTool };

// 导出类型定义
export type ToolName = keyof typeof allTools;
```

4. **更新聊天 API 使用所有工具** `app/api/chat-with-tools/route.ts`:
```typescript
// 修改 import
import { allTools } from '@/lib/tools';

// 修改 streamText 中的 tools 配置
const result = streamText({
  // ... 其他配置

  system: `你是一个多功能的 AI 助手，可以帮助用户完成多种任务。

你拥有以下能力:
1. 查询天气信息 (getWeather)
2. 执行数学计算 (calculate)
3. 获取时间日期 (getDateTime)

当用户的问题需要实时数据或计算时，请主动使用相应的工具。
使用工具后，用自然、友好的语言向用户解释结果。`,

  // 使用所有工具
  tools: allTools,

  // ... 其他配置
});
```

**验证步骤**:
测试以下对话场景：

```
# 测试 1: 多工具组合
你: 现在北京的天气如何？几点了？
AI: [调用 getWeather 和 getDateTime] 现在北京是...时间是...

# 测试 2: 计算
你: 帮我算一下 234 乘以 567
AI: [调用 calculate] 234 × 567 = 132,678

# 测试 3: 时区
你: 纽约现在几点？
AI: [调用 getDateTime 带 timezone] 纽约现在是...

# 测试 4: 复杂场景
你: 假设北京的温度是 25 度，纽约是 68 华氏度，哪个城市更热？（提示：华氏度转摄氏度是 (F-32)*5/9）
AI: [调用 getWeather 和 calculate，可能多次] 让我查一下...并计算...北京更热

# 测试 5: 无需工具
你: 给我讲个笑话
AI: [不调用任何工具] 好的！有一天...
```

**核心概念**:
- **工具组合**: AI 可以在一次对话中调用多个工具
- **参数多样性**: 必需参数、可选参数、枚举类型
- **错误处理**: 工具应该优雅地处理异常情况
- **索引模式**: 使用 index.ts 统一管理工具

**代码规范总结**:
```typescript
// ✅ 好的工具定义
export const myTool = {
  name: 'camelCase',              // 驼峰命名
  description: '详细且准确的描述', // 帮助 AI 理解
  parameters: z.object({          // 使用 Zod schema
    param: z.string().describe('清楚说明参数含义'),
  }),
  execute: async (params) => {
    // 1. 日志记录
    console.log('[工具调用]', params);
    
    // 2. 参数验证（Zod 已验证类型，这里验证业务逻辑）
    if (/* 业务条件 */) {
      throw new Error('清晰的错误信息');
    }
    
    // 3. 执行逻辑
    const result = await doSomething(params);
    
    // 4. 返回结构化数据
    return {
      // 主要结果
      data: result,
      // 额外的元信息
      metadata: { timestamp: Date.now() },
    };
  },
};
```

---

#### 步骤 8: 工具调用 UI 优化 (1-2小时)

**学习目标**:
- 使用 AI SDK Elements 提升工具调用的可视化
- 理解 `message.toolInvocations` 的数据结构
- 实现工具执行状态的实时反馈

**前置准备**:
```bash
# 安装 shadcn/ui (如果还没安装)
bunx shadcn@latest init

# 安装 AI SDK Elements
bunx ai-elements@latest add tool-status
```

**操作步骤**:

1. **创建工具状态组件** `components/tool-invocation.tsx`:
```typescript
/**
 * 工具调用可视化组件
 * 
 * 功能: 优雅地显示工具调用的过程和结果
 * 
 * 学习要点:
 * 1. message.toolInvocations 的数据结构
 * 2. 不同工具调用状态的 UI 处理
 * 3. 结果数据的格式化展示
 */

import React from 'react';
import type { ToolInvocation } from 'ai';

// 工具图标映射
const TOOL_ICONS: Record<string, string> = {
  getWeather: '🌤️',
  calculate: '🔢',
  getDateTime: '🕐',
};

// 工具名称映射（中文）
const TOOL_NAMES: Record<string, string> = {
  getWeather: '天气查询',
  calculate: '数学计算',
  getDateTime: '时间查询',
};

interface ToolInvocationDisplayProps {
  toolInvocations: ToolInvocation[];
}

export function ToolInvocationDisplay({ toolInvocations }: ToolInvocationDisplayProps) {
  if (!toolInvocations || toolInvocations.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      {toolInvocations.map((tool, idx) => (
        <div
          key={idx}
          className="p-3 bg-white border border-blue-200 rounded-lg text-sm"
        >
          {/* 工具头部 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {TOOL_ICONS[tool.toolName] || '🔧'}
            </span>
            <span className="font-semibold text-blue-700">
              {TOOL_NAMES[tool.toolName] || tool.toolName}
            </span>
            {/* 状态指示器 */}
            {tool.state === 'call' && (
              <span className="ml-auto text-xs text-gray-500">执行中...</span>
            )}
            {tool.state === 'result' && (
              <span className="ml-auto text-xs text-green-600">✓ 完成</span>
            )}
          </div>

          {/* 调用参数 */}
          {tool.args && Object.keys(tool.args).length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">参数:</div>
              <div className="p-2 bg-gray-50 rounded">
                {Object.entries(tool.args).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="font-mono text-gray-700">{key}:</span>{' '}
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 执行结果 */}
          {tool.result && (
            <div>
              <div className="text-xs text-gray-600 mb-1">结果:</div>
              <div className="p-2 bg-green-50 border border-green-200 rounded">
                {/* 根据工具类型格式化结果 */}
                {tool.toolName === 'getWeather' && (
                  <WeatherResult data={tool.result} />
                )}
                {tool.toolName === 'calculate' && (
                  <CalculateResult data={tool.result} />
                )}
                {tool.toolName === 'getDateTime' && (
                  <DateTimeResult data={tool.result} />
                )}
                {/* 默认: 显示 JSON */}
                {!['getWeather', 'calculate', 'getDateTime'].includes(tool.toolName) && (
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(tool.result, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * 天气结果格式化组件
 */
function WeatherResult({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div>
        <span className="text-gray-600">城市:</span> {data.city}
      </div>
      <div>
        <span className="text-gray-600">温度:</span> {data.temperature}°C
      </div>
      <div>
        <span className="text-gray-600">天气:</span> {data.condition}
      </div>
      <div>
        <span className="text-gray-600">湿度:</span> {data.humidity}%
      </div>
    </div>
  );
}

/**
 * 计算结果格式化组件
 */
function CalculateResult({ data }: { data: any }) {
  return (
    <div className="text-sm">
      <div className="font-mono text-lg text-center py-2">
        {data.formatted || `${data.result}`}
      </div>
    </div>
  );
}

/**
 * 时间结果格式化组件
 */
function DateTimeResult({ data }: { data: any }) {
  return (
    <div className="text-sm">
      <div className="font-medium text-center">
        {data.formatted}
      </div>
      {data.timezone && data.timezone !== 'local' && (
        <div className="text-xs text-gray-600 text-center mt-1">
          时区: {data.timezone}
        </div>
      )}
    </div>
  );
}
```

2. **更新聊天页面使用新组件** `app/chat-tools/page.tsx`:
```typescript
// 在文件顶部添加 import
import { ToolInvocationDisplay } from '@/components/tool-invocation';

// 在消息渲染部分，替换之前的 toolInvocations 显示代码为:
{message.toolInvocations && message.toolInvocations.length > 0 && (
  <ToolInvocationDisplay toolInvocations={message.toolInvocations} />
)}
```

3. **创建工具使用统计组件** `components/tool-stats.tsx`:
```typescript
/**
 * 工具使用统计组件
 * 
 * 功能: 显示当前会话中的工具调用统计
 * 学习要点: 如何从 messages 中提取和分析数据
 */

import React, { useMemo } from 'react';
import type { Message } from 'ai';

interface ToolStatsProps {
  messages: Message[];
}

export function ToolStats({ messages }: ToolStatsProps) {
  /**
   * 计算工具使用统计
   */
  const stats = useMemo(() => {
    const toolCounts: Record<string, number> = {};
    let totalCalls = 0;

    messages.forEach(message => {
      if (message.toolInvocations) {
        message.toolInvocations.forEach(tool => {
          if (tool.state === 'result') {
            toolCounts[tool.toolName] = (toolCounts[tool.toolName] || 0) + 1;
            totalCalls++;
          }
        });
      }
    });

    return { toolCounts, totalCalls };
  }, [messages]);

  if (stats.totalCalls === 0) {
    return null;
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
      <div className="font-semibold text-blue-900 mb-2">
        🔧 工具调用统计 (共 {stats.totalCalls} 次)
      </div>
      <div className="space-y-1">
        {Object.entries(stats.toolCounts).map(([toolName, count]) => (
          <div key={toolName} className="flex justify-between text-xs">
            <span className="text-gray-700">{toolName}</span>
            <span className="font-mono text-gray-900">{count} 次</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

4. **在聊天页面中添加统计** `app/chat-tools/page.tsx`:
```typescript
// 添加 import
import { ToolStats } from '@/components/tool-stats';

// 在功能说明下方添加统计组件
<ToolStats messages={messages} />
```

**验证步骤**:
1. 进行多轮对话，混合使用不同的工具
2. 观察工具调用时的视觉反馈（图标、状态、格式化结果）
3. 确认工具统计正确显示调用次数

**核心概念**:
- **ToolInvocation 数据结构**:
  ```typescript
  interface ToolInvocation {
    toolName: string;      // 工具名称
    args: Record<string, any>;  // 调用参数
    result?: any;          // 执行结果
    state: 'call' | 'result'; // 状态
  }
  ```
- **组件化思维**: 将复杂的 UI 逻辑封装成可复用组件
- **数据驱动渲染**: 根据工具类型动态渲染不同的结果格式

**第二阶段总结**:
✅ 你已经学会了:
1. 理解工具调用（Function Calling）的机制
2. 使用 Zod 定义工具参数 schema
3. 实现天气、计算器、时间等多种工具
4. 工具的组合使用和状态管理
5. 优化工具调用的 UI 展示

📊 目前的技术栈:
```
前端:
├─ Next.js 15 (App Router)
├─ React (useChat hook)
└─ Tailwind CSS

AI 层:
├─ AI SDK Core (streamText + tools)
├─ OpenAI GPT-4 Turbo
└─ 自定义工具集 (3个)

架构:
├─ API Routes (/api/chat-with-tools)
├─ 工具系统 (/lib/tools)
└─ UI 组件 (/components)
```

📚 下一阶段预告:
我们将进入**第三阶段 - 状态管理**，学习如何实现：
- 对话历史持久化（保存到数据库）
- 用户认证系统
- 短期和长期记忆机制

这将让你的 AI Agent 从"无状态"升级为"有记忆"的智能助手！

---

### 💾 第三阶段: 状态管理与持久化 (3-4天)

> **核心理念**: AI Agent 的记忆能力
> 
> - **无记忆 Agent**: 每次对话都是全新开始
> - **有记忆 Agent**: 能够记住用户偏好、历史对话和上下文

（第三阶段内容将在下一个迭代中详细展开...）

---

## 后续阶段预告

### 第四阶段: 知识增强 (RAG) 
- 向量数据库集成
- 文件上传和解析
- 语义搜索

### 第五阶段: 高级模式
- 多步骤任务规划
- Agent 的"思考"过程可视化
- 复杂工作流

### 第六阶段: 生产就绪
- 安全加固（防 prompt injection）
- 监控和日志
- 部署到 Vercel

---

## 附录

### A. 快速命令参考

```bash
# 开发
bun run dev          # 启动开发服务器
bun run build        # 构建生产版本
bun run start        # 启动生产服务器

# 依赖管理
bun add <package>    # 安装依赖
bun remove <package> # 移除依赖
bun update          # 更新依赖

# 代码质量
bun run lint        # 运行 ESLint
bun run type-check  # TypeScript 类型检查
```

### B. 资源链接

**官方文档**:
- AI SDK: https://ai-sdk.dev/
- Next.js: https://nextjs.org/docs
- Bun: https://bun.sh/docs

**参考项目**:
- Vercel Chatbot: https://github.com/vercel/chatbot
- AI SDK Examples: https://github.com/vercel/ai/tree/main/examples

**学习资源**:
- 本项目的理论基础: `docs/ai-agents-for-beginners/`
- MCP 协议: `docs/mcp-for-beginners/`

### C. 常见问题

**Q: 为什么选择 Bun 而不是 npm/pnpm？**
A: Bun 速度更快，内置 TypeScript 支持，兼容 npm 生态。

**Q: API Key 如何管理？**
A: 使用 `.env.local` 文件，不要提交到 Git。

**Q: 如何调试工具调用？**
A: 查看浏览器控制台和服务器日志，观察工具的 `console.log` 输出。

**Q: 工具调用失败怎么办？**
A: 检查: 1) 工具 description 是否清晰，2) 参数 schema 是否正确，3) execute 函数是否有错误。

---

## 学习检查清单

完成每个步骤后，请自我检查：

### 第一阶段
- [ ] 能独立创建 Next.js 项目
- [ ] 理解 API Routes 的工作原理
- [ ] 掌握 `generateText` 和 `streamText` 的区别
- [ ] 能使用 `useChat` hook 构建聊天界面

### 第二阶段
- [ ] 理解工具调用（Function Calling）的流程
- [ ] 能使用 Zod 定义参数 schema
- [ ] 能实现至少 3 个不同类型的工具
- [ ] 理解 `toolChoice` 和 `maxSteps` 的作用
- [ ] 能优化工具调用的 UI 展示

---

**下一步**: 准备好开始了吗？执行步骤 1 来初始化项目！
