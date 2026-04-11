# 第二章：MCP 核心概念

对应原文：[01-CoreConcepts/README.md](/Users/harvey/Desktop/github/mcp-for-beginners/01-CoreConcepts/README.md)

这一章是在第一章导论的基础上，正式把 MCP 的内部结构拆开。第一章回答的是“为什么需要 MCP”，这一章回答的是“一个 MCP 系统到底由什么组成、这些部分怎么协作、协议分几层、核心对象是什么”。

可以先记住这一章的主线：

`MCP 的本质不是某个单独工具，而是一套由 Host、Client、Server、Primitives、Data Layer、Transport Layer 共同构成的标准化协作体系。`

## 1. 第二章在整体课程中的位置

如果说第一章是在建立方向感，那么第二章就是在建立结构感。

学完这一章，你应该开始能分清：

1. Host、Client、Server 各自到底负责什么
2. Server 可以暴露什么能力
3. Client 反过来又能提供什么能力
4. 一次完整请求在协议里怎么流动
5. MCP 为什么要分 Data Layer 和 Transport Layer

## 2. 先看整体架构

原文强调，MCP 采用的是客户端-服务器架构，但这里的“客户端”不是普通意义上的聊天窗口，而是协议层里的一个专门角色。

一个 Host 可以同时连接多个 MCP Server：

- Host 是总控应用
- 每个 Server 提供一组能力
- Host 通常会为每个 Server 建立一个独立 Client 连接

这意味着一个 IDE、桌面客户端或 AI 应用，可以同时接：

- 文件系统 Server
- 搜索 Server
- 数据库 Server
- 企业内部 API Server

这样系统就不是“一模型对一工具”，而是“一个宿主统一调度多个能力源”。

## 3. Host、Client、Server 的精确定义

这是第二章最重要的部分。

### Host

Host 是用户真正接触到的 AI 应用，比如：

- Claude Desktop
- VS Code
- IDE
- 自定义 AI Agent 应用

Host 的职责包括：

- 运行或协调模型
- 管理用户界面和会话流程
- 为每个 Server 创建对应的 Client
- 管理权限、认证和用户同意
- 控制哪些工具和数据能被调用

所以 Host 是 MCP 里的总控层和治理层。

### Client

Client 是 Host 内部的协议连接器。它不是一个独立给用户使用的产品，而是 Host 与某个 MCP Server 之间的 1:1 通信通道。

它的职责包括：

- 发送 JSON-RPC 请求
- 和 Server 协商协议版本与能力
- 发起工具调用
- 接收通知和实时更新
- 处理并整理 Server 返回的数据

一句话概括：

`Host 面向用户，Client 面向协议连接。`

### Server

Server 是能力提供方。它负责向外暴露：

- tools
- resources
- prompts

它可以是本地程序，也可以是远程服务。它的职责包括：

- 注册并公布能力
- 接收请求并执行操作
- 提供上下文和数据
- 维护必要状态
- 发送更新通知

一句话概括：

`Server 是 MCP 生态中的能力节点。`

## 4. 一定要理解的关系：Host 和 Client 不是一回事

很多人第一次学 MCP 时，最容易混淆 Host 和 Client。

正确理解是：

- Host 是应用整体
- Client 是 Host 为某个 Server 建立的协议连接实例

也就是说，一个 Host 里通常会有多个 Client。

例如：

- VS Code 是 Host
- VS Code 连接文件系统 Server 时，会创建一个 Client
- VS Code 再连接数据库 Server 时，会再创建一个 Client

因此：

`Client 是连接单位，Host 是调度单位。`

## 5. Server Primitives：Server 能暴露什么

第二章把 Server 暴露的核心能力称为 `primitives`。这是协议级的基础对象。

Server 可以暴露三类核心 primitive：

- `Resources`
- `Prompts`
- `Tools`

### Resources

Resources 是提供给模型读取的上下文数据。

它可以是：

- 文件
- 文档
- 数据库内容
- API 返回结果
- 实时信息

它更偏“名词型内容”，也就是“可读的数据”。

