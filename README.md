# AI Agent App

[![CI](https://github.com/zhw2590582/ai-agent-template/workflows/CI/badge.svg)](https://github.com/zhw2590582/ai-agent-template/actions)

一个面向长期扩展的 AI Agent Web App 骨架。

当前版本聚焦三件事：

- 宽屏暗黑聊天布局，接近 `chatgpt.com`
- 使用 `AI Elements` 和 `shadcn/ui` 作为主要 UI 组件来源
- 建立可持续扩展的代码结构，为后续接入 memory、RAG、planning 和 multi-agent 做准备

## Current Scope

当前已经具备：

- 基于 `useChat` 的流式聊天
- 服务端工具调用（天气、计算器、时间查询）
- 暗黑主题聊天界面
- 功能域与服务端分层
- **完整的国际化支持** 🌍：基于 next-intl，支持中英文切换
- **Phase 1 完成** ✅：工具拆分、Prompt 抽离、类型系统建立
- **Phase 1.5 完成** ✅：基础设施（环境变量验证、错误处理、日志系统、CI/CD、i18n）

当前还没有做：

- 会话持久化
- 用户系统
- RAG
- 任务规划
- 多代理协作

这些能力会在现有结构上逐步接入，而不是推倒重来。

### 访问应用

应用支持多语言访问：

- **中文**: `http://localhost:3000/zh-CN`
- **English**: `http://localhost:3000/en-US`
- **默认**: `http://localhost:3000` (自动重定向到 zh-CN)

### 启动开发环境

```bash
bun install
bun run dev
```

详细设置说明见 [SETUP.md](./SETUP.md)

## Features

### 国际化 (i18n) 🌍

- ✅ 基于 **next-intl** 的完整国际化支持
- ✅ 支持语言：中文 (zh-CN)、English (en-US)
- ✅ 自动语言检测（URL / Cookie / Accept-Language）
- ✅ 语言切换组件
- ✅ 类型安全的翻译系统

使用方法：

```typescript
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations();
  return <h1>{t('common.app_name')}</h1>;
}
```

详见 [docs/i18n-guide.md](./docs/i18n-guide000`

详细设置说明见 [SETUP.md](./SETUP.md)

## Development

### 本地开发

````bash
# 启动开发服务器
bun dev

# 代码格式化[locale]/            # ← i18n: 语言路由层
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── api/chat/route.ts
├── components/
│   ├── ai-elements/
│   ├── ui/
│   └── language-switcher.tsx  # ← 语言切换组件
├── config/                    # ← 新增：集中配置管理
│   ├── app.ts                 # 应用配置、特性开关
│   ├── env.ts                 # 环境变量验证
│   ├── i18n.ts                # i18n 配置
│   └── paths.ts               # 路径常量
├── features/
│   └── chat/
│       ├── components/
│       ├── lib/
│       └── pages/
├── i18n/
│   └── request.ts             # ← next-intl 配置
├── lib/
│   ├── errors.ts              # ← 新增：错误处理
│   ├── i18n.ts                # ← i18n 工具函数
│   ├── logger.ts              # ← 新增：日志系统
│   └── utils.ts
├── locales/                   # ← 新增：翻译文件
│   ├── zh-CN.ts
│   └── en-US.ts
├── proxy.ts                   # ← i18n 路由处理（Next.js 16+）
└── server/
    ├── ai/
    │   ├── models.ts
    │   ├── prompts.ts         # 系统 prompt 管理
    │   └── tools/             #
- ✅ 代码质量检查 (ESLint)
- ✅ TypeScript 类型检查
- ✅ 构建验证

详见 [.github/README.md](.github/README.md)

## Structure

```text
src/
├── app/
│   ├── api/chat/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ai-elements/
│   └── ui/
├── features/
│   └── chat/
│       ├── components/
│       ├── lib/
│       └── pages/
├── lib/
│   └── utils.ts
└── server/
    ├── ai/
    │   ├── models.ts
    │   ├── prompts.ts      # ← 新增：系统 prompt 管理
    │   └── tools/          # ← 重构：拆分为独立工具
    │       ├── calculator.ts
    │       ├── datetime.ts
    │       ├── weather.ts
    │       └── index.ts
    ├── chat.ts
    └── types.ts            # ← 新增：共享类型定义
````

## Docs

新的文档入口在 [docs/README.md](./docs/README.md)。

建议阅读顺序：

1. [docs/architecture.md](./docs/architecture.md) - 系统架构
2. [docs/conventions.md](./docs/conventions.md) - 编码规范
3. [docs/roadmap.md](./docs/roadmap.md) - 演进路线（Phase 1 已完成 ✅）
4. [docs/capability-mapping.md](./docs/capability-mapping.md) - 功能对照与实现分析

保留的参考资料：

- [docs/ai-agents-for-beginners](./docs/ai-agents-for-beginners) - AI Agent 理论与模式
- [docs/mcp-for-beginners](./docs/mcp-for-beginners) - MCP 协议参考

## Stack

- Next.js 16
- React 19
- Vercel AI SDK
- AI Elements
- shadcn/ui
- Tailwind CSS v4
- Zod
- Bun

## Theme

当前项目固定为暗黑主题。

目标不是做一套完整主题系统，而是先把聊天产品体验和结构稳定下来。

## Recent Updates (2026-04-11)

✅ **Phase 1 完成**：

- 工具文件拆分到 `server/ai/tools/`
- 系统 prompt 抽离到 `server/ai/prompts.ts`
- 共享类型定义在 `server/types.ts`
- 为 Memory、RAG、Planning、Multi-Agent 预留类型接口

## Next Steps

推荐按 [docs/roadmap.md](./docs/roadmap.md) 进行，优先级：

1. **Phase 2A: Memory**（1-2 周）- 会话历史和用户偏好
2. **Phase 2B: RAG**（2-3 周）- 知识库检索
3. **Phase 3: Planning**（2-3 周）- 多步骤任务规划

详细实现路径见 [docs/capability-mapping.md](./docs/capability-mapping.md)。

1. 把 `src/server/ai/tools.ts` 拆成多个工具文件
2. 把系统 prompt 抽离到 `src/server/ai/prompts.ts`
3. 补充共享类型，给 memory / rag / planning 做准备
