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
├── app/                # Next.js route entry only
├── components/         # Third-party sourced UI building blocks
├── features/chat/      # Current business domain
├── lib/                # Minimal shared utilities
└── server/             # Server-side AI orchestration
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

### 3. Keep the theme dark-only

- 当前只支持暗黑主题
- 不要引入双主题业务样式复杂度
- 优先使用语义 token，而不是亮色/暗色分叉样式

### 4. Keep dependencies minimal

除非功能收益明确，否则不要主动引入：

- 全局状态库
- ORM
- 表单框架
- 主题管理库
- 额外 UI 系统

### 5. Grow `server` gradually

当前：

- `server/chat.ts`
- `server/ai/models.ts`
- `server/ai/tools.ts`

未来允许逐步扩成：

- `server/ai/prompts.ts`
- `server/ai/tools/*`
- `server/ai/memory/*`
- `server/ai/rag/*`
- `server/ai/planners/*`

不要提前把目录拆得很深。

## Recommended Next Refactors

当继续实现教程中的新能力时，优先做：

1. 拆工具文件
2. 抽 prompt 文件
3. 增加共享类型

这是最小且高收益的结构升级。

## Docs

优先参考：

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/conventions.md`](docs/conventions.md)
- [`docs/roadmap.md`](docs/roadmap.md)

理论资料仍保留在：

- `docs/ai-agents-for-beginners/`
- `docs/mcp-for-beginners/`
