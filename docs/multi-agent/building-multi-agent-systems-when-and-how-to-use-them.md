# Building Multi-Agent Systems: When and How to Use Them

Source:

- Claude Blog, “Building multi-agent systems: When and how to use them”
- https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them

## Why this matters

这篇文章的主结论非常直接：

- 先从单 agent 开始
- 只有在单 agent 碰到明确结构性限制时，再上多代理
- 多代理不是默认更强，而是默认更贵、更复杂、更容易丢上下文

文章明确给出一个现实判断：

- 很多团队花几个月做复杂 multi-agent，最后发现更好的单 agent prompt 就够了
- 在 Anthropic 的观察里，多代理通常会多消耗 `3x-10x` token

来源：Claude 博文，文中关于 coordination overhead 和 token 成本的讨论。

## Start with a single agent

这篇文章最重要的建议，是把“单 agent 优先”当成默认策略。

原因：

- 每增加一个 agent，就多一个潜在故障点
- 多一份 prompt 维护成本
- 多一次 handoff
- 多一次上下文摘要
- 多一层不可预测行为

所以文章建议：

- 不要因为“系统看起来更高级”就引入多代理
- 只有当它能解决单 agent 明确无法克服的问题，才值得

## Three cases where multi-agent consistently helps

文章说，多代理持续有效的场景主要只有 3 类。

### 1. Context protection

当单 agent 因为上下文污染而退化时，多代理很有价值。

典型信号：

- 某个子任务会生成大量上下文
- 其中大多数内容对主任务后续推理并不重要
- 主 agent 只需要这个子任务的少量提炼结果

典型例子：

- lookup / retrieval
- 文档过滤
- 外部资料读取后提炼摘要

文章强调，这类子任务如果会带来 `1000+` token 且大部分内容无关，就很适合隔离到 subagent。

### 2. Parallelization

当任务可以拆成彼此独立的多个 facet，同时研究时，多代理能显著提升覆盖面。

典型场景：

- research
- search
- 多方向调查
- 多组件独立验证

但文章也强调：

- 并行的主要收益是**thoroughness**
- 不是简单的“更快”

因为虽然 wall-clock 可能缩短，但总计算量通常会上升。

### 3. Specialization

当单 agent 需要面对过多工具、冲突的系统提示词、或过重的领域上下文时，多代理有帮助。

文章把 specialization 拆成 3 种：

- tool set specialization
- system prompt specialization
- domain expertise specialization

特别有用的信号：

- 工具数量太多，常见阈值在 `15-20+`
- 工具跨多个不相干领域，模型容易混淆
- 新加工具后，旧任务表现开始退化

## Signals that you have outgrown a single agent

文章给了几个非常实用的判断信号：

- 上下文越来越接近极限，性能明显退化
- 工具太多，模型在理解和选择工具上开始浪费注意力
- 任务可以自然拆成独立并行片段

但它也提醒：

- 这些阈值会随着模型提升而变化
- 所以它们是实践性指导，不是硬规则

还有一个很关键的提醒：

- 如果问题只是“工具太多”，先考虑按需发现工具，而不是立刻上多代理

这个提醒对本仓库也有价值，因为我们已经有 `MCP / Search / Sandbox / RAG` 等多能力入口。

## Context-centric decomposition

这篇文章最有价值的设计原则，是：

**按上下文边界拆，不要按工作类型拆。**

作者把它叫做：

- `problem-centric decomposition`
- `context-centric decomposition`

### Problem-centric decomposition

不推荐的拆法：

- 一个 agent 负责 planning
- 一个 agent 负责 implementation
- 一个 agent 负责 testing
- 一个 agent 负责 review

为什么常常失败：

- handoff 太多
- 每次交接都在玩“传话游戏”
- 子 agent 缺乏之前决策的真实上下文
- 最后 coordination token 比实际工作 token 还多

### Context-centric decomposition

更推荐的拆法：

- 哪些工作天然共享上下文，就放在同一个 agent 里
- 只有当上下文能真正隔离时，才拆出去

文章给出的有效边界包括：

