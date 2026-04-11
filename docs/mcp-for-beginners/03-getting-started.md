# 第四章：Getting Started

对应原文：[03-GettingStarted/README.md](/Users/harvey/Desktop/github/mcp-for-beginners/03-GettingStarted/README.md)

这一章是整个课程从“理解 MCP”正式切换到“开始动手”的分水岭。

如果前面三章是在回答：

- MCP 是什么
- MCP 怎么组织
- MCP 为什么必须重视安全

那么这一章开始回答：

- 我到底怎么搭环境
- 第一个 MCP Server 怎么写
- Client 怎么写
- 怎么接上 LLM
- 怎么测试、调试、部署

这一章最重要的定位不是某一个单点知识，而是：

`把你从“懂概念”推进到“能把一个最小可用 MCP 系统跑起来”。`

## 1. 这一章包含什么

原文把这一章拆成很多小课，覆盖一条非常完整的入门路径：

1. 你的第一个 Server
2. Client
3. 带 LLM 的 Client
4. 在 VS Code 中消费 MCP Server
5. `stdio` 传输
6. `HTTP Streaming`
7. 使用 AI Toolkit for VS Code
8. 测试
9. 部署
10. 高级 server 用法
11. 基础认证
12. MCP Hosts
13. MCP Inspector
14. Sampling
15. MCP Apps

这说明这章不是单纯“Hello World”，而是一整套从开发到调试再到集成和部署的上手模块。

## 2. 这一章真正想让你学会什么

原文的 learning objectives 可以压缩成五件事：

1. 配好 MCP 开发环境
2. 写出基础 Server
3. 写出能连接 Server 的 Client
4. 学会测试和调试
5. 把 MCP 系统接到真实模型和真实宿主里

也就是说，这一章要把你从“知道 Host / Client / Server 的概念”推进到“你真的能写出它们的最小实现”。

## 3. 学这一章时要有一个正确预期

这一章不是在追求一次性掌握所有 transport、所有 SDK、所有高级特性。

它的重点是建立一条最小闭环：

1. 写一个 server
2. 把工具注册出来
3. 用 client 连上它
4. 看它有没有正常响应
5. 用 inspector 或宿主工具调试
6. 再逐步加上 LLM、认证、部署

所以你可以把这章当成：

`MCP 的最小工程实践课。`

## 4. SDK 和语言不是重点，闭环才是重点

原文列出很多官方 SDK：

- C#
- Java
- TypeScript
- Python
- Kotlin
- Swift
- Rust
- Go

这说明 MCP 的一个优势是多语言生态。

但学习顺序上，你不用被“选语言”这件事卡住。对初学者来说，最重要的不是哪个 SDK 最强，而是先跑通完整流程：

- 注册 resource / prompt / tool
- 让 client 调到 server
- 看懂调试输出
- 知道哪里是 transport，哪里是协议对象

语言只是实现载体，闭环理解才是核心。

## 5. 这一章的知识结构怎么理解

可以把它拆成四个层次。

### 第一层：本地最小 MCP Server

这是入门的起点。  
你先学会：

- 创建 server
- 注册工具
- 提供 schema
- 启动 server

这一步的目标不是做复杂功能，而是理解 server 的最小骨架。

### 第二层：Client 连接与调用

只写 server 还不够。你还要看到调用链真的跑通。

所以接下来会学习：

- client 如何建立连接
- 如何发现 tools / resources
- 如何发起工具调用
- 如何接收结果

这一步会让你真正看到 MCP 是怎样把“外部能力”暴露给宿主和模型的。

### 第三层：带 LLM 的协作

这一步开始从“人工指定调用哪个工具”，升级到“让 LLM 根据上下文决定怎么用工具”。

这非常关键，因为这才更接近真实 agent 场景：

- 模型理解用户意图
- 模型决定要不要调工具
- 模型整合工具结果生成回答

这一步会让你真正感受到 MCP 在 AI 系统中的价值。

### 第四层：调试、测试、部署、认证

当你会跑 demo 后，接下来就必须面对工程问题：

- 如何测试
- 如何调试
- 如何部署
- 如何接宿主
- 如何做基础认证

所以这一章后半部分开始从“能跑”过渡到“更像真实项目”。

## 6. 为什么 `stdio` 和 `HTTP Streaming` 都要学

原文把这两个 transport 单独列出来，说明它们在入门里就很关键。

### `stdio`

适合本地场景。  
特点是：

- 本地进程通信
- 简单
- 隔离性较好
- 很适合开发和调试

所以你做本地 server、IDE 插件集成时，经常先从 `stdio` 开始。

### `HTTP Streaming`

适合远程 server。  
特点是：

- 可跨网络通信
- 更接近生产部署
- 支持流式更新和进度反馈

所以你如果要把 MCP 服务放到远程环境或云上，最终就会越来越多地接触这一类 transport。

## 7. 为什么 Inspector 和 Host 配置在入门期就出现

很多人以为“先写代码，调试以后再说”，但 MCP 学习恰好不是这样。

原文把 `MCP Inspector`、`VS Code`、`MCP Hosts` 都提前放进来，是因为 MCP 有很强的“交互式调试”特点。

你需要尽早学会：

- server 是否暴露了预期工具
- schema 是否正确
- 参数校验是否工作
- transport 是否正常
- host 能不能正确发现 server

也就是说，MCP 开发从一开始就不是只盯着代码，而是：

`代码 + 协议消息 + 宿主行为 + 调试工具` 一起看。

## 8. 认证为什么放在入门章节的后段

原文第 11 小节讲 simple auth，包括 Basic Auth、JWT 和 RBAC 的入门内容。

这说明课程设计是渐进式的：

- 前面先让你会跑
- 后面再把“怎么让它更安全”接回来

这也是合理顺序，因为初学者先要搞懂：

- 请求是怎么连上的
- 工具是怎么被调用的
- server 是怎么暴露能力的

然后再在这个基础上去理解：

- 认证加在链路的哪里
- 授权边界怎么放
- 角色控制怎么做

## 9. 这一章最重要的学习方法

这章最怕的不是代码写不出来，而是“跳着学，没形成完整路径”。

建议按这条顺序看：

1. 第一个 server
2. client
3. 带 LLM 的 client
4. inspector / host 配置
5. stdio / HTTP transport
6. testing
7. deployment
8. auth

这样你会先建立最小闭环，再逐步加复杂度。

## 10. 学完这一章后，你应该达到什么程度

学完后，你不一定已经能设计企业级架构，但你至少应该能做到：

1. 用某一种 SDK 写出一个基础 MCP Server
2. 注册至少一个 tool
3. 写一个 client 或在 host 中成功连接 server
4. 用 inspector 验证 server 行为
5. 理解本地 transport 和远程 transport 的基本区别
6. 知道测试、部署、认证分别为什么重要

如果能达到这些，这一章就达标了。

## 11. 一句话总结

`这一章的本质，是把 MCP 从“概念体系”变成“你亲手能跑起来、能调起来、能接进真实工具链的开发实践”。`
