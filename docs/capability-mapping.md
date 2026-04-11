# Capability Mapping

本文档记录当前项目架构与 `ai-agents-for-beginners` 教程内容的对应关系，帮助评估实现难度和接入路径。

## 功能覆盖对照表

| 功能模块                | 教程章节 | 当前状态      | 扩展难度 | 预计工期 | 接入点                                    |
| ----------------------- | -------- | ------------- | -------- | -------- | ----------------------------------------- |
| **Tool Use**            | 第 4 章  | ✅ 已实现     | -        | -        | `server/ai/tools/`                        |
| **Memory**              | 第 13 章 | ⏳ 类型已预留 | 🟢 较低  | 1-2 周   | `server/ai/memory/`                       |
| **Agentic RAG**         | 第 5 章  | ⏳ 类型已预留 | 🟡 中等  | 2-3 周   | `server/ai/rag/`                          |
| **Context Engineering** | 第 12 章 | ⏳ 部分具备   | 🟢 较低  | 1 周     | `server/ai/prompts.ts` + context pipeline |
| **Planning**            | 第 7 章  | ⏳ 类型已预留 | 🟡 中等  | 2-3 周   | `server/ai/planners/`                     |
| **Metacognition**       | 第 9 章  | ⚪ 未准备     | 🟡 中等  | 1-2 周   | `server/ai/tools/` (fallback)             |
| **Multi-Agent**         | 第 8 章  | ⏳ 类型已预留 | 🔴 较高  | 3-4 周   | `server/ai/agents/`                       |
| **Observability**       | 第 10 章 | ⚪ 未准备     | 🟡 中等  | 2-3 周   | middleware + logging                      |
| **Evaluation**          | 第 10 章 | ⚪ 未准备     | 🟡 中等  | 1-2 周   | `server/ai/evaluation/`                   |
| **Trustworthy AI**      | 第 6 章  | ⚪ 未准备     | 🟡 中等  | 2-3 周   | validation + approval flow                |
| **Agentic Protocols**   | 第 11 章 | ⚪ 未准备     | 🔴 较高  | 3-4 周   | 协议层设计                                |

### 状态说明

- ✅ **已实现**: 功能已完整实现并投入使用
- ⏳ **类型已预留**: 在 `server/types.ts` 中已定义相关类型接口，为实现做好准备
- ⚪ **未准备**: 尚未开始设计或预留接口

### 难度说明

- 🟢 **较低**: 1-2 周可完成，对现有架构改动小
- 🟡 **中等**: 2-3 周可完成，需要新增模块但不破坏现有结构
- 🔴 **较高**: 3-4 周以上，需要系统性设计和大量新代码

## 已准备的类型基础

当前 `src/server/types.ts` 已为以下功能预留类型：

### Memory 相关

```typescript
✅ ConversationMetadata  // 会话元数据
✅ BaseMessage            // 基础消息类型
✅ MessageRole            // 消息角色
```

### RAG 相关

```typescript
✅ DocumentChunk          // 文档片段
```

### Planning 相关

```typescript
✅ TaskStep               // 任务步骤
✅ TaskPlan               // 任务计划
```

### Multi-Agent 相关

```typescript
✅ AgentConfig            // Agent 配置
✅ AgentContext           // Agent 执行上下文
```

### 工具相关

```typescript
✅ ToolResult<T>          // 统一工具返回格式
```

## 详细实现路径

### 🟢 Phase 2A: Memory（1-2 周）

**目标**: 支持会话历史和用户偏好记忆

**技术栈建议**:

- 持久化: PostgreSQL / Supabase
- 会话管理: 基于 `ConversationMetadata`
- 上下文召回: 滑动窗口 + 摘要压缩

**实现步骤**:

1. 创建 `server/storage/` 目录
   - `conversations.ts`: 会话 CRUD
   - `messages.ts`: 消息持久化

2. 创建 `server/ai/memory/` 目录
   - `context-builder.ts`: 上下文组装
   - `compression.ts`: 历史压缩策略

3. 更新 `features/chat/`
   - 左侧会话列表组件
   - 会话切换逻辑

**关键决策**:

- 选择哪种数据库？建议 Supabase（已有 postgres best practices skill）
- 压缩策略：最近 N 条 + 摘要，还是 token 限制？
- 持久化粒度：每条消息，还是每轮对话？

### 🟡 Phase 2B: Simple RAG（2-3 周）

**目标**: 基于外部知识库回答问题

**技术栈建议**:

