# 第 11 章：Using Agentic Protocols

第十一章开始从“怎么设计 agent”切到“agent 和外部世界如何标准化连接”。

如果说前面几章更多是在讲 agent 内部能力和工作流，这一章在讲的是：

**agent 之间、agent 和工具之间、agent 和网站之间，如何通过协议互操作。**

先记一句总纲：

**协议的作用，是让 agent 系统从“各写各的临时集成”，变成“按统一规则发现、调用、协作”。**

这一章主要讲 3 个协议：

- `MCP`
- `A2A`
- `NLWeb`

## 1. 为什么需要 agentic protocols

当 agent 越来越多、工具越来越多、服务提供方越来越多时，如果每次都手写一套集成方式，会出现：

- 接入成本高
- 不同系统之间不兼容
- 安全认证方式不统一
- 能力难以动态发现

所以协议的意义就是：

**把“怎么连、怎么发现能力、怎么交换信息”标准化。**

## 2. MCP 在这一章里的定位

MCP 的定位是：

**agent 连接外部工具和数据源的标准接口层。**

它解决的问题是：

- 工具怎么被发现
- 资源怎么被读取
- prompt 模板怎么被暴露
- 客户端和服务端怎么统一交互

## 3. MCP 的三个核心 primitive

- `Tools`
- `Resources`
- `Prompts`

### Tools

可执行动作，例如：

- 搜航班
- 查天气
- 下订单

### Resources

只读内容，例如：

- 文件
- 数据库记录
- 日志
- PDF

### Prompts

预定义提示模板，适合复杂工作流或推荐调用方式。

## 4. MCP 相比直接 API 集成的优势

- `Dynamic Tool Discovery`
- `Interoperability Across LLMs`
- `Standardized Security`

核心价值是：

**把外部能力接入从“定制开发”变成“标准发现和调用”。**

## 5. MCP notebook 想表达什么

它是在“模拟 MCP 风格的工具发现”。

核心思想是：

- 工具在真实生产里本该来自外部 MCP server
- agent 不必把所有能力硬编码在自身代码里
- 工具提供方可以独立演进

## 6. A2A 在这一章里的定位

如果说 MCP 是：

**agent 和工具 / 数据源之间的协议**

那么 A2A 就是：

**agent 和 agent 之间的协议**

它让不同 agent 在不同组织、环境、技术栈之间通信协作。

## 7. A2A 的几个核心组件

- `Agent Card`
- `Agent Executor`
- `Artifact`
- `Event Queue`

### Agent Card

agent 的“名片”或“服务描述”，告诉别人：

- 我叫什么
- 我会做什么
- 我的 endpoint 在哪
- 我支持哪些能力

### Agent Executor

负责把上下文交给远程 agent，让它真正执行任务。

### Artifact

远程 agent 完成后交回来的结果对象。

### Event Queue

处理长任务里的状态更新和消息传递。

## 8. A2A 和 subagents 模式是什么关系

- 第八章的 multi-agent 偏“设计模式”
- 第十一章的 A2A 偏“互操作协议”

所以：

**multi-agent 是架构思想，A2A 是让这种架构跨边界运行的标准协议。**

## 9. A2A notebook 想表达什么

通过几个 specialist agent 加一个 manager，模拟了 A2A-style collaboration。

重点是：

真实生产里，这些 agent 可以根本不在同一个系统里，但如果都遵守 A2A，就能协作。

## 10. NLWeb 在这一章里的定位

NLWeb 更像：

**自然语言访问网站内容的协议化入口。**

它让网站不仅能给人类用户提供自然语言搜索，也能作为 agent 生态中的一个可接入能力节点。

## 11. MCP、A2A、NLWeb 三者怎么区分

- `MCP`：让模型/agent 标准化地接工具和上下文
- `A2A`：让 agent 和 agent 标准化地协作
- `NLWeb`：让网站内容和能力以自然语言方式被人和 agent 使用

## 12. 这一章和前面学的内容怎么串起来

- 第四章 tool use：MCP 可以成为 tool use 的标准接入层
- 第八章 multi-agent：A2A 可以成为多 agent 协作的标准通信层
- 第五章 Agentic RAG：NLWeb 和 MCP 可以成为知识检索能力的来源
- 第十章 production：协议化之后更容易做可观测、治理和扩展

## 13. 你学完第十一章，应该真正得到什么

- 随着 agent 系统变复杂，标准协议会越来越重要
- MCP 不是某个工具，而是一种能力接入标准
- A2A 不是某个 workflow，而是一种 agent 间通信标准
- NLWeb 不是普通聊天框，而是让网站成为 agent 可消费接口的一种方式

## 14. 学习版总结

- MCP、A2A、NLWeb 都是在解决 agent 互联问题
- MCP 连接工具和数据
- A2A 连接 agent 和 agent
- NLWeb 连接自然语言与网站内容
- 协议让 agent 系统更容易扩展、替换、跨组织协作
