# MCP Server Demo

最后更新：2026-04-14

这份文档说明项目里当前提供的 **学习用 MCP server demo**。

目标不是做完整产品，而是给后续研究 MCP 全能力时留一个最小、可运行、可对照代码的例子。

## 入口

- 路由：
  - [src/app/api/mcp/route.ts](../src/app/api/mcp/route.ts)
- 实现：
  - [src/features/mcp/server/demo-mcp-server.ts](../src/features/mcp/server/demo-mcp-server.ts)

当前走的是：

- `WebStandardStreamableHTTPServerTransport`
- 无 session 的 stateless 模式

这很适合放在 Next.js route handler 里做最小示例。

## 当前 demo 里包含什么

### Tools

当前 demo tools：

- `hello`
  - 最简单的问候工具
- `emit_log`
  - 演示 logging notification
- `collect_profile`
  - 演示 form elicitation
- `summarize_with_sampling`
  - 演示 sampling
- `list_client_roots`
  - 演示 roots

### Resources

- `memo://demo/overview`
  - 一个静态 markdown 资源

### Prompts

- `welcome-user`
  - 一个简单 prompt template

### Logging

- `emit_log`
  - 调用后会从 server 发送一条 logging message

### Elicitation

- `collect_profile`
  - server 会尝试向 client 发起一个简单表单

### Sampling

- `summarize_with_sampling`
  - server 会尝试让 client 代为调用模型完成摘要

### Roots

- `list_client_roots`
  - server 会尝试读取 client 暴露的 roots

## 重要边界

这份 demo 的意义是：

- 展示 **server 端代码该怎么写**
- 不是保证当前项目里的 MCP client 已经把所有能力都接好了

所以现在要区分两件事：

1. **这个 demo server 暴露了某种能力**
2. **当前项目里的 MCP client 真的支持并消费了这种能力**

这两件事不是一回事。

## 当前哪些能力能稳定看到

当前最稳定的是：

- tools
- resources
- prompts

因为这些已经能在现有的：

- `/api/mcp/test`
- MCP 测试结果弹窗

里看到真实返回。

## 当前哪些能力更偏“演示接口”

这些已经在 demo server 里写了，但当前项目里还没有完整消费链路：

- logging
- elicitation
- sampling
- roots

这意味着：

- 代码已经有示例
- 但你用当前应用内置的 MCP client 去调用时，可能会看到：
  - client not supported
  - capability missing
  - 或只是测试弹窗里显示“未支持”

这是预期行为。

## 为什么这样做

因为当前阶段更重要的是先把三件事分开：

1. server 端能力长什么样
2. client 端能力长什么样
3. 产品里真正消费这些能力的 UI 和 workflow 应该怎么落

如果这三件事一开始就混在一起，会很难排查。

## 后续研究顺序建议

如果你后面要慢慢研究 MCP 全能力，建议按这个顺序：

1. 先从 `tools / resources / prompts` 看起
2. 再看 `logging`
3. 再看 `elicitation`
4. 再看 `sampling`
5. 最后看 `roots`

原因：

- 前三类更容易观察
- `elicitation / sampling / roots` 都带明显的 client 能力依赖
- 不先把 client/server 边界想清楚，很容易误判

## 对照文档

- 总实现文档：
  - [docs/mcp-implementation.md](./mcp-implementation.md)
- 学习笔记：
  - [docs/mcp-for-beginners/01-core-concepts.md](./mcp-for-beginners/01-core-concepts.md)
  - [docs/mcp-for-beginners/03-getting-started.md](./mcp-for-beginners/03-getting-started.md)
  - [docs/mcp-for-beginners/04-practical-implementation.md](./mcp-for-beginners/04-practical-implementation.md)