- 独立 research path
- 接口清晰、可并行的组件
- blackbox verification

文章给出的低效边界包括：

- 同一份工作的顺序阶段
- 强耦合组件
- 需要高频共享状态的工作

这点对本仓库尤其重要：

- 不要机械地把 `planning / coding / testing / review` 全拆成长期固定角色链
- 真正该拆的是上下文可以独立、且拆了能降低污染的那部分

## The verification subagent pattern

文章认为最稳定、最通用的多代理模式之一，是：

- 主 agent 做主要工作
- verifier subagent 专门验证

为什么这个模式稳定：

- verification 天生就是 blackbox
- verifier 不需要完整实现上下文
- 所以 handoff 成本低
- 同时又能形成明确质量闸口

典型应用：

- test suite
- lint
- schema validation
- compliance check
- factual verification

### The early victory problem

文章特别强调 verifier 的常见失败模式：

- 太早宣布通过

比如：

- 只跑了 1-2 个测试
- 没覆盖边界 case
- 没做 negative tests
- 看到部分成功就提前结束

作者给的应对策略非常务实：

- 验证标准必须具体
- 明确要求 full suite
- 明确要求 edge case
- 明确要求 negative tests
- 明确要求“不要只跑几个测试就标记通过”

这点对本仓库未来的 `critic_agent / verifier_agent` 很有参考价值。

## What this means for this repo

对当前仓库，这篇文章给出的最重要建议有 4 条。

### 1. 继续把 single-agent 作为默认

虽然现在已经开始做 `subagent`，但主路径仍应保持：

- 单 agent 优先
- subagent 只在明确需要时委派

不要让主链路默认就走多代理。

### 2. 当前最适合的收益点是 context protection + specialization

对本仓库现状，多代理最可能带来价值的不是“全链路复杂协作”，而是：

- 用 subagent 隔离 context-heavy 子任务
- 用 subagent 做 specialist tool selection

例如：

- `web_agent`
- `rag_agent`
- `code_agent`

这正好和当前已内建的 subagent 方向一致。

### 3. 不要把角色链硬编码成 problem-centric pipeline

像：

- `planning -> tool_router -> code/rag/web -> critic`

这条链可以作为默认心智模型，但不应过早做成固定强编排。

原因：

- 它天然按“工作类型”切
- 很容易走到 problem-centric decomposition 的老路
- 如果每一跳都 handoff，协调成本会迅速上升

更稳的方式是：

- 主 agent 只在真正需要时委派某一个 specialist
- verification 独立做为黑盒检查点
- 不要把整条链强制串起来

### 4. `critic_agent` 比 `planning_agent` 更容易先做出真实收益

原因：

- critic / verifier 更接近 blackbox verification
- handoff 成本更低
- 成功标准更容易明确

所以如果后面继续做 runtime，优先顺序更合理的是：

1. specialist delegation
2. verification / critic subagent
3. 再考虑更强的 planner / router

## Recommended path for this repo

### Now

继续保持现在这条克制路线：

1. subagent 默认关闭
2. 只有启用后才进入 runtime
3. 先做 bounded delegation
4. 不上长期 team
5. 不上 message bus
6. 不做共享状态协作

### Next

如果继续推进，最值得先做的是：

1. `delegate_to_subagent` 的结果展示
2. `toModelOutput` 式摘要压缩
3. 基础 subagent telemetry
4. `critic_agent` / verifier checkpoint

### Later

只有在出现这些信号时，再升级架构：

- 同类 specialist 需要跨多轮保持上下文
  - 再考虑 `Agent Teams`
- orchestration 本身变成瓶颈
  - 再考虑更复杂 coordination pattern
- agent 之间真的需要共享持续演化的知识
  - 再考虑 `Shared State`

## Bottom line

这篇文章最重要的结论可以压成三句话：

- 默认先用单 agent
- 上多代理时，优先按上下文边界拆，而不是按工作类型拆
- 最稳定、最容易先做出收益的模式，是隔离上下文和 blackbox verification

对本仓库当前阶段，这个判断是成立的。