- 向量存储: Supabase pgvector / Pinecone / Weaviate
- 嵌入模型: OpenAI `text-embedding-3-small` 或 DeepSeek Embedding
- 文档处理: LangChain Document Loaders（可选）

**实现步骤**:

1. 创建 `server/ai/rag/` 目录
   - `chunker.ts`: 文档切片逻辑
   - `embedder.ts`: 向量化
   - `retriever.ts`: 检索逻辑

2. 注册为工具
   - `server/ai/tools/retrieval.ts`: 检索工具

3. UI 展示
   - `features/chat/components/source-card.tsx`: 来源展示

**关键决策**:

- 切片策略：固定长度、语义分割、还是混合？
- 检索方式：纯向量、混合检索（向量+关键词）？
- 何时触发检索：工具调用，还是 prompt 层嵌入？

### 🟡 Phase 3: Planning（2-3 周）

**目标**: 支持多步骤任务规划和执行

**技术栈建议**:

- Structured Output: AI SDK 的 `generateObject`
- 状态管理: 基于 `TaskPlan` 和 `TaskStep`

**实现步骤**:

1. 创建 `server/ai/planners/` 目录
   - `task-planner.ts`: 任务拆解逻辑
   - `executor.ts`: 步骤执行器
   - `schemas.ts`: Zod schemas for structured output

2. 更新工具系统
   - 支持工具组合调用
   - 步骤依赖管理

3. UI 展示
   - `features/chat/components/task-plan-view.tsx`: 计划展示
   - 步骤执行进度

**关键决策**:

- 规划粒度：粗粒度（3-5 步）还是细粒度（10+ 步）？
- 失败处理：重试、跳过、还是整体回退？
- 人工介入：哪些步骤需要审批？

### 🟢 Phase 4: Context Engineering（1 周）

**目标**: 动态管理上下文，避免信息过载或遗漏

**实现步骤**:

1. 扩展 `server/ai/prompts.ts`
   - 场景化 prompt 模板
   - 角色切换支持

2. 创建 context pipeline
   - `server/ai/context/builder.ts`: 上下文组装器
   - `server/ai/context/compressor.ts`: 压缩策略

3. 实现策略
   - Scratchpad: 临时工作区
   - Token budgeting: 预算管理
   - Priority ranking: 信息优先级

**关键决策**:

- 压缩触发时机：超过多少 tokens？
- 保留策略：最新 N 条、最相关 M 条、还是混合？

### 🟡 Phase 5: Metacognition（1-2 周）

**目标**: Agent 能够自我评估和纠错

**实现步骤**:

1. 工具层 Fallback
   - `server/ai/tools/*/fallback.ts`: 备份工具
   - 错误识别和策略切换

2. Evaluator Agent
   - `server/ai/evaluation/self-evaluator.ts`
   - 结果质量评分

3. 自我修正逻辑
   - Retry with reflection
   - 策略调整

**关键决策**:

- 评估标准：准确性、完整性、还是用户满意度？
- 重试次数限制？
- 何时放弃并请求人工介入？

### 🔴 Phase 6: Multi-Agent（3-4 周）

**目标**: 多个专业 agent 协作完成任务

**技术栈建议**:

- Agent 通信: 自定义协议或 LangGraph
- 状态管理: 集中式 coordinator

**实现步骤**:

1. 创建 `server/ai/agents/` 目录
   - `coordinator.ts`: 主控 agent
   - `worker-agents/`: 专业 agents
   - `protocol.ts`: 通信协议

2. Agent 注册系统
   - 基于 `AgentConfig`
   - 动态 agent 加载

3. UI 展示
   - Agent 协作可视化
   - 中间结果展示

**关键决策**:

- 通信模式：消息队列、直接调用、还是事件驱动？
- 失败隔离：某个 agent 失败时如何处理？
- 成本控制：如何避免 agent 无限循环？

### 🟡 Phase 7: Observability（2-3 周）

**目标**: 生产环境可观测性

**技术栈建议**:

- Tracing: OpenTelemetry
- Logging: Pino / Winston
- Metrics: Prometheus / Datadog

**实现步骤**:

1. 添加 middleware
   - `server/middleware/tracing.ts`
   - `server/middleware/logging.ts`

2. Instrumentation
   - 工具调用埋点
   - 模型调用时长
   - Token 消耗统计

3. Dashboard
   - Grafana / Datadog 集成

**关键决策**:

- 日志级别和采样率？
- PII 数据如何脱敏？
- 告警阈值设置？

