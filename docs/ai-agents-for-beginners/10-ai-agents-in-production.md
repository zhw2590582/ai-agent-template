# 第 10 章：AI Agents in Production

第十章开始从“怎么设计 agent”切到“怎么运营 agent”。

如果说前面几章更像在教你搭系统，那第十章讲的是：

**系统上线之后，你怎么知道它到底跑得好不好、贵不贵、哪里坏了。**

先记一句总纲：

**一个能跑的 agent 只是 demo；一个可观测、可评估、可控成本的 agent，才开始接近 production。**

## 1. 第十章在讲什么

这一章有三个主轴：

- `Observability`
- `Evaluation`
- `Cost Management`

## 2. observability 在这一章里的位置

这一章系统展开了“可观测性”。

关键两个词：

- `Trace`
- `Span`

### Trace

是一整次 agent 任务的完整链路。

### Span

是 trace 里的某一步。

所以 observability 的本质是：

**把 agent 的运行过程拆成一条可回放、可分析的执行链。**

## 3. 为什么 production 里 observability 是必须的

主要原因有四个：

- `Debugging`
- `Latency and Cost Management`
- `Trust, Safety, and Compliance`
- `Continuous Improvement Loops`

也说明了：

**observability 不是运维附属品，而是 agent 迭代的基础设施。**

## 4. 这一章列出的关键指标

- `Latency`
- `Costs`
- `Request Errors`
- `User Feedback`
- `Implicit Feedback`
- `Accuracy`
- `Automated Eval Metrics`

这说明：

**别再只看“这个 demo 看起来能跑”，而要开始用指标管理 agent。**

## 5. notebook 里的生产化思路

production patterns 被简化成三件事：

- 对 agent 调用计时
- 用 evaluator agent 打分
- 列出成本管理策略

### 第一，先把 timing 接上

重点是：

**先量出来，再谈优化。**

### 第二，用 evaluator agent 做自动评估

这延续了第九章的 metacognition，但用于生产环境的质量监控。

### 第三，把成本管理当设计问题

而不是等账单炸了才想起来。

## 6. 成本管理为什么成为单独主题

因为 agent 比普通单轮问答更容易贵。

原因包括：

- 多轮模型调用
- 工具调用
- 多 agent 协作
- RAG 检索
- evaluator 额外调用
- fallback / retry

常见控制策略：

- `Using Smaller Models`
- `Using a Router Model`
- `Caching Responses`

## 7. offline eval 和 online eval 的区分

### Offline Evaluation

- 用测试集、标准答案、固定样本评测
- 适合开发阶段和回归测试

### Online Evaluation

- 看真实用户流量下的表现
- 适合发现测试集中没有的新失败模式

核心循环是：

**offline evaluate -> deploy -> monitor online -> collect failures -> add to offline dataset -> improve -> repeat**

## 8. 常见问题像故障排查手册

这一章列出的常见问题包括：

- agent 不稳定
- agent 卡在循环里
- tool call 效果差
- multi-agent 不一致

常见解决方向：

- 改 prompt
- 拆任务
- 设终止条件
- 用更适合推理的模型
- 测工具本身
- 做 routing / controller

## 9. 10-expense_claim-demo.ipynb 想说明什么

这个 notebook 展示的是一个顺序工作流：

- OCR agent 先从 receipt image 提取结构化费用
- Email agent 再生成报销邮件

这个例子重要的点不只是 OCR + Email，而是说明：

**production agent 通常是多步骤、多 agent、结构化中间结果、明确 workflow 的系统。**

## 10. OpenTelemetry 在这一章里的意义

因为 agent observability 不能永远停留在 `print()` 和 `time.time()`。

一旦系统复杂起来，你需要：

- 标准化 trace/span
- 接到真正的观测平台
- 跨服务关联调用链
- 统一看性能和错误

## 11. 第十章真正想让你获得什么

- 上线 agent 不等于部署代码
- 上线 agent 需要能看见它、衡量它、优化它
- 评估分离线和在线，两者缺一不可
- 真实系统的问题往往是链路问题，而不是单点模型问题
- 成本管理从第一天就要纳入设计

## 12. 学习版总结

- production agent 的核心不是“更强”，而是“更可管理”
- 可观测性让你看到 agent 的完整运行链路
- 评估让你知道 agent 好不好，而不是靠感觉
- 成本管理决定 agent 能不能长期跑下去
- offline eval 保证上线前质量，online eval 捕捉真实世界问题
- 真正的生产化，是把 agent 从黑盒变成玻璃盒
