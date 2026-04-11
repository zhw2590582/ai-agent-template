# 第 3 章：Agentic Design Principles

第三章有一个很值得注意的点：

**README 讲的是“Agentic Design Principles”，而 notebook 更偏“可落地的设计模式”。**

你可以把第三章理解成一句话：

**前两章在回答“agent 是什么、怎么开发”，第三章开始回答“怎样把 agent 设计得像一个能被人真正使用和信任的产品”。**

## 这一章最重要的结论

1. agent 设计不只是 prompt engineering。
2. 好的 agent 要围绕“人”设计，而不是只围绕“模型能力”设计。
3. 一个好 agent 需要透明、可控、一致。
4. 在代码实现上，清晰指令、结构化输出、单一职责，是最基础的三个模式。

## 1. README 这部分到底在讲什么

README 的重点不是 workflow 编排，而是**面向用户体验的 agent 设计原则**。

它把原则分成三块：

- `Agent (Space)`
- `Agent (Time)`
- `Agent (Core)`

### Agent (Space)

agent 在什么环境里出现、如何被用户接触到。

核心意思：

- 要连接人，而不是替代人
- 要容易访问，但别一直打扰用户
- 可以在前台也可以在后台工作
- 即使在后台工作，也要让用户知道它在做什么

### Agent (Time)

agent 在时间维度上怎么和用户持续互动：

- `Past`：记住历史和上下文
- `Now`：在合适的时候轻推一下，而不是乱发通知
- `Future`：随着用户行为慢慢适应和演化

### Agent (Core)

核心就是一句：

**接受不确定性，但必须建立信任。**

## 2. 第三章给出的三条实施指南

README 里把落地原则压缩成 3 个词：

- `Transparency`
- `Control`
- `Consistency`

### Transparency

用户要知道：

- 这是 AI 在参与
- 它怎么工作的
- 它之前做过什么
- 怎么反馈和纠正它

### Control

用户要能：

- 配置偏好
- 调整行为
- 删除历史
- 决定 agent 记住什么、忘掉什么

### Consistency

不同设备、不同交互方式下，体验要一致，别让用户每次都重新学习。

## 3. 这一章为什么重要

很多初学者一开始会把 agent 设计理解成：

- prompt 写好一点
- 工具接上去
- 能跑就行

但第三章在纠正这个思路：

**真正的 agent 设计，是“能力设计 + 行为设计 + 用户关系设计”的组合。**

## 4. notebook 里的三种可落地模式

notebook 给了三个基础 pattern：

- `Clear Agent Instructions`
- `Structured Output`
- `Single Responsibility Agents`

### Pattern 1: Clear Agent Instructions

好的 instructions 至少要说清楚：

- 它是谁
- 它做什么
- 它怎么做
- 它不能做什么
- 它的语气和约束是什么

结论：

**instructions 不是“装饰性角色扮演”，而是 agent 的操作说明书。**

### Pattern 2: Structured Output

给人看的回答可以是自然语言，给系统消费的结果最好是结构化数据。

这样你才能：

- 稳定拿字段
- 做自动校验
- 接下游逻辑
- 存库和渲染

### Pattern 3: Single Responsibility Agents

复杂任务应拆成多个专职 agent，例如：

- `DestinationExpert`
- `LogisticsPlanner`

这其实就是软件工程里的单一职责原则在 agent 世界里的映射。

## 5. README 和 notebook 合起来，你应该怎么理解第三章

可以把第三章分成上下两层：

### 上层：产品和体验原则

- 透明
- 可控
- 一致
- 接受不确定性但建立信任

### 下层：代码和架构模式

- 清晰指令
- 结构化输出
- 单一职责

## 6. 一句话串起来

第三章真正想教你的不是某个 API，而是这套思维：

**设计 agent 时，既要像工程师一样拆职责、定结构，也要像产品设计师一样考虑透明、控制和信任。**

## 7. 你学完第三章，应该得到什么

- 会用透明、控制、一致来看待一个 agent
- 理解好的 prompt 应该像操作规程
- 理解结构化输出对工程的重要性
- 知道复杂任务不应都塞进一个 agent

## 8. 学习版总结

- agent 设计不是只看能力，也要看信任和体验
- 好 agent 要透明、可控、一致
- prompt 要像操作规程，不要只像一句人设
- 输出最好结构化
- 复杂任务要拆成单一职责 agent
