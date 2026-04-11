'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ConfigStatus {
  baseURL: string;
  configured: boolean;
  model: string;
  provider: string;
  status: string;
  timestamp: string;
}

export function DeepseekTestPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);

  useEffect(() => {
    fetch('/api/test-deepseek')
      .then(res => res.json())
      .then(data => setConfigStatus(data))
      .catch(err => console.error('配置检查失败:', err));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/test-deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '请求失败');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('无法读取响应流');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setResponse(prev => prev + chunk);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('请求错误:', error);
      setResponse(`❌ 错误: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-2 text-3xl font-bold">DeepSeek API 测试</h1>
      <p className="mb-6 text-gray-600">验证 DeepSeek 配置是否正常工作</p>

      {configStatus && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            configStatus.configured
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <h2 className="mb-2 font-semibold">
            {configStatus.configured
              ? '✅ 配置状态: 正常'
              : '❌ 配置状态: 未配置'}
          </h2>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-mono">Provider:</span> {configStatus.provider}
            </div>
            <div>
              <span className="font-mono">Model:</span> {configStatus.model}
            </div>
            <div>
              <span className="font-mono">Base URL:</span> {configStatus.baseURL}
            </div>
            <div>
              <span className="font-mono">API Key:</span>{' '}
              {configStatus.configured ? '已配置 ✓' : '未配置 ✗'}
            </div>
          </div>

          {!configStatus.configured ? (
            <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm">
              <p className="mb-1 font-semibold">⚠️ 请配置 API Key:</p>
              <ol className="list-inside list-decimal space-y-1 text-gray-700">
                <li>打开 `.env.local` 文件</li>
                <li>确保 `DEEPSEEK_API_KEY` 已填入正确的值</li>
                <li>重启开发服务器 (`bun run dev`)</li>
              </ol>
            </div>
          ) : null}
        </div>
      )}

      <div className="mb-6 rounded border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold">💡 测试建议:</h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>简单问题: “你好，请介绍一下你自己”</li>
          <li>代码生成: “用 Python 写一个快速排序”</li>
          <li>中文理解: “解释什么是 AI Agent”</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-3">
          <label className="mb-2 block text-sm font-medium">测试消息:</label>
          <input
            type="text"
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="输入你的测试问题..."
            className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading || !configStatus?.configured}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim() || !configStatus?.configured}
          className="w-full rounded-lg bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? '⏳ 生成中...' : '🚀 发送测试请求'}
        </button>
      </form>

      <div className="min-h-[200px] rounded-lg border bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold text-gray-700">DeepSeek 响应:</h3>
        {response ? (
          <div className="whitespace-pre-wrap text-gray-900">{response}</div>
        ) : (
          <div className="italic text-gray-400">响应将在这里显示...</div>
        )}
      </div>

      <div className="mt-6 rounded border border-purple-200 bg-purple-50 p-4 text-sm">
        <h3 className="mb-2 font-semibold">📊 为什么使用 DeepSeek?</h3>
        <ul className="space-y-1 text-gray-700">
          <li>✅ <strong>成本更低</strong>: 比 OpenAI 便宜 10-20 倍</li>
          <li>✅ <strong>性能优秀</strong>: 在中文任务上表现出色</li>
          <li>✅ <strong>API 兼容</strong>: 完全兼容 OpenAI 格式</li>
          <li>✅ <strong>适合学习</strong>: 测试阶段可以节省大量成本</li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-blue-500 underline hover:text-blue-600">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}

