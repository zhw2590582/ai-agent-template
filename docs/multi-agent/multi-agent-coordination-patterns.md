# Multi-Agent Coordination Patterns

Source:

- Claude Blog, “Multi-agent coordination patterns: Five approaches and when to use them”
- https://claude.com/blog/multi-agent-coordination-patterns

## Why this matters

这篇文章的核心观点不是“多代理越复杂越好”，而是：

- 先选**最简单且足够**的协调模式
- 观察它具体卡在哪里
- 再往更复杂的模式演进

文章把多代理协调模式拆成 5 类，并强调选型应该围绕：

- 任务能否清晰拆解
- 子任务是否彼此独立
- worker 是否需要跨多轮保留上下文
- 工作流是固定顺序还是事件驱动
- agent 之间是否需要直接共享发现

## Five Patterns

### 1. Generator-Verifier

一个 agent 先生成结果，另一个 agent 负责验证；如果不通过，再把反馈返回给生成方继续修改。

适合：

- 输出质量要求很高
- 验收标准可以明确写出来
- 额外一轮生成成本低于错误输出成本

典型场景：

- 代码生成 + 测试验证
- 事实核查
- 合规检查
- rubric 评分

主要风险：

- verifier 标准不明确时，容易“假验证”
- 生成和验证如果本质上是同一种难题，verifier 不一定真能兜住
- 需要明确最大迭代次数和失败 fallback，否则容易振荡

### 2. Orchestrator-Subagent

一个主 agent 负责拆解任务、委派子任务、汇总结果。subagent 各自处理独立职责并返回结果。

适合：

- 任务拆解清晰
- 子任务边界明确
- 子任务之间依赖很少
- 需要保持主 agent 上下文聚焦

文章明确建议：

- 大多数场景先从这个模式开始
- 它覆盖面最广，协调成本最低

主要风险：

- orchestrator 会变成信息瓶颈
- subagent 之间的相关发现必须绕主 agent 转发，细节容易在转述中丢失
- 如果不做并行，吞吐也会受限

### 3. Agent Teams

一个 coordinator 管理一组长期存活的 worker。worker 不再是“一次性子调用”，而是跨多轮持续工作、积累上下文。

适合：

- 子任务彼此独立
- 每个 worker 需要长期保留领域上下文
- 任务本身是长时、多步、可并行的

典型场景：

- 大型代码库迁移
- 多服务并行改造

主要风险：

- 一旦子任务不独立，冲突和上下文不一致会很明显
- 完成检测更难
- 共享资源下需要额外的分片和冲突解决机制

### 4. Message Bus

agent 通过 publish / subscribe 协作，由 router 或消息层做事件分发。

适合：

- 工作流由事件推动，而不是固定顺序
- agent 类型会持续增长
- 希望新 agent 接入时不用重写已有连接

典型场景：

- 安全告警处理
- 事件驱动自动化流水线

主要风险：

- tracing 和调试复杂度显著提高
- router 一旦错分或漏分，系统可能“静默失败”
- LLM router 本身也会带来新的失败模式

### 5. Shared State

agent 不再通过中心协调器传递信息，而是直接读写共享状态，如数据库、文件系统、文档或共享知识库。

适合：

- agent 的发现需要彼此即时可见
- 多个 agent 在共同构建一个不断演化的知识空间
- 需要降低中心协调器单点故障风险

典型场景：

- 多源研究综合
- 协同知识构建

主要风险：

- 重复工作
- 相互矛盾的行动
- reactive loop

文章特别强调：

- 共享状态系统必须一开始就设计 termination condition
- 例如时间预算、收敛阈值、或专门的终止判断 agent

## How to choose

文章给出的选择逻辑可以压缩成这几条：

- 如果重点是**输出质量验证**，优先 `Generator-Verifier`
- 如果重点是**清晰任务拆解**，优先 `Orchestrator-Subagent`
- 如果重点是**独立长任务并行**，优先 `Agent Teams`
- 如果重点是**事件驱动流水线**，优先 `Message Bus`
- 如果重点是**共享发现、协同研究**，优先 `Shared State`

更细一点：

- `Orchestrator-Subagent` vs `Agent Teams`
  - 看 worker 是否需要跨调用保留上下文
- `Orchestrator-Subagent` vs `Message Bus`
  - 看流程是固定顺序还是事件驱动
- `Agent Teams` vs `Shared State`
  - 看 worker 是否需要实时消费彼此发现
- `Message Bus` vs `Shared State`
  - 看系统是在传递离散事件，还是累积共享知识

## What this means for this repo

对当前仓库，最重要的结论是：

- 现在应该采用 `Orchestrator-Subagent`
- 不要直接跳到 `Agent Teams`
- 也不要直接上 `Message Bus` 或 `Shared State`

原因：

- 当前项目刚有了 subagent settings、最小 delegation tool、和 `agent-runtime`
- 还没有 durable run、真正的长期 worker 生命周期、事件总线、共享知识协作层
- 现在最值钱的是把“主 agent 委派短而清晰的子任务”先做稳

换句话说：

- `planning_agent -> tool_router_agent -> specialist -> critic_agent`
  目前更适合实现成**主 agent 可调用的一组 bounded subagents**
- 不要把这些角色立刻提升为长期存活的 autonomous team

## Recommended path for this repo

### Now

继续沿 `Orchestrator-Subagent` 打磨：

1. 让主 agent 更稳定地决定何时委派
2. 让 subagent 输出固定包含最终摘要
3. 增加更清楚的 subagent tool 输出展示
4. 视情况加入 `toModelOutput`，让主 agent 只吃压缩摘要
5. 对 delegation 增加基础 telemetry

### Later

只有出现下面信号，再考虑升级模式：

- 同一 specialist 需要跨多次调用持续积累上下文
  - 再考虑 `Agent Teams`
- 工作流越来越事件化、路由规则爆炸
  - 再考虑 `Message Bus`
- 多个 agent 需要实时消费彼此发现
  - 再考虑 `Shared State`
- 最终输出质量成为主要风险
  - 补 `Generator-Verifier`

## Bottom line

这篇文章最值得记住的一句话可以压缩成：

- 不要按“听起来高级”选多代理模式
- 先从 `Orchestrator-Subagent` 起步
- 等它因为真实结构性问题卡住，再升级到更复杂模式

对本项目当前阶段，这个建议是成立的。
