# 第 8 章：Multi-Agent Design Pattern

第八章就是第七章的自然延续。

第七章问的是：

**一个复杂任务怎么拆。**

第八章问的是：

**拆出来的这些任务，应该怎么交给多个 agent 协作完成。**

先记一句总纲：

**Multi-agent design pattern 的核心，不是“多几个模型一起跑”，而是“让多个职责明确的 agent 为同一个目标协作”。**

## 1. 为什么需要 multi-agent

什么时候单 agent 不够？

典型场景：

- `Large workloads`
- `Complex tasks`
- `Diverse expertise`

也就是：

- 任务量太大
- 任务结构太复杂
- 需要多种专业能力

所以 multi-agent 的出发点不是“为了炫技”，而是：

**把复杂系统拆成多个更小、更专精、更容易维护的智能单元。**

## 2. 多 agent 比单 agent 的优势是什么

README 总结了 3 个核心好处：

- `Specialization`
- `Scalability`
- `Fault Tolerance`

### Specialization

每个 agent 只做自己擅长的事。

### Scalability

以后要扩展时，只需要新增 agent，不必推倒整个系统。

### Fault Tolerance

某个 agent 出问题，不一定整个系统都瘫掉。

## 3. multi-agent 的本质是什么

**multi-agent 是一种允许多个 agent 为共同目标合作的设计模式。**

核心不在 agent 数量，而在**协作机制**。

它要解决的问题包括：

- 谁负责什么
- 他们共享什么信息
- 谁先做，谁后做
- 谁来协调
- 失败时怎么办
- 人类什么时候介入

## 4. 这一章列出的 building blocks

- `Agent Communication`
- `Coordination Mechanisms`
- `Agent Architecture`
- `Visibility into Interactions`
- `Multi-Agent Patterns`
- `Human in the loop`

这说明 multi-agent 难的地方从来不只是“再建几个 agent”，而是：

**如何让它们合作而不是互相干扰。**

## 5. 可观测性在 multi-agent 里为什么更重要

单 agent 已经需要日志和 tracing；
多 agent 系统里，没有可观测性几乎就没法调试。

因为问题会变成：

- 是哪个 agent 出错？
- 它收到的上下文是什么？
- 它把什么传给了下一个 agent？
- 为什么后续 agent 会误解？

所以多 agent 一定要有：

- logging
- visualization
- performance metrics

## 6. 这一章介绍了哪些 multi-agent 模式

### Group Chat

多个 agent 在一个共享对话空间里交流。

适合：

- 讨论型任务
- brainstorming
- 多视角共同推理

### Hand-off

一个 agent 把任务移交给下一个 agent。

适合：

- 流程明确
- 阶段分工清晰
- 工作流式任务

### Collaborative Filtering

多个 agent 从不同专业角度贡献意见，再合成结果。

适合：

- 推荐系统
- 投资分析
- 审核与评估

## 7. refund process 例子想教你什么

真实业务里的 multi-agent 通常不是“随便拆几个角色”，而是围绕业务流程和组织职责拆分。

它把 agent 分成两类：

- 流程专属 agent
- 通用型 agent

这是一个很实用的架构视角。

## 8. notebook 里的 multi-agent 实现

示例主要演示的是一种**顺序工作流式 multi-agent**：

- `TravelPlanner`
- `TravelConcierge`

流程：

`TravelPlanner -> TravelConcierge`

后来又加了：

- `BudgetReviewer`

变成：

`TravelPlanner -> TravelConcierge -> BudgetReviewer`

这说明：

**你可以通过“插入一个新的专职 agent”来增强系统，而不必重写原有 agent。**

## 9. 第八章和第七章的关系

- 第七章：把任务拆出来
- 第八章：把任务交给不同 agent 协作完成

一句话：

**Planning 解决任务分解，Multi-Agent 解决任务分工。**

## 10. multi-agent 什么时候值得上

适合：

- 任务天然分工明确
- 每部分需要不同专业视角
- 希望提高模块可维护性
- 需要并行或顺序协作
- 未来还会继续扩展角色

不适合：

- 任务很简单
- 只是单次问答
- 分工边界不清
- 多个 agent 只会增加成本和复杂度

## 11. 你学完第八章，应该真正得到什么

- 这个任务是否值得拆成多个角色
- 每个角色的职责边界是否清楚
- 这些 agent 如何通信和交接
- 是顺序协作、共享讨论，还是专家汇总
- 是否有日志和 tracing 看清它们的交互

## 12. 学习版总结

- multi-agent 是多个专职 agent 为共同目标协作的模式
- 它适合复杂任务、大工作量、多专业能力场景
- 关键价值是专精、扩展性和故障隔离
- 真正难点不是“多建几个 agent”，而是通信、协调和可观测性
- 常见模式有群聊、交接、专家协同
- planning 负责拆任务，multi-agent 负责分工协作