## 架构优势分析

### 1. 类型系统先行

✅ **优势**: 所有高级功能的类型契约已定义，减少后续重构成本

示例：

```typescript
// server/types.ts 中已定义
interface TaskPlan {
  id: string;
  goal: string;
  steps: TaskStep[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}
```

实现 planning 时，只需：

```typescript
// server/ai/planners/task-planner.ts
import { TaskPlan } from '@/server/types';

export async function createTaskPlan(goal: string): Promise<TaskPlan> {
  // 实现逻辑
}
```

### 2. 分层清晰

✅ **优势**: 扩展点明确，不会"不知道该往哪里加代码"

```
server/
├── ai/               # AI 核心能力
│   ├── models.ts     ✅ 独立
│   ├── prompts.ts    ✅ 独立
│   ├── tools/        ✅ 已实现
│   ├── memory/       🔜 Phase 2
│   ├── rag/          🔜 Phase 3
│   ├── planners/     🔜 Phase 4
│   └── agents/       🔜 Phase 5
├── storage/          🔜 持久化层
├── types.ts          ✅ 类型定义
└── chat.ts           ✅ Handler
```

### 3. 依赖克制

✅ **优势**: 使用 AI SDK 这种底层工具，保留足够灵活性

可以自由实现：

- Custom agent loops
- 自定义 tool calling 逻辑
- 状态管理策略
- 通信协议

而不被重框架限制。

### 4. UI 组件复用

✅ **优势**: AI Elements 提供了 agent 场景的原生组件

已有：

- `Message` 组件
- `Tool` 组件
- 流式渲染

后续可扩展：

- `TaskPlan` 组件
- `AgentStatus` 组件
- `SourceCard` 组件

## 潜在挑战与应对策略

### Challenge 1: 状态管理复杂度

**问题**: Planning、Multi-Agent 需要复杂的状态跟踪

**应对**:

- Phase 3 引入轻量状态机（如 XState）
- 集中式状态存储（Redis / in-memory）
- 清晰的状态转换日志

### Challenge 2: Token 成本控制

**问题**: 多轮对话、多 agent 容易导致成本爆炸

**应对**:

- 实现 context 压缩（Phase 4）
- 缓存机制（相同问题复用结果）
- 预算控制（设置 token 上限）
- 使用更便宜的模型做规划，昂贵模型做执行

### Challenge 3: 测试和质量保证

**问题**: LLM 输出非确定性，难以传统测试

**应对**:

- LLM-as-judge 评估（Phase 7）
- Golden dataset 回归测试
- 分层测试：工具层确定性测试 + agent 层模糊测试
- 人工抽样审核

### Challenge 4: 可观测性门槛

**问题**: 多 agent、多步骤调试困难

**应对**:

- 尽早引入 structured logging
- 每个 agent 调用都有 trace ID
- 可视化工具（Langfuse / LangSmith）

## 推荐学习路径

如果你是按教程学习，建议顺序：

1. **第 4 章 Tool Use** ✅ 已完成
   - 当前已实现 3 个工具
   - 可以再添加 2-3 个工具练手

2. **第 13 章 Memory** → Phase 2A
   - 投入产出比高
   - 用户体验提升明显
   - 为后续功能打基础

3. **第 12 章 Context Engineering** → Phase 4
   - 与 Memory 配合
   - 解决上下文管理问题

4. **第 5 章 Agentic RAG** → Phase 2B
   - 有了 Memory 后更容易理解
   - 知识库是高价值功能

5. **第 7 章 Planning** → Phase 3
   - 在有 Memory + RAG 的基础上
   - 规划的价值更明显

6. **第 9 章 Metacognition** → Phase 5
   - 提升系统鲁棒性
   - 与 Planning 配合更好

7. **第 8 章 Multi-Agent** → Phase 6
   - 复杂度最高
   - 建议有明确业务需求时再做

8. **第 10 章 Production** → Phase 7
   - 持续性工作
   - 从 Phase 2 开始就可以逐步引入

## 总结

当前项目架构已为 `ai-agents-for-beginners` 中的大部分功能做好准备：

✅ **类型基础**: 完整  
✅ **分层设计**: 清晰  
✅ **扩展边界**: 明确  
✅ **技术选型**: 灵活

建议按 Roadmap 顺序渐进实现，每个 Phase 完成后都部署测试，避免"大爆炸式集成"。

**下一步建议**: 启动 Phase 2A (Memory)，预计 1-2 周完成。
