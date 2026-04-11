# 快速开始指南

> ⚡ 10 分钟快速体验 AI Agent 开发

如果你想快速体验而不是系统学习，可以按照这个简化流程操作。

## 前置条件

1. **安装 Bun**: 
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **获取 OpenAI API Key**: 
   访问 https://platform.openai.com/api-keys

## 快速开始步骤

### 1. 创建项目 (2分钟)

```bash
# 进入项目目录
cd /Users/harvey/Desktop/github/ai-agent-template

# 安装 AI SDK
bun add ai @ai-sdk/openai zod
```

### 2. 配置 API Key (1分钟)

创建 `.env.local` 文件：

```bash
echo "OPENAI_API_KEY=sk-your-api-key-here" > .env.local
```

请将 `sk-your-api-key-here` 替换为你的真实 API Key！

### 3. 创建 API 路由 (3分钟)

创建文件 `app/api/chat/route.ts`：

```bash
mkdir -p app/api/chat
```

复制以下内容到 `app/api/chat/route.ts`:

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  const { messages } = await request.json();
  
  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: '你是一个友好的 AI 助手。',
    messages,
  });

  return result.toDataStreamResponse();
}
```

### 4. 创建聊天页面 (3分钟)

替换 `app/page.tsx` 的内容为：

```typescript
'use client';

import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Agent 快速体验</h1>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center mt-8">
            发送你的第一条消息开始对话 👋
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-12'
                : 'bg-gray-100 mr-12'
            }`}
          >
            <div className="text-xs font-semibold mb-1 text-gray-600">
              {message.role === 'user' ? '你' : 'AI'}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-gray-100 mr-12 p-4 rounded-lg">
            <div className="text-gray-600">思考中...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="输入你的消息..."
          className="flex-1 p-2 border rounded"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>
  );
}
```

### 5. 启动项目 (1分钟)

```bash
bun run dev
```

访问 http://localhost:3000，你应该能看到一个可以对话的 AI 聊天界面！

## 🎉 成功！

你已经创建了一个基本的 AI Agent！现在你可以：

1. **尝试对话**: 问 AI 任何问题
2. **观察流式响应**: 注意文字是逐字显示的
3. **测试多轮对话**: AI 会记住对话历史

## 🚀 下一步

快速体验完成后，建议：

1. **系统学习**: 阅读 [plan.md](plan.md) 了解完整的学习路径
2. **添加工具**: 按照步骤 6-8 添加工具调用能力
3. **深入理解**: 阅读 `docs/ai-agents-for-beginners/` 中的理论文档

## ❓ 遇到问题？

### API Key 错误
```
Error: Invalid API Key
```
➜ 检查 `.env.local` 中的 API Key 是否正确

### 端口被占用
```
Error: Port 3000 is already in use
```
➜ 停止其他运行在 3000 端口的服务，或修改端口：
```bash
bun run dev -- -p 3001
```

### TypeScript 错误
```
Cannot find module 'ai/react'
```
➜ 确保已经安装依赖：
```bash
bun install
```

## 📚 有用的命令

```bash
# 查看日志
bun run dev

# 构建生产版本
bun run build

# 运行生产版本
bun run start

# 代码格式检查
bun run lint
```

---

**准备好深入学习了吗？** 查看 [plan.md](plan.md) 开始系统的学习之旅！