原文强调 Resources 通过 URI 标识，例如：

```text
file://documents/project-spec.md
database://production/users/schema
api://weather/current
```

你可以把 Resources 理解成：

`给模型看的材料。`

### Prompts

Prompts 是可复用的提示模板和工作流模板。

它们可以包括：

- 固定结构的提示语
- 参数化模板
- few-shot 示例
- 系统提示词框架

例如：

```markdown
Generate a {{task_type}} for {{product}} targeting {{audience}} with the following requirements: {{requirements}}
```

你可以把 Prompts 理解成：

`提前封装好的交互模板。`

### Tools

Tools 是可执行函数，是 MCP 里最像“动作”的部分。

它可以做：

- 搜索
- 调 API
- 查数据库
- 读写文件
- 调用业务逻辑
- 执行计算

原文强调 Tools 的几个关键特征：

- 有唯一名字
- 有描述
- 有参数模式
- 输入输出是结构化的
- 参数通常通过 JSON Schema 校验

所以 Tools 不是随便写一个函数就行，而是：

`一个有清晰契约、可发现、可验证、可调用的动作能力。`

原文还提到 tool annotations，例如：

- `readOnlyHint`
- `destructiveHint`

这些注解的作用是告诉客户端：这个工具是不是只读、是不是带破坏性。这对安全和 UI 提示都很重要。

## 6. Client Primitives：Client 也能暴露什么

这是第二章一个很容易被忽略、但很重要的点。

MCP 不是只有 Server 向 Client 提供能力，Client 也可以向 Server 提供某些能力。这些就是 client-side primitives。

原文列出了四类：

- `Sampling`
- `Roots`
- `Elicitation`
- `Logging`

### Sampling

Sampling 允许 Server 反过来请求 Client 所在宿主的模型能力。

也就是说，Server 自己不一定要集成某个 LLM SDK，它可以向 Client 说：

“请你用你这边的模型帮我做一次补全或推理。”

这意味着：

- Server 不必自己绑定某个模型
- Server 可以借用 Host 的模型能力
- 可以形成更复杂的代理式工作流

这是 MCP 很强的一点，因为它把“模型能力”也变成了一种可调用资源。

### Roots

Roots 用于定义文件系统访问边界。

它告诉 Server：

- 哪些目录可访问
- 哪些文件属于当前允许范围

Roots 的意义主要是安全和范围控制。它避免 Server 对本地文件系统“无限制漫游”。

你可以把它理解成：

`客户端告诉服务端：你只能在这些目录里活动。`

### Elicitation

Elicitation 允许 Server 向用户请求补充信息或确认。

典型场景：

- 缺少参数时向用户追问
- 执行危险操作前请求确认
- 需要多步交互时逐步收集信息

这意味着交互不再只是“用户发一句，系统回一句”，而是可以形成更动态的流程。

### Logging

Logging 允许 Server 把日志发送给 Client，用于：

- 调试
- 监控
- 错误诊断
- 审计追踪

这在生产环境里尤其重要，因为 MCP Server 往往不是一个简单脚本，而是要被长期运行、观测和排障的组件。

## 7. 信息流是怎么走的

这一章给出了更完整的信息流。

一次 MCP 交互大致分成这些步骤：

1. Host 建立与 Server 的连接
2. Client 和 Server 协商协议版本、支持的能力
3. 用户在 Host 中发出请求
4. Client 视情况读取资源、调用工具或补充上下文
5. Server 执行请求并返回结构化结果
6. Client 把结果整合进模型上下文
7. Host 把最终输出展示给用户

这里最重要的不是记流程本身，而是理解一个原则：

`MCP 把模型与外部世界之间的交互，变成了一个可发现、可协商、可调用、可返回的标准闭环。`

## 8. 协议为什么分两层

原文把 MCP 分成：

- `Data Layer`
- `Transport Layer`

### Data Layer

Data Layer 基于 `JSON-RPC 2.0`，定义的是：

- 请求格式
- 响应格式
- 通知机制
- 生命周期管理
- 能力协商
- primitives 的调用语义

