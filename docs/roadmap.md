# Roadmap

这份路线图不是“教学步骤清单”，而是未来功能接入的推荐顺序。

## Phase 1: Solidify Chat Core ✅

**状态**: 已完成（2026-04-11）

**目标**: 把当前聊天骨架稳定下来。

**已完成的动作**:

1. ✅ 拆分 `server/ai/tools.ts` → `server/ai/tools/`
   - `weather.ts`: 天气查询工具
   - `calculator.ts`: 数学计算工具
   - `datetime.ts`: 时间查询工具
   - `index.ts`: 统一导出

2. ✅ 抽离 `server/ai/prompts.ts`
   - `GENERAL_AGENT_SYSTEM_PROMPT`: 通用 agent prompt
   - `DEFAULT_SYSTEM_PROMPT`: 默认 prompt
   - 为多场景 prompt 预留扩展空间

3. ✅ 引入共享类型 `server/types.ts`
   - Memory 相关: `ConversationMetadata`, `BaseMessage`
   - RAG 相关: `DocumentChunk`
   - Planning 相关: `TaskStep`, `TaskPlan`
   - Multi-Agent 相关: `AgentConfig`, `AgentContext`
   - 工具相关: `ToolResult<T>`

4. ✅ 更新 `server/chat.ts` 引用新结构

**实际收益**:

- 工具文件清晰，每个工具独立维护
- Prompt 集中管理，易于版本控制和 A/B 测试
- 类型系统为 Phase 2-6 做好准备，减少后续重构
- 代码结构更符合 production 标准

## Phase 1.5: Infrastructure & Code Quality ✅

**状态**: 已完成（2026-04-11）

**目标**: 建立生产级基础设施和严格的代码质量标准。

**已完成的动作**:

1. ✅ 环境变量验证系统
   - `src/config/env.ts`: 使用 Zod 进行运行时验证
   - 类型安全的环境变量访问

2. ✅ 集中配置管理
   - `src/config/app.ts`: AI_CONFIG, CHAT_CONFIG, FEATURES
   - `src/config/paths.ts`: 路径常量
   - `src/config/i18n.ts`: i18n 配置（已准备但未启用）

3. ✅ 错误处理与日志系统
   - `src/lib/errors.ts`: ErrorCode enum, AppError class
   - `src/lib/logger.ts`: 结构化日志（开发/生产环境自适应）

4. ✅ 代码质量工具
   - Prettier 3.8.2 + prettier-plugin-tailwindcss 0.7.2
   - ESLint 9 + eslint-config-prettier + eslint-plugin-prettier
   - 严格的 Tailwind CSS 规范（禁止任意值警告）

5. ✅ CI/CD 流程
   - GitHub Actions workflows (ci.yml, deploy.yml)
   - Dependabot 自动依赖更新
   - PR template 和文档

6. ✅ i18n 前期准备（未启用）
   - `src/locales/zh-CN.ts`: 中文翻译文件
   - `src/locales/en-US.ts`: 英文翻译文件
   - `src/lib/i18n.ts`: 类型安全的翻译工具函数
   - 为将来集成 next-intl 做好准备

7. ✅ i18n 完整集成（已启用）
   - 安装并配置 **next-intl 4.9.1**
   - 重构 app 目录为 `[locale]` 路由结构
   - `src/proxy.ts`: 自动语言检测和重定向（Next.js 16+）
   - `src/i18n/request.ts`: next-intl 请求配置
   - `src/components/language-switcher.tsx`: 语言切换组件
   - 支持中英文切换，URL 格式：`/zh-CN/...` 或 `/en-US/...`
   - 详见 `docs/i18n-guide.md`

8. ✅ 文档完善
   - `docs/conventions.md`: 代码规范（新增 Tailwind 和 i18n 约定）
   - `docs/capability-mapping.md`: 功能覆盖对照表
   - `docs/architecture-optimization.md`: 架构优化记录
   - `SETUP.md`: CI/CD 设置指南

**实际收益**:

- 所有配置集中管理，易于维护和测试
- 类型安全的环境变量，避免运行时错误
- 结构化日志和错误处理，便于问题追踪
- 自动化 CI/CD，确保代码质量
- i18n 基础设施就绪，将来启用只需配置路由
- 严格的代码标准，避免技术债务积累

## Phase 2: Memory

目标：支持短期记忆与历史会话。

推荐接入点：

- `features/chat`: 左侧会话列表、会话切换
- `server/storage`: 历史消息读写
- `server/ai/memory`: memory 组装逻辑

建议先做：

1. 会话 ID
2. 历史消息持久化
3. 最近上下文回放
4. 简单摘要压缩

## Phase 3: RAG

目标：让 agent 能基于外部知识源回答问题。

推荐接入点：

- `server/ai/rag`
- `server/storage`
- `features/chat` 中的来源展示

建议先做：

1. 文档切片
2. 向量检索
3. retrieval 注入 prompt
4. sources UI

## Phase 4: Planning

目标：支持多步骤任务拆解和执行。

推荐接入点：

- `server/ai/planners`
- `server/ai/tools`
- `features/chat` 中的计划展示

建议先做：

1. plan schema
2. 计划生成
3. 步骤执行
4. 执行状态回传 UI

## Phase 5: Multi-Agent

目标：支持多个 specialized agents 协作。

推荐接入点：

- `server/ai/agents`
- `server/ai/prompts`
- `features/chat` 的 agent 状态与结果展示

建议先做：

1. 主 agent / worker agent 分层
2. agent handoff 协议
3. 中间结果展示
4. 安全与失败回退

## Phase 6: Production Readiness

目标：让应用具备长期维护能力。

建议动作：

1. env 校验
2. 日志与 tracing
3. 限流与错误分级
4. 权限与审计
5. 测试与 CI

## Current Recommendation

如果你接下来要继续跟着 `docs/ai-agents-for-beginners/` 实现功能，建议先做这三件事：

1. 拆工具文件
2. 抽 prompts
3. 增加共享 types

这是当前投入最小、后续收益最大的整理。
