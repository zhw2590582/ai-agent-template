# 第 12 章：Context Engineering

第十二章很重要，而且很实战。

如果说前面很多章节都在讲：

- prompt
- tools
- planning
- multi-agent
- protocols

那第十二章在提醒你一件更根本的事：

**agent 能不能稳定工作，很多时候不是“模型够不够强”，而是“上下文管得好不好”。**

先记一句总纲：

**Prompt engineering 决定“怎么说”，Context engineering 决定“模型此刻看到了什么”。**

## 1. 什么是 Context Engineering

定义是：

**Context engineering 是确保 agent 在完成“下一步任务”时，拿到正确的信息。**

注意重点是：

- 不是永久拿到所有信息
- 而是**下一步所需的正确信息**

## 2. 为什么 prompt engineering 不够

- `Prompt engineering` 更偏静态
- `Context engineering` 更偏动态

prompt engineering 主要在管：

- system prompt
- few-shot
- 规则
- 初始角色

但 agent 真正运行起来后，上下文会不断变化：

- 用户补充信息
- 工具返回新结果
- memory 写入新偏好
- plan 状态不断更新
- 某些旧信息变得无关甚至错误

所以：

**agent 不是靠一个神奇 prompt 驱动的，而是靠一个持续管理上下文的系统驱动的。**

## 3. 这一章列出的 context 类型

context 不只是对话历史，还包括：

- `Instructions`
- `Knowledge`
- `Tools`
- `Conversation History`
- `User Preferences`

所以 context engineering 的复杂度就在于：

**agent 每一轮看到的 context，往往是这五类信息混在一起。**

## 4. planning 思路很实用

三步法：

1. `Define Clear Results`
2. `Map the Context`
3. `Create Context Pipelines`

也就是：

- 先想清楚结果
- 再想清楚需要什么信息
- 最后设计这些信息如何流入 agent

## 5. practical strategies 非常核心

- `Agent Scratchpad`
- `Memories`
- `Compressing Context`
- `Multi-Agent Systems`
- `Sandbox Environments`
- `Runtime State Objects`

### Agent Scratchpad

agent 的临时笔记本，通常不直接塞进 prompt，而放在外部文件或运行时对象里，需要时再取。

### Memories

比 scratchpad 更长期，用于跨 session 保存：

- 用户偏好
- 总结
- 反馈

### Compressing Context

上下文快爆了时，需要：

- summarization
- trimming
- 只保留关键轮次

### Multi-Agent Systems

每个 agent 都有自己的 context window，你得决定：

- 传什么给谁
- 不传什么
- 用摘要传还是全文传

### Sandbox Environments

当某一步会生成大量中间结果时，不要全塞回上下文。

### Runtime State Objects

把中间状态结构化保存，例如：

- 当前 plan
- 已完成子任务
- 工具结果缓存
- 当前用户偏好快照

## 6. notebook 里最主要讲了两个模式

- `chat summarization`
- `agent scratchpad`

## 7. chat summarization 是怎么工作的

多轮对话会不断累积：

- token 越来越多
- 成本越来越高
- 最终接近甚至超过 context window

所以一个典型办法是：

**把旧对话压缩成摘要，而不是保留完整历史。**

## 8. summarize_preferences 这个工具的代表意义

这个工具不是查外部世界，而是把已有对话压缩成更紧凑的记忆。

这很好地说明：

**tool use 不一定只用于获取外部信息，也可以用于管理内部上下文。**

## 9. scratchpad 在这章是怎么理解的

scratchpad 里不存全部聊天，而只存关键事实，比如：

- 预算
- 兴趣偏好
- 喜欢什么目的地类型
- 已完成哪些任务

重点是：

**不是所有历史都值得保留，真正值得保留的是“未来仍会影响决策的事实”。**

## 10. Common Context Failures

这部分几乎就是 agent 上下文问题排障手册。

### Context Poisoning

错误信息混进 context，并被不断引用。

### Context Distraction

context 太长，模型开始被无关历史带偏。

### Context Confusion

上下文里工具太多、信息太杂，模型选错工具或反应混乱。

### Context Clash

上下文里存在冲突信息。

## 11. 这章和前面内容怎么串起来

第十二章像一个总整合器，把很多主题收拢到“上下文管理”：

- tool use：工具定义和工具结果本身就是 context
- Agentic RAG：检索结果如何进入 context
- planning：plan 和 subtask state 如何作为 context 保存
- multi-agent：不同 agent 之间如何传 context
- metacognition：反思和评估结果如何作为下一轮 context
- MCP：外部 resources/tools/prompts 如何成为 context 来源

## 12. 第十二章真正想让你得到什么

- 上下文不是越多越好，而是越相关越好
- 上下文管理本身是一套系统设计问题
- 需要区分短期笔记、长期记忆、运行状态和对话历史
- 失败很多时候不是模型能力问题，而是 context 出了问题

## 13. 学习版总结

- prompt engineering 解决静态指导，context engineering 解决动态信息管理
- context 包括 instructions、knowledge、tools、history、preferences
- 好 agent 的关键是每一步都看到“刚刚好的信息”
- scratchpad、memory、summary、state object 都是在帮你管 context
- 常见失败包括 poisoning、distraction、confusion、clash
- 很多 agent 问题，本质上都是 context engineering 问题
