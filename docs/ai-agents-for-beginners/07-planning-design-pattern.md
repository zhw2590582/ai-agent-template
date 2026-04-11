# 第 7 章：Planning Design Pattern

第七章开始把前面的内容真正组织起来了。

如果说：

- 第四章是 `tool use`
- 第五章是 `Agentic RAG`
- 第六章是 `trustworthiness`

那么第七章讲的是：

**当任务变复杂时，agent 不能只靠“临场发挥”，而要先做 planning。**

先记一句总纲：

**Planning Design Pattern 的核心，是先决定“做哪些步骤、按什么顺序做、交给谁做”，再进入执行。**

## 1. 为什么需要 planning

前几章你看到的 agent，很多还是“接到问题 -> 调工具 -> 回答”。

这种方式对简单任务够用，但一旦任务复杂，就会有几个问题：

- 一次性处理太多目标，容易漏步骤
- 步骤之间有依赖关系，顺序可能错
- 不同部分需要不同专长
- 某一步失败后，不知道怎么重排后续动作
- 成本、预算、优先级无法显式管理

所以第七章要解决的就是：

**复杂目标如何拆解成可执行的小目标。**

## 2. 这一章的核心思想：先计划，再执行

planning pattern 的基本结构是：

1. 明确总目标
2. 把目标拆成子任务
3. 给子任务安排顺序
4. 指定谁负责
5. 再执行
6. 根据执行结果必要时重规划

所以：

- `tool use` 更关注：某一步怎么调用外部能力
- `planning` 更关注：整体任务应该怎么分步组织

## 3. travel itinerary 的例子为什么典型

“生成一个 3 天旅行 itinerary”看起来像一个单任务，但实际上隐含多个子任务：

- Flight Booking
- Hotel Booking
- Car Rental
- Personalization

这说明：

**很多自然语言里的“一个请求”，在执行层其实是“多个任务包”。**

## 4. task decomposition 是这一章最重要的词

把模糊的大目标变成清晰、可分配、可执行的小任务。

这样做的好处：

- 降低复杂度
- 更容易测试
- 更容易失败隔离
- 更方便分配给不同 agent / tool
- 更容易追踪进度和预算

## 5. structured output 在这一章里的地位更高了

planning 不再只是生成一段“建议步骤”，而是生成一份**机器可执行计划**。

计划中常见的字段有：

- `main_task`
- `subtasks`
- `assigned_agent`
- `priority`
- `dependencies`

## 6. planning agent 是什么角色

notebook 把 planning agent 形容成一个 `front desk coordinator`。

它主要负责：

- 读懂用户目标
- 拆成子任务
- 指定负责人
- 标记优先级
- 确定依赖关系
- 预估预算

所以 planning agent 干的是：

**what to do**

而不是：

**how to do**

## 7. notebook 里的结构怎么理解

最关键的是两个数据模型：

- `TravelSubTask`
- `TravelPlan`

一个成熟计划最少要有：

- 子任务内容
- 谁来执行
- 优先级
- 依赖关系
- 总体预算或汇总信息

## 8. 这一章第一次明确地区分了 planning 和 execution

notebook 的后半部分引入了一个 `concierge agent` 来执行计划。

也就是：

- `TravelPlanner` 负责生成计划
- `Concierge` 负责执行计划

这是一种非常重要的架构切分：

- `Planning Layer`
- `Execution Layer`

## 9. dependencies 为什么重要

子任务之间不是平铺的，而是可能有依赖关系。

比如：

- 没确定航班时间前，酒店入住日期可能还不能最终定
- 没选定目的地前，活动预订也无法准确安排

所以 planning 不是简单列清单，而是要表示：

**哪些任务可以并行，哪些任务必须串行。**

## 10. iterative planning 是什么意思

计划不是一次生成后永远不变的。

执行过程中如果发生这些情况：

- 数据格式不符合预期
- 某个工具失败
- 用户偏好改变
- 预算超支
- 某个子任务结果影响后续安排

系统就要：

- 局部调整计划
- 或者重新规划

## 11. 你学完第七章，应该真正得到什么

- planning 是把高层目标转成可执行工作单
- 结构化计划是后续自动执行的基础
- planning 和 execution 最好分层
- 依赖关系和优先级是计划的重要组成部分
- 计划应该允许被重新规划，而不是一次定死

## 12. 学习版总结

- planning pattern 解决的是复杂任务拆解问题
- agent 先决定做哪些子任务，再决定怎么执行
- 结构化输出让计划可以被机器消费
- planning layer 和 execution layer 分开更稳
- 好的计划不仅有任务列表，还要有优先级、依赖关系和重规划能力
