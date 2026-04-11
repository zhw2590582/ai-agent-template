# 第 2 章：Explore AI Agent Frameworks

第二章的主题可以概括成一句话：

**第一章在回答“什么是 agent”，第二章在回答“为什么做 agent 不能只靠裸调模型，而要用 framework 和 service”。**

## 这一章最重要的结论

你先记住这 3 句就够了：

1. **Framework 是开发层**，帮你更快写 agent。
2. **Service 是平台层**，帮你更稳部署 agent。
3. **Microsoft Agent Framework 和 Azure AI Agent Service 不是互斥关系，而是前后衔接关系。**

也就是：

**先用 Framework 开发和迭代，成熟后再放到 Azure 的 Agent Service 里部署和扩展。**

## 1. 为什么需要 Agent Framework

如果你不用 framework，自己从零写 agent，通常要手动处理这些事情：

- 模型请求和响应格式
- 工具注册和调用
- 多轮上下文维护
- 线程/会话状态
- 身份认证
- 编排和多 agent 协作
- 日志、可观测性、错误处理

所以第二章的核心观点是：

**Framework 不是让 agent “更聪明”，而是让你“更容易把 agent 做成系统”。**

## 2. 这一章怎么定义 Agent Framework

Agent Framework 是帮助你创建、部署、管理 AI agents 的软件平台，提供预制组件、抽象层和工具。

重点不是“模型更强”，而是“工程能力更强”。

第二章列了几个关键能力：

- Agent collaboration and coordination
- Task automation and management
- Contextual understanding and adaptation

翻成更工程化的话：

- 支持多 agent 协作
- 支持多步任务流转
- 支持上下文和状态管理

## 3. 这一章强调的快速原型方法

想快速试 agent，通常抓 3 个东西：

- `Modular Components`
- `Collaborative Tools`
- `Real-Time Learning`

其实这 3 个可以理解为：

- 模块化组件：不要从零造轮子
- 协作式设计：把不同职责拆给不同 agent / tool
- 反馈闭环：让系统能根据结果调整

## 4. 第二章里 Microsoft Agent Framework 在讲什么

Python notebook 给了一个很清晰的四层结构：

- `Client`
- `Agent`
- `Tools`
- `Session`

### Client

负责连模型和服务端，比如认证、请求封装、响应解析。

### Agent

在 client 之上，叠加：

- 名称
- instructions
- tools

### Tools

就是给 agent 装“手”和“脚”。

### Session

用于维护多轮会话状态，让 agent 能记住前文。

## 5. Semantic Kernel 在这一章的作用

这一章放 Semantic Kernel，不是为了说它一定更好，而是告诉你：

**Agent framework 不止一种，生态里有不同实现思路。**

重点不是 API 名称，而是抽象是否相通：

- 都有模型连接层
- 都有 agent 定义层
- 都有工具/插件层
- 都有会话/线程层

## 6. 这一章最关键的比较：MAF 和 Azure AI Agent Service

很多人会混淆：它们是不是同一个东西？

不是。

### Microsoft Agent Framework

更像一个 SDK / 开发框架。

它负责：

- 用代码定义 agent
- 加工具
- 管会话
- 调模型
- 做多步流程

适合：

- 快速开发
- 本地实验
- 工程内集成

### Azure AI Agent Service

更像 Azure 上的 agent 平台/托管服务。

它负责：

- 托管和部署 agent
- 集成 Azure 生态能力
- 提供企业级扩展能力
- 支持 thread、message、run 等服务端对象

一句话区分：

**MAF 是“怎么写 agent”，Azure AI Agent Service 是“怎么把 agent 放到 Azure 上稳定运行”。**

## 7. Azure AI Agent Service 想让你理解什么

这一章引入了几个平台对象：

- `Agent`
- `Thread`
- `Message`
- `Run`

这说明你在操作的不再只是模型，而是一个有生命周期的 agent runtime。

## 8. 这一章最后给你的选择建议

- 想快速开始构建生产 agent：先选 `Microsoft Agent Framework`
- 想做 Azure 企业级部署和内置 Azure 集成：选 `Azure AI Agent Service`
- 还拿不准：先用 MAF，后续再迁移到 Agent Service

## 9. 你学完第二章，应该真正掌握什么

- 为什么 agent 开发需要 framework
- Framework 和 Service 分别处在哪一层
- 一个 agent framework 至少要解决哪些问题
- MAF 和 Azure AI Agent Service 的职责边界

## 10. 学习版总结

- 第一章讲 agent 是什么，第二章讲 agent 怎么工程化
- Framework 解决“开发效率”和“系统抽象”
- Service 解决“部署、扩展、安全、集成”
- MAF 偏 SDK
- Azure AI Agent Service 偏平台
- 真正的 agent 系统通常会有：
  - 模型连接
  - 工具
  - 会话
  - 线程/消息
  - 执行过程
