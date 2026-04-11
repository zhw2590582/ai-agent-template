# 第 13 章：Memory for AI Agents

第十三章是在第十二章“context engineering”之后的自然升级。

如果说第十二章在讲：

**当前这一步该给模型什么信息**

那第十三章讲的是：

**哪些信息值得被长期记住，并在未来继续影响 agent 行为。**

先记一句总纲：

**Context 是“当前可见信息”，Memory 是“跨时间保留并可再利用的信息”。**

## 1. 为什么 memory 对 agent 特别重要

agent 的两个核心卖点常常是：

- 会调用工具
- 会随着时间改进

而“随着时间改进”这件事，底层离不开 memory。

没有 memory，系统通常是：

- 每次会话都从零开始
- 用户每次都要重复偏好
- 之前的错误和反馈无法沉淀
- personalization 很弱

所以 memory 的真正意义是：

**让 agent 不只是“会话中聪明”，而是“跨会话持续变得更有用”。**

## 2. memory 和 context engineering 的关系

一个很实用的区分方式：

- `Context`
  当前轮/当前步骤里模型能看到的东西

- `Memory`
  存在上下文窗口之外、但可以在需要时被取回的东西

所以：

**memory 本质上是 context 的外部长期存储层。**

## 3. 第十三章把 memory 分得很细

它列了很多类型：

- `Working Memory`
- `Short-Term Memory`
- `Long-Term Memory`
- `Persona Memory`
- `Workflow / Episodic Memory`
- `Entity Memory`
- `Structured RAG`

### Working Memory

当前任务里的“工作台”，通常跟 session 强相关。

### Short-Term Memory

单次会话或单次任务期间保留的信息。

### Long-Term Memory

跨 session 持久存在的信息，例如长期偏好、历史习惯。

### Persona Memory

agent 对自己角色和风格的稳定认知。

### Workflow / Episodic Memory

记录经历过什么步骤、成功失败过什么。

### Entity Memory

保存具体实体及其关系。

### Structured RAG

更像一种 memory 技术路线，把信息结构化后再检索。

## 4. 这一章真正想教你的不是“存东西”，而是“存什么”

真正有价值的 memory，应该是：

- 稳定的用户偏好
- 对未来决策仍然有影响的信息
- 可复用的经验
- 结构化的事实
- 重要的历史结果和失败教训

也就是说：

**memory 的价值不在“记得多”，而在“记得对”。**

## 5. 主 notebook 的结构很清晰

主 notebook 先讲三层 memory：

- `Working`
- `Short-Term`
- `Long-Term`

### Working Memory

通过 `agent.create_session()` 保持当前线程上下文。

### 新 session 就忘了

这是为了让你明确：

**session memory 不是 long-term memory。**

## 6. Long-term memory 在主 notebook 里的实现方式

用了一个简单的 preference store，再通过工具暴露给 agent：

- `save_preference(user_id, preference)`
- `get_preferences(user_id)`

这背后的设计模式非常经典：

**长期记忆不直接塞进模型，而是存外部系统，由 agent 通过工具读写。**

## 7. Sarah 的示例想表达什么

Sarah 第一次来时，agent 记录她的偏好：

- 浪漫目的地
- fine dining
- spa
- 无障碍住宿需求
- 预算
- 素食
- 坚果过敏

之后她开一个全新 session 再来，工作记忆没了，但 long-term memory 还在，于是 agent 仍能个性化推荐。

这说明：

**真正的个性化不是靠当前对话历史，而是靠跨会话长期记忆。**

## 8. “Knowledge Agent”模式很值得注意

一个自我改进 agent 常见做法是引入一个单独的：

**knowledge agent**

它负责：

1. 观察主对话
2. 判断哪些信息值得保存
3. 抽取并总结
4. 存入知识库
5. 在未来相关查询时再取回

这避免了一个问题：

**不是所有对话内容都该进入长期记忆。**

## 9. Cognee notebook 代表了另一种 memory 路线

在 Cognee notebook 里，memory 不只是偏好列表，而是升级成了：

- knowledge graph
- vector embeddings
- graph-aware search

它做的事情是：

1. ingest 原始文本
2. 转成知识图谱和向量表示
3. 通过 `search_knowledge` / `search_principles` 工具提供检索
4. 让 agent 在新 session 中继续访问这些长期知识

## 10. Cognee 路线相比简单 preference store 的意义

简单 preference store 适合保存：

- 用户偏好
- 明确事实
- 少量长期信息

Cognee 这类图谱路线更适合保存：

- 实体关系
- 经验知识
- 文档内容
- 历史问答
- 概念之间的关联

所以：

- 简单 memory 更像“记事本”
- graph memory 更像“知识网络”

## 11. memory 和 RAG 的关系

很多 memory 系统，本质上都要靠检索：

- 先存
- 再按需找回
- 再注入当前 context

所以：

- `RAG` 更强调外部知识检索
- `Memory` 更强调长期保存与个性化经验
- 工程上两者常常共享同一套基础设施

## 12. 第十三章和第十二章的差别

- `Context engineering`：管理当前可见信息
- `Memory engineering`：管理未来可再取回的信息

这两个概念要分开，但最终会协作。

## 13. 第十三章真正想让你学会什么

- memory 要分层，不是只有一种
- session memory 和 long-term memory 完全不同
- 长期记忆必须外部化存储
- agent 通过 tools/RAG 访问 memory
- 长期记忆要有筛选机制，不是什么都记
- 结构化 memory 比纯文本堆积更可用

## 14. 学习版总结

- memory 是让 agent 跨时间积累能力和个性化的基础
- working memory 解决当前会话，long-term memory 解决跨会话记忆
- 长期记忆通常不在模型里，而在外部存储里
- agent 通过 tool 或检索访问这些记忆
- knowledge agent / graph memory 是更高级的 memory 组织方式
- context 解决“现在看到什么”，memory 解决“以后还能记得什么”
