# 第 9 章：Metacognition in AI Agents

第九章开始进入一个很“agent 味”的能力：

**agent 不只是执行步骤，还会回头看自己做得对不对。**

关键词是：

**metacognition，元认知。**

先记一句总纲：

**Metacognition in AI Agents = 让 agent 对自己的思考、判断、结果和失败路径进行监控、评估和修正。**

## 1. 什么是 metacognition

定义很直接：

**thinking about thinking。**

放到 agent 场景里，不是哲学意义上的“自我意识”，而是更工程化的几件事：

- 反思自己的输出是否完整
- 识别自己的错误
- 发现当前方法不奏效
- 切换策略
- 根据反馈调整后续行为

## 2. 它和普通推理有什么区别

普通推理通常是：

- 给输入
- 产输出

metacognition 会多一层：

- 我刚才的做法合理吗？
- 结果够完整吗？
- 哪一步可能错了？
- 如果主路径失败，要不要换路径？
- 我是否该基于反馈调整策略？

## 3. README 里为什么说它重要

四个关键词：

- `Self-Reflection`
- `Adaptability`
- `Error Correction`
- `Resource Management`

它们可以翻译成：

- 我做得怎么样？
- 这条路不行，我能换路吗？
- 我能不能发现并修正错误？
- 我能不能别无限乱试，而是更有效率地解决问题？

## 4. 旅行例子想表达什么

更成熟的 travel agent 不会只做“推荐行程”，它还应该：

- 记住用户反馈
- 调整推荐偏好
- 从历史错误中修正行为
- 避免重复犯同类错误

重点不是简单改一个答案，而是：

**修改做决策的方法。**

## 5. notebook 里给了两个非常实用的元认知模式

- `fallback strategy`
- `self-evaluation`

## 6. Pattern 1: fallback strategy

notebook 定义了两个工具：

- `get_flight_times`，主系统
- `get_flight_times_backup`，备份系统

主系统查不到就抛异常，然后 agent 的 instructions 要求它：

1. 先用主系统
2. 主系统失败就识别错误
3. 透明地告诉用户发生了什么
4. 改用备份系统
5. 如果都失败，再给出替代建议

这其实就是很经典的 metacognitive pattern：

**不是失败就结束，而是失败后识别失败类型，并切换策略。**

## 7. 为什么这算 metacognition，而不只是错误处理

因为这里不只是程序员硬编码：

`if error then backup`

更关键的是，agent 被要求：

- 理解当前失败意味着什么
- 解释给用户听
- 调整自身行为
- 再评估答案是否完整

## 8. Pattern 2: self-evaluation

notebook 里又创建了一个 `ResponseEvaluator` agent，专门评价回答质量，按三维度打分：

- Completeness
- Accuracy
- Helpfulness

这说明 metacognition 不一定必须是“同一个 agent 自己反省”，也可以是：

**让另一个 agent 充当审稿人 / 评审人。**

## 9. Corrective RAG 和 metacognition 的关系

Corrective RAG 的重点不只是“查更多”，而是：

- 根据反馈修正查询
- 根据结果质量调整检索策略
- 不断评估推荐是否合适

所以 Corrective RAG 本质上是：

**把元认知能力加到 RAG 流程里。**

## 10. 第九章真正想教你的是什么

不是抽象地谈“AI 会不会自我意识”，而是更实用的这套东西：

- agent 要能识别失败
- agent 要能透明说明失败
- agent 要能尝试备选路径
- agent 要能评价自己的输出质量
- agent 要能根据反馈更新策略
- agent 要能减少重复犯错

## 11. 这一章适合哪些场景

metacognition 特别适合：

- 任务复杂，容易出错
- 工具有主备系统
- 需要高质量输出
- 用户会持续给反馈
- 系统需要逐步改进
- 正确性比一次性速度更重要

## 12. 你学完第九章，应该真正得到什么

- 一个成熟 agent 不只生成答案，还要审视答案
- 错误恢复是元认知的一部分
- fallback 是最常见、最实用的元认知模式之一
- evaluator / critic agent 是另一种元认知实现方式
- metacognition 和 Agentic RAG、planning、multi-agent 都是能串起来的

## 13. 学习版总结

- metacognition 就是让 agent 对自己的过程和结果做检查
- 它的核心能力是反思、评估、修正、适应
- 常见落地方式有 fallback 和 self-evaluation
- corrective RAG 本质上也是 metacognition 的一个应用
- agent 越复杂，越需要这种“自检层”
