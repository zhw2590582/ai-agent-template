# Harness Engineering

这份短文档记录 `Your AI Isn't "Stupid" — It Just Needs a Better Harness` 对本仓库最有价值的结论。

原文：

- Lychee Technology Engineering Blog:
  `Your AI Isn't "Stupid" — It Just Needs a Better Harness`
  https://blog.ltbase.dev/posts/agents/harness-engineering

## 一句话

这篇文章的核心观点是：agent 失败通常不是模型太弱，而是 harness 不完整。

对本仓库来说，这篇文章的价值不是带来新的架构方向，而是进一步确认：

- 当前继续做 `agent-runtime`
- 收紧 tool / subagent contract
- 补局部恢复和验证

这条路线是对的。

## 四个原则

文章把好的 harness 收敛成 4 条原则：

1. Constrain, don't instruct
   能用程序约束的地方，不要只靠 prompt 祈祷
2. Externalize state
   重要状态不能只活在上下文窗口里
3. Make every step verifiable
   每一步都要能被规则、工具或独立检查器验证
4. Fail locally, not globally
   单步失败只重试该步，不要整轮任务一起炸掉

对本仓库最直接的启发是：

- `delegate_to_subagent` 的输入输出应该继续走更明确的结构化 contract
- tool / subagent 失败时应优先做局部重试或局部 fallback
- 长会话和长任务不能只靠 prompt 和上下文压缩硬撑

## 7 层 Harness Stack

文章提出一个 7 层 stack：

1. Cognition
2. Tools
3. Contracts & Interfaces
4. Orchestration
5. Memory & State
6. Evaluation & Observation
7. Constraints & Recovery

映射到本仓库，当前大致是：

- `Cognition`
  - `build-agent-input.ts`
  - `src/features/chat/ai/core/prompts.ts`
- `Tools`
  - `build-agent-toolset.ts`
  - `src/features/search/`
  - `src/features/sandbox/`
  - `src/features/mcp/`
- `Contracts & Interfaces`
  - `schemas.ts`
  - tool input / output schema
  - subagent output contract
- `Orchestration`
  - `execute-agent-run.ts`
  - `create-agent-run-response.ts`
  - `delegate_to_subagent.ts`
- `Memory & State`
  - 会话摘要
  - 长期记忆
  - `run-metadata`
  - `workspace-session`
- `Evaluation & Observation`
  - `run-telemetry`
  - tool / subagent 日志
- `Constraints & Recovery`
  - 当前最弱
  - 还缺更明确的局部 retry / fallback / idempotent step 处理

## 对当前仓库最有帮助的点

### 1. 继续把主模型放在 harness 里面，而不是让它直接碰外部世界

这和我们现在的方向一致：

- 模型不直接碰外部能力
- 先经过 `agent-runtime`
- 再经过 tools / workspace / finish / telemetry

### 2. `Contracts & Interfaces` 比继续加更多 agent 更重要

这篇文章反复强调 contract 是最容易被跳过、但最容易导致生产事故的一层。

对本仓库来说，这意味着比“继续加更多 subagent”更值的事情通常是：

- 收紧 tool input / output schema
- 收紧 subagent summary contract
- 明确 tool access 和 capability boundary

### 3. 下一阶段应优先补“局部恢复”，而不是继续加 prompt

当前本仓库已经有：

- `agent-runtime`
- tool orchestration
- subagent delegation
- 基础 telemetry

但还缺更系统的：

- step-level retry
- fallback strategy
- idempotent recovery

这篇文章的判断很适合直接作为优先级依据。

## 这篇文章提醒的几个陷阱

### 1. Context Anxiety

当上下文越来越满时，模型会更容易跳步、草率结束或输出质量下降。

这对本仓库意味着：

- 不能把“会话摘要压缩”当成万能解
- 如果未来进入长任务 / durable run，可能需要真正的 context reset + state reload

### 2. Self-Grading Illusion

生成者自己给自己打分通常不可靠。

对本仓库来说，这解释了为什么：

- `critic_agent` 比继续加更多 planner 更值得做
- evaluator / critic 最好保持更独立的上下文和职责

### 3. Emotional Feedback Makes Things Worse

反馈给模型的错误应该客观、结构化，而不是情绪化。

这和本仓库现在的方向一致：

- 错误要尽量转成稳定的结构化信息
- 不把“你错了”“完全不对”这类情绪化文本塞回模型

### 4. Memory Consolidation Is Ongoing Work

长时间运行后，memory/state 会膨胀、重复、冲突。

对本仓库来说，这和当前 `Memory V1` 的后续方向一致：

- 继续做 consolidation
- 去重和冲突解决
- 保持长期记忆可读、可压缩

## 对当前阶段的结论

这篇文章不会改变我们当前路线。

它只是更明确地说明：

- 现在最值得补的是 `contract / evaluation / recovery`
- 不是继续堆更多 agent 角色
- 也不是急着把系统扩成重型 DAG / state machine

一句话：

当前仓库已经进入 `harness engineering` 的正确方向，但还处在 V1 阶段；下一步应优先把这层做稳，而不是继续扩花样。
