# Architecture

## Goals

当前项目的目标不是一次性做成大而全的平台，而是建立一个可以持续生长的 AI Agent 应用骨架：

- UI 可以持续扩展
- Server 逻辑可以逐步增强
- 新能力可以沿着现有边界自然接入
- 在依赖保持克制的前提下，代码仍然清晰

## Runtime Structure

```text
src/
├── app/
│   ├── [locale]/           # i18n 路由层
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── api/
│       └── chat/route.ts
├── components/
│   ├── ai-elements/
│   ├── ui/
│   └── language-switcher.tsx
├── config/                 # 集中配置
│   ├── app.ts
│   ├── env.ts
│   ├── i18n.ts
│   └── paths.ts
├── features/
│   └── chat/
│       ├── components/
│       ├── lib/
│       └── pages/
├── i18n/
│   └── request.ts          # next-intl 配置
├── lib/
│   ├── errors.ts
│   ├── i18n.ts
│   ├── logger.ts
│   └── utils.ts
├── locales/                # 翻译文件
│   ├── zh-CN.ts
│   └── en-US.ts
├── proxy.ts                # i18n 路由处理 (Next.js 16+)
└── server/
    ├── ai/
    │   ├── models.ts
    │   ├── prompts.ts      # 系统 prompt
    │   └── tools/          # 工具模块化
    │       ├── calculator.ts
    │       ├── datetime.ts
    │       ├── weather.ts
    │       └── index.ts
    ├── chat.ts
    └── types.ts            # 共享类型
```

## Layer Responsibilities

### `src/app`

只保留 Next.js 路由入口。

- `[locale]/layout.tsx`: i18n 布局、NextIntlClientProvider、主题、全局壳子
- `[locale]/page.tsx`: 挂载页面级组合组件
- `api/chat/route.ts`: 挂载服务端 handler

规则：

- 不在这里写复杂业务逻辑
- 不在这里堆工具、模型、数据转换
- locale 路由通过 proxy.ts 自动处理

### `src/features/chat`

这是当前唯一业务域。

- `pages/`: 页面级组合，负责把多个组件拼装起来
- `components/`: 聊天 UI 组件
- `lib/`: 轻量配置、消息处理函数、纯前端 helper

未来如果新增业务域，按同级继续扩：

- `features/memory`
- `features/rag`
- `features/planning`
- `features/settings`

### `src/components`

这里放第三方组件源码和基础 UI 组件。

- `components/ai-elements`: AI Elements 组件
- `components/ui`: shadcn/ui 基础组件
- `components/language-switcher.tsx`: 语言切换组件

规则：

- 尽量优先复用这里已有组件
- 非必要不要在业务层重复造输入框、消息容器、工具展示组件
- 如果要改第三方组件行为，优先做最小修改

### `src/config`

集中配置管理层。

- `config/app.ts`: 应用配置、特性开关（FEATURES）
- `config/env.ts`: 环境变量验证（Zod schema）
- `config/i18n.ts`: 国际化配置（支持的语言、默认语言）
- `config/paths.ts`: 路径常量

规则：

- 所有配置集中管理，避免分散
- 环境变量必须经过验证
- 使用 Feature Flags 控制功能开关

### `src/lib`

工具函数和基础设施层。

- `lib/errors.ts`: 错误处理（ErrorCode、AppError）
- `lib/logger.ts`: 结构化日志系统
- `lib/i18n.ts`: i18n 工具函数（与 next-intl 兼容）
- `lib/utils.ts`: 通用工具函数

规则：

- 只放跨域复用的纯函数
- 错误处理统一使用 AppError
- 日志使用 logger 而非 console

### `src/server`

服务端 AI 能力集中在这里。

当前结构：

```text
src/server/
├── ai/
│   ├── models.ts      # 模型配置
│   ├── prompts.ts     # 系统 prompt（已抽离）✅
│   └── tools/         # 工具模块化（已拆分）✅
│       ├── calculator.ts
│       ├── datetime.ts
│       ├── weather.ts
│       └── index.ts
├── chat.ts            # chat handler
└── types.ts           # 共享类型定义 ✅
```

未来扩展方向：

```text
src/server/
├── ai/
│   ├── models.ts
│   ├── prompts.ts
│   ├── tools/
│   ├── memory/        # Phase 2
│   ├── rag/           # Phase 3
│   └── planners/      # Phase 4
├── chat.ts
└── storage/           # 持久化层
```

## Current Request Flow

```text
User Input
  -> useChat
  -> /api/chat
  -> server/chat.ts
  -> streamText(...)
  -> registered tools
  -> UI message stream
  -> AI Elements chat UI
```

## Extension Strategy

后续新增能力时，优先按下面原则扩展：

1. 新增 prompt / orchestration 逻辑，放 `src/server`
2. 新增业务界面，放 `src/features/<domain>`
3. 复用聊天 UI 时，优先基于 `AI Elements` 组合
4. 只有跨域复用的纯工具函数，才放 `src/lib`

## Completed Infrastructure (Phase 1 & 1.5) ✅

以下基础设施已完成，可以直接在此基础上开发新功能：

1. ✅ **工具模块化**: `src/server/ai/tools/` 已拆分为独立文件
2. ✅ **Prompt 管理**: 系统 prompt 已抽离到 `src/server/ai/prompts.ts`
3. ✅ **类型系统**: `src/server/types.ts` 定义了 Memory/RAG/Planning 共享类型
4. ✅ **配置管理**: 环境变量验证、集中配置、特性开关
5. ✅ **错误处理**: 统一的 AppError 和 ErrorCode
6. ✅ **日志系统**: 结构化日志（开发/生产环境自适应）
7. ✅ **i18n 支持**: 完整的国际化（next-intl + 中英文）
8. ✅ **代码质量**: Prettier + ESLint + CI/CD

## Next Steps (Phase 2+)

当前结构已为后续功能做好准备：

1. **Phase 2: Memory** - 会话持久化、历史上下文
2. **Phase 3: RAG** - 向量检索、知识库
3. **Phase 4: Planning** - 任务拆解、多步骤执行
4. **Phase 5: Multi-Agent** - 多代理协作

详见 [roadmap.md](roadmap.md)
