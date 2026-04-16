<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AI Agent App - Contributor Context

本文件为协助开发的 AI 助手和贡献者提供项目上下文。

## Project Direction

这是一个面向长期扩展的 AI Agent Web App 骨架，不再按教学 demo 的方式组织。

当前重点：

- 保持聊天产品体验稳定
- 保持目录简洁
- 优先复用第三方组件
- 为后续 memory、RAG、planning、多代理预留结构

## Runtime Structure

```text
src/
├── app/                # Next.js route 和 API 入口
├── components/         # 基础 UI、AI Elements 和 wrapper 组件
├── config/             # env / app / i18n / navigation 等配置
├── features/           # 按能力拆分的真实业务域
├── i18n/               # 国际化配置与消息聚合
├── lib/                # 通用工具、错误处理、日志、Supabase client
└── proxy.ts            # locale 检测与 session 更新
```

## Important Rules

### 1. Keep `app` thin

- `page.tsx` only mounts page-level components
- `route.ts` only forwards to handlers
- Do not accumulate business logic in route files

### 2. Prefer existing components

优先使用：

- `src/components/ai-elements`
- `src/components/ui`

避免在 `features/chat` 再造一套平行基础组件。

同时，这两层视为原子组件层：

- `src/components/ui/*` 是 `shadcn/ui` 原子组件
- `src/components/ai-elements/*` 是 `AI Elements` 原子组件

默认禁止直接修改这两个目录中的文件。

允许的例外只有：

- 使用官方 CLI 重新生成或覆盖
- 极少数必须的编译兼容修复

项目自己的样式、布局、业务组合和交互调整，必须放在：

- `src/features/*/components/*`
- 或新的 wrapper 层，例如 `src/components/app-ui/*`

### 3. Keep themes aligned

- 当前已支持亮色和暗色主题
- 不要写死单一主题样式
- 优先使用语义 token，而不是为亮色/暗色分别堆业务样式

### 4. Keep dependencies minimal

除非功能收益明确，否则不要主动引入：

- 全局状态库
- ORM
- 表单框架
- 主题管理库
- 额外 UI 系统

### 5. Grow `server` gradually

当前：

- `src/features/chat/server/*`
- `src/features/chat/agent-runtime/*`
- `src/features/chat/ai/*`
- `src/features/*/server/*`

未来允许逐步扩成：

- `src/features/chat/ai/core/*`
- `src/features/chat/ai/tools/*`
- `src/features/chat/ai/workflows/*`
- `src/features/memory/storage/*`
- `src/features/rag/server/*`
- `src/features/sandbox/server/*`

不要提前把目录拆得很深。

聊天 runtime 的新增编排逻辑，优先进入：

- `src/features/chat/agent-runtime/*`

兼容 wrapper 只保留在这些位置，不继续增长业务逻辑：

- `src/features/chat/hooks/use-chat-session.ts`
- `src/features/chat/server/chat-request-context.ts`
- `src/features/chat/server/chat-finish.ts`
- `src/features/chat/ai/workflows/generateText.ts`

### 6. Keep prompts English-first

- 内置 prompt 默认使用英文编写
- 不长期维护同一语义的中英文双份 prompt
- 需要语言适配时，优先把 `locale` 作为上下文传给模型
- 只有在英文 prompt 无法满足效果时，才增加特定语言 prompt

### 7. Fix Tailwind warnings

- Tailwind 警告不能忽略
- 无论来自 `bun run lint`、编辑器、Tailwind IntelliSense，还是构建过程，只要出现 Tailwind 类名警告，就要修掉
- 优先改成合法的标准类名；只有没有标准类可表达时，才使用任意值

## Recommended Next Refactors

当继续实现教程中的新能力时，优先做：

1. 拆工具文件
2. 抽 prompt 文件
3. 增加共享类型

这是最小且高收益的结构升级。

## Docs

优先参考：

- [`docs/project-status.md`](docs/project-status.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/agent-harness.md`](docs/agent-harness.md)
- [`docs/conventions.md`](docs/conventions.md)
- [`docs/roadmap.md`](docs/roadmap.md)

理论资料仍保留在：

- `docs/ai-agents-for-beginners/`
- `docs/mcp-for-beginners/`
