# 第六章：Advanced Topics

对应原文：[05-AdvancedTopics/README.md](/Users/harvey/Desktop/github/mcp-for-beginners/05-AdvancedTopics/README.md)

这一章开始进入真正的“高级专题”。  
如果前几章更多是在建立基础认知和实作能力，那么这一章关注的是：

`当 MCP 被用在复杂、生产级、企业级 AI 系统里时，会遇到哪些更高阶的问题。`

## 1. 这一章为什么重要

很多学习资料停留在：

- 写一个简单 tool
- 本地跑一个 server
- 调通一个 demo

但真实系统很快会遇到更复杂的需求：

- 多模态
- 高并发和扩展性
- 更复杂的认证授权
- 实时流式数据
- 更丰富的 routing 和 transport
- 和企业 AI 平台整合

这一章就是在处理这些问题。

## 2. 这一章包含哪些高级主题

原文列出的子模块非常多，核心方向包括：

- Azure 集成
- 多模态样例
- OAuth2
- Root Contexts
- Routing
- Sampling
- Scaling
- Security
- Web Search
- Realtime Streaming
- Entra ID Authentication
- Azure AI Foundry Agent Integration
- Context Engineering
- Custom Transport
- Protocol Features Deep Dive

这说明这一章不是某个单一知识点，而是一组“进阶能力地图”。

## 3. 学这一章要有正确心态

这一章不适合像入门章那样线性一口气学完。  
更合理的方法是：

- 先掌握主题地图
- 再按你的场景选读

例如：

- 做企业身份集成，就重点看 OAuth2、Entra ID
- 做高并发远程服务，就重点看 scaling、streaming、custom transport
- 做 agent 复杂协作，就重点看 sampling、routing、context engineering
- 做生产安全，就重点看 security 及相关认证模块

所以这一章更像：

`专题工具箱，而不是单一路径教程。`

## 4. 多模态的意义

原文一开始就把 multi-modal integration 放得很前，这说明 MCP 并不只面向文本。

多模态意味着 MCP Server 可以帮助模型接入：

- 图像
- 音频
- 复合输入与输出

这背后的意义是：

`MCP 标准化的不是“文本回答”，而是模型与外部能力之间的整体交互。`

所以在多模态场景里，MCP 依然成立，只是资源和工具的类型更丰富了。

## 5. Scaling 为什么是高级主题核心

一个本地 server demo 很容易跑起来，但生产系统会面临：

- 请求量波动
- 工具调用耗时差异
- 并发会话管理
- 状态维护
- 远程依赖抖动

所以“能跑”和“能扩”是两回事。

这一章谈 scaling，实际上是在讨论：

- 水平扩展
- 垂直扩展
- 会话与状态设计
- 资源隔离
- 性能瓶颈

也就是说，当 MCP 从单用户 demo 走向企业服务时，扩展性是不可回避的问题。

## 6. Root Contexts、Routing、Sampling 的进阶意义

这三个主题都属于“协议用深了以后才会真的碰到”的内容。

### Root Contexts

重点不只是文件路径，而是：

- 工作区边界
- 上下文范围
- 可访问域控制

它决定 server 在多大范围里看待用户环境。

### Routing

当系统里不止一个 tool、不止一个 server，甚至不止一个模型时，路由问题就出现了。

你会开始思考：

- 请求应该交给哪个 server
- 哪个模型适合哪个任务
- 如何按能力、成本、权限进行分发

### Sampling

Sampling 的高级用法不只是“让 server 请求一次模型补全”，而是把 server 和 host 的模型能力协同起来，用于更复杂的 agent 行为。

这意味着 server 也可能成为更主动的流程参与者。

## 7. 安全在高级章节里为什么还会再出现

第二章已经讲过安全，为什么这里还有 security 子模块？

因为入门安全讲的是原则和风险，而高级安全讲的是：

- 复杂身份体系
- 企业鉴权
- 更细粒度控制
- 生产环境 hardening

这章里提到：

- OAuth2
- Entra ID
- 安全最佳实践

这些都说明，到了企业级环境，安全不再只是“不要犯错”，而是“要融入现有身份与治理体系”。

## 8. 实时流和自定义 Transport 的意义

原文提到 realtime streaming 和 custom transport，这两个点很能体现 MCP 的进阶价值。

### Realtime Streaming

适用于：

- 长时间运行的任务
- 渐进式结果返回
- 实时搜索和实时更新

它会影响用户体验，也影响 server 的资源管理方式。

### Custom Transport

说明 MCP 并不把 transport 限死在少数默认方案里。  
当你有特殊网络环境、企业网关约束或定制化集成需求时，可能需要更专门的 transport 实现。

这也是为什么前面章节强调协议语义层和传输层要分离。

## 9. Context Engineering 为什么被单独提出来

这是这一章里一个非常重要的新方向。

前面我们更多在讲：

- tool 怎么暴露
- resource 怎么读
- server 怎么连

而 context engineering 关注的是：

- 如何让模型拿到最合适的上下文
- 如何动态管理上下文
- 如何减少噪声和冗余
- 如何提升工具调用质量和回答质量

这意味着 MCP 的价值不只在“接上更多东西”，还在“如何让接进来的东西更有用、更可控”。

## 10. 这一章传达的一个核心事实

当你看到 Azure、Entra ID、Foundry、Web Search、Scaling、Realtime 这些主题一起出现时，你应该意识到：

`MCP 已经不是实验性玩具，而是在朝企业级 AI 基础设施方向发展。`

这也是这一章最重要的隐含信息。

## 11. 学完这一章后应该有什么收获

你不需要把每个子模块都吃透，但至少应该获得这些能力：

1. 知道 MCP 的高级应用面远超基础 tool calling
2. 知道多模态、实时流、扩展性、身份集成都是 MCP 的真实应用场景
3. 理解 root contexts、routing、sampling 是更复杂 agent 系统的重要拼图
4. 知道企业级 MCP 系统通常要接入现有云平台、身份体系和治理体系
5. 明白 context engineering 会成为未来非常关键的实践方向

## 12. 一句话总结

`这一章的核心，是让你看到 MCP 不只是“会写个 server”这么简单，而是可以延伸到多模态、实时、扩展、安全、企业平台集成和复杂 agent 系统的完整高级生态。`