也就是说，这一层定义“协议内容”。

### Transport Layer

Transport Layer 定义这些消息通过什么方式传输。

原文重点提到两种：

1. `STDIO`
2. `Streamable HTTP`

其中：

- STDIO 适合同机本地进程通信
- HTTP 适合远程服务通信
- SSE 可以支持服务端流式返回

这一层定义“协议怎么运过去”。

所以你可以这样记：

- Data Layer = 语义层
- Transport Layer = 通道层

分层的好处是：即使底层传输方式不同，上层依然可以维持同一套 JSON-RPC 语义。

## 9. 协议版本与能力协商

第二章还提到一个很工程化的细节：MCP 使用基于日期的版本号，例如 `YYYY-MM-DD`。

这样做的好处是：

- 版本演进更清晰
- 更容易判断新旧能力差异
- 协议兼容性协商更直观

同时，在连接初始化阶段，Client 和 Server 会进行能力协商，明确双方支持哪些特性。这一点非常重要，因为 MCP 不是“只要连上就默认全支持”，而是：

`先声明自己支持什么，再按协商结果工作。`

## 10. 安全不是附属主题，而是协议的基本要求

这一章一开头就强调了四类安全原则：

- 显式用户同意
- 数据隐私保护
- 工具执行安全
- 传输层安全

这说明在 MCP 里，安全不是事后补丁，而是架构内建要求。

你需要记住三个判断：

1. 不是能调工具就应该立刻调
2. 不是能访问数据就默认可以访问
3. 不是连通了就说明是安全的

原文还给出一些实施建议：

- 细粒度权限管理
- 安全认证与授权
- 输入参数校验
- 审计日志

这些实际上已经非常接近生产级要求了。

## 11. 这一章最该掌握的几个认知升级

从第一章到第二章，你的认知应该完成这些升级：

### 从“知道 MCP 是标准”升级到“知道标准具体由什么组成”

第一章更偏概念，第二章开始进入结构。

### 从“知道有 Host/Client/Server”升级到“知道它们的职责边界”

尤其要分清：

- Host 是总控应用
- Client 是连接器
- Server 是能力提供方

### 从“知道可以调工具”升级到“知道能力对象不止工具”

除了 Tools，还有：

- Resources
- Prompts
- Sampling
- Roots
- Elicitation
- Logging

### 从“知道可以通信”升级到“知道通信分协议层和传输层”

这会直接影响你后面理解本地 server、远程 server、HTTP transport、STDIO transport。

## 12. 学完第二章后，你应该能回答的问题

1. Host、Client、Server 有什么区别？
2. 为什么一个 Host 往往会包含多个 Client？
3. Server primitives 和 client primitives 各有哪些？
4. Resources、Prompts、Tools 的差别是什么？
5. Sampling、Roots、Elicitation 分别解决什么问题？
6. 为什么 MCP 要分 Data Layer 和 Transport Layer？
7. 能力协商为什么是必要的？

## 13. 常见误区

- 误区一：Client 就是用户界面
  - 不准确。Client 是 Host 内部的协议连接器。
- 误区二：Server 只会暴露工具
  - 不对。它还可以暴露 resources 和 prompts。
- 误区三：Sampling 是普通工具调用
  - 不完全是。它是 Server 请求 Client 使用宿主模型能力。
- 误区四：Transport Layer 决定协议语义
  - 不对。协议语义主要由 Data Layer 定义。
- 误区五：安全是第三章才需要考虑的内容
  - 不对。第二章已经明确安全是 MCP 的基本原则之一。

## 14. 学习建议

这一章建议你重点做三件事：

1. 画一张自己的结构图，把 Host、Client、Server 关系画出来
2. 用自己的话分别解释 Resources、Prompts、Tools
3. 把 Data Layer 和 Transport Layer 的区别讲清楚

如果这三件事你都能独立说清，第二章就基本掌握了。

## 15. 一句话总结

`第二章的核心，是把 MCP 从“一个有用的标准”变成“一个有明确角色分工、能力对象、通信流程和协议分层的工程系统”。`
