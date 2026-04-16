# AI SDK Subagents

Source:

- AI SDK Docs, `Subagents`
- https://ai-sdk.dev/docs/agents/subagents

## Why this matters

这篇文档对当前仓库是**直接有用**的，不是纯理论参考。

原因很简单：

- 我们当前已经选择先沿 `Orchestrator-Subagent` 方向推进
- 现在的实现核心就是一个 `delegate_to_subagent` tool
- AI SDK 这篇文档正好覆盖了这条链最关键的 3 件事：
  - subagent 应该如何被主 agent 调用
  - 流式子代理进度应该如何展示
  - `toModelOutput` 应该如何压缩子代理结果，避免污染主上下文

换句话说，这篇文档不是在告诉我们“要不要做 subagents”，而是在告诉我们：

- 既然已经做了，就应该怎样做得更稳

## Core model

文档对 subagent 的定义很直接：

- 先定义一个拥有自己 `model / instructions / tools` 的子代理
- 再把这个子代理包进一个 tool
- 主 agent 通过这个 tool 进行委派

核心不是“多一个 prompt 配置”，而是：

- **subagent 是被主 agent 调用的独立 agent run**

这点和我们当前实现是对齐的：

- 主 agent 仍然是总控
- `delegate_to_subagent` 是委派入口
- subagent 运行后把结果交回主 agent

## When subagents help

文档强调，subagents 会增加延迟和复杂度，所以只在下面几类场景才值得：

1. 上下文很重
   - 某个子任务会吞掉大量 token
   - 主 agent 只需要最终摘要

2. 子任务可以独立运行
   - 例如研究、检索、代码阅读、外部资料调查

3. 需要做能力隔离
   - 不同子代理拥有不同工具集或不同 system prompt

反过来说，如果任务本来就简单、集中、顺序明确，那就不值得拆成 subagent。

这和当前仓库的判断一致：

- 不把 subagent 当默认路径
- 只在主 agent 明显需要 specialist 时才委派

## Streaming subagent progress

这篇文档里最有价值的实践点，是：

- subagent tool 不一定要等整个子代理跑完后再一次性返回
- 它可以写成 `async function*`
- 使用 `subagent.stream(...)`
- 再用 `readUIMessageStream(...)` 把子代理的 UI 消息逐步向上 `yield`

这样：

- 用户可以看到子代理的完整执行过程
- 主 agent 不必等到“黑盒运行结束”才更新 UI

文档明确建议在 UI 里结合两个信号判断状态：

- `part.state`
- `part.preliminary`

最实用的区分是：

- `output-available + preliminary = true`
  - 说明子代理还在执行中，当前只是中间结果
- `output-available + preliminary != true`
  - 说明是最终完成结果

这对我们当前仓库非常关键，因为之前最明显的体验问题就是：

- `delegate_to_subagent` 看起来像“卡住”
- 实际上只是子代理在后台跑，但前端看不到过程

## Controlling what the main model sees

这篇文档另一个核心点是：

- **用户看到的内容**
- **主 agent 的模型真正吃到的内容**

不必是同一份。

AI SDK 推荐使用 `toModelOutput`：

- UI 里可以保留子代理的完整执行过程
- 主 agent 只吃一个压缩后的 summary

这正是 subagent 真正有价值的地方：

- 子代理可以探索很多内容
- 但主 agent 不需要把全部上下文重新吞一遍

如果不做这层压缩，多代理很容易退化成：

- 只是把上下文从一个窗口搬到另一个窗口

对当前仓库的直接结论是：

- `delegate_to_subagent` 必须保留 `toModelOutput`
- 主 agent 继续只吃 summary
- UI 层再单独负责展示更完整的 subagent 过程

## Write instructions for summarization

文档还特别提醒了一点：

- 如果希望 `toModelOutput` 能提取到有用 summary
- subagent 的系统提示词里必须明确要求“最终给出清晰总结”

否则子代理很可能只输出：

- `Done`
- `Finished`
- 或者一段不适合主 agent 消费的零碎内容

这对当前仓库也很有价值，因为我们已经有一组内建 subagents。

所以内建 subagent 的 system prompt 里，应该继续坚持：

- 角色边界清晰
- 最终输出 contract 清晰
- 明确要求交回主 agent 的总结格式

## What this means for this repo

对当前仓库，这篇文档最重要的意义可以压成 5 条。

### 1. 当前方向是对的

我们现在的实现方式：

- 主 agent
- `delegate_to_subagent` tool
- specialist subagent

本质上就是 AI SDK 推荐的 subagent 基本模式。

### 2. 不需要先做复杂 team orchestration

这篇文档的重点不是：

- message bus
- long-lived teams
- shared state mesh

而是一个更克制的模式：

- 主 agent 通过 tool 委派子代理

这和我们当前阶段完全匹配。

### 3. 流式展示比“黑盒等待”更重要

如果已经决定做 subagent，最先该补的不是：

- 更多角色
- 更复杂的 orchestration graph

而是：

- 让 subagent 执行过程对用户可见

### 4. `toModelOutput` 不是可选装饰

它不是为了“代码更优雅”，而是为了控制上下文污染。

如果没有它：

- 主 agent 很快会被子代理过程淹没

### 5. 可以逐步引入 tool isolation

文档提到 specialization 和 capability isolation。

对当前仓库，下一步可以考虑的不是更多 agent，而是：

- 给不同 subagent 分配更窄的工具集

例如：

- `web_agent` 只给 web tools
- `rag_agent` 只给 retrieval 相关能力
- `critic_agent` 尽量少给外部工具

但这一步可以放后面，不必现在就做。

## What we should do now

基于这篇文档，当前仓库最合理的做法是：

1. 继续保持 `Orchestrator-Subagent`
2. 保持 subagent 不是默认路径
3. 保持 `toModelOutput` 压缩 summary
4. 优先做好 subagent 的流式过程展示
5. 再考虑更细的 tool isolation

## What we should not do yet

这篇文档并没有要求我们立刻做这些：

- 多 subagent 并行调度
- shared state
- message bus
- 长生命周期 worker teams
- 复杂 handoff graph

对当前仓库来说，这些仍然太早。

## Bottom line

这篇文档对当前仓库是高价值参考。

它最值得吸收的不是“再加更多 subagents”，而是下面这条实现原则：

- **让 subagent 的运行对用户可见**
- **让主 agent 只看到压缩后的结果**

这正是当前这套 `Orchestrator-Subagent` 应该优先做稳的部分。
