# MCP Implementation

最后更新：2026-04-14

## 目标

这份文档描述当前项目里 MCP 的实现边界、数据结构、服务端接入方式，以及后续扩展时需要遵守的原则。

重点回答这些问题：

1. 当前 MCP 是“客户端接外部 MCP server”还是“本项目提供 MCP server”
2. MCP settings 怎么存
3. 聊天时 MCP tools 怎么接进 LLM
4. 为什么这里没有直接裸用 `await mcpClient.tools()`
5. 以后如果扩展成完整 MCP 能力，应该往哪里放

## 当前范围

当前已经实现的是：

- 用户在应用里配置多个远程 MCP server
- 聊天请求时把这些 server 的 tools 接进现有 agent tools
- 用户可以在 MCP 弹窗里测试单个远程 server，并查看它暴露的：
  - tools
  - resources
  - prompts
  - capabilities（只展示是否支持）

当前还没有实现的是：

- 本项目自己的正式 MCP server
- MCP resources / prompts 的实际消费流程
- elicitation / approval UI
- stdio server 管理
- 多 server 权限策略
- 使用统计、缓存、审计

所以当前 MCP 功能更准确地说是：

- **MCP client integration**
- 不是完整的 **MCP platform**

## 两条独立方向

### 1. 本项目作为 MCP client

也就是：

- 去连接外部远程 MCP server
- 把远程 tools 转成 AI SDK tools
- 再接入聊天 workflow

这条链已经落地。

### 2. 本项目作为 MCP server

也就是：

- 让外部 client 连到我们自己的 `/api/mcp`
- 对外暴露我们自己的 tools / resources / prompts

这条链目前只实现了一个**学习用 demo server**，还不是正式产品能力。

因此当前路由语义是：

- `src/app/api/mcp/route.ts`
  - 当前是最小 demo MCP server
- `src/app/api/mcp/test/route.ts`
  - 当前用于测试外部远程 MCP server

这两个方向不要混在同一个 route 里。

另外：

- [docs/mcp-server-demo.md](./mcp-server-demo.md)
  - 记录了当前 demo server 暴露了哪些能力
  - 以及哪些只是 server 侧示例，还没被当前产品完整消费

## 当前数据结构

位置：

- `src/features/mcp/types.ts`

当前 settings 结构：

```ts
type McpTransportType = 'http' | 'sse';

interface McpServerSettings {
  id: string;
  serverName: string;
  serverUrl: string;
  transport: McpTransportType;
  bearerToken: string;
  enabled: boolean;
}

interface McpSettings {
  enabled: boolean;
  servers: McpServerSettings[];
}
```

语义：

- `enabled`
  - MCP 全局开关
  - 决定聊天时是否允许把 MCP tools 接进来
- `servers[]`
  - 用户配置的多个远程 MCP server

当前已经不再维护 `selectedServerId`。
MCP UI 现在是纯列表模型，编辑状态只存在于弹窗本地 state。

## Source Of Truth

当前 source of truth 是：

- `profile.settings.mcp`

也就是说：

- guest 用户：本地 profile
- 登录用户：Supabase `profiles.settings`

MCP 配置并不是单独的数据库表。

## 当前实现位置

### UI

- `src/features/mcp/components/mcp-content.tsx`
  - MCP 弹窗整体内容
- `src/features/mcp/components/mcp-server-list.tsx`
  - server 列表与操作区
- `src/features/mcp/components/mcp-server-editor-dialog.tsx`
  - 新增 / 编辑远程 MCP server
- `src/features/mcp/components/mcp-test-result-dialog.tsx`
  - 测试结果弹窗
- `src/features/mcp/hooks/use-mcp-settings.ts`
  - MCP settings draft、测试连接、保存

### Settings Normalize

- `src/features/mcp/settings.ts`
  - `normalizeMcpSettings(...)`
  - `createMcpServerDraft(...)`
  - `hasMcpAccess(...)`

### Server-Side MCP Client

- `src/features/mcp/server/mcp-client.ts`

这里负责：

- 创建远程 MCP client
- 拉 tool definitions
- 转成 AI SDK tools
- 为多 server 情况做 tool rename

### Chat Integration

- `src/features/chat/server/chat-request-context.ts`
  - 读取 `mcpSettings`
  - 初始化 MCP clients
  - 合并 MCP tools 和其它 tools
- `src/features/chat/server/chat.ts`
  - 把这些 tools 交给 workflow
- `src/features/chat/server/chat-finish.ts`
  - 在响应结束后关闭 MCP clients
- `src/features/chat/ai/workflows/generateText.ts`
  - 最终把 tools 挂到 `streamText(...)`

### 测试远程 MCP Server

- `src/app/api/mcp/test/route.ts`

当前会返回：

- 单个 server 连接测试
- `serverName`
- `serverVersion`
- `toolNames`
- `resources`
- `prompts`
- `capabilities`

说明：

- `resources / prompts`
  - 当前只做测试结果展示
  - 还没有接入聊天运行时
- `capabilities`
  - 当前只展示“是否支持”
  - 不是这些能力已经完整接入项目

## 当前工具接入流程

```text
Chat UI
  -> /api/chat
  -> validateRequest(chatPostSchema)
  -> loadChatRequestContext(...)
      -> resolve mcp settings
      -> create MCP clients for enabled servers
      -> list tools from each server
      -> rename tool ids to avoid collisions
      -> merge with search tools
  -> runGenerateTextWorkflow(...)
  -> streamText({ tools })
  -> onFinish -> close all MCP clients
```

也就是说，MCP 当前的接入方式就是：

- **作为 AI SDK tools 接入**

## 为什么没有直接裸用 `await mcpClient.tools()`

AI SDK 文档里最简单的示例是：

```ts
const tools = await mcpClient.tools();
```

这个写法对单个 server 完全没问题。

但当前项目要支持：

- 多个远程 MCP server 同时接入聊天

这时如果直接对每个 server 都用 `tools()` 再 merge，会有一个实际问题：

- **同名 tool 冲突**

例如两个不同 server 都提供：

- `search`
- `fetch`
- `list`

如果直接 merge，后面的会覆盖前面的。

因此当前实现改成：

1. 先 `listTools()`
2. 再 `toolsFromDefinitions(definitions)`
3. 在合并前手动加 server 前缀

例如：

- `mcp_docs_search`
- `mcp_github_search`

这样做的目的只有一个：

- 保证多 server 下 tool 名唯一

所以当前实现没有偏离 AI SDK 文档，而是为了多 server 支持多做了一层包装。

## 当前命名策略

当前 tool id 生成规则大致是：

- `mcp_{serverName}_{toolName}`

其中：

- `serverName`
  - 使用 UI 配置的 `serverName`
  - 再做 slug / sanitize
- `toolName`
  - 使用远程 MCP server 原始 tool name
  - 再做 sanitize

当前限制：

- 如果两个 server 取了极度相似的名字，理论上仍可能发生前缀冲突
- 目前靠用户命名规避

后续更稳的方案可以是：

- 在前缀里带 server id 的短 hash

## 当前测试弹窗展示边界

当前 MCP 测试结果弹窗会展示四块：

1. 基本信息
   - server name
   - server version
2. capabilities
   - tools
   - resources
   - prompts
   - logging
   - elicitation
   - sampling
   - roots
3. resources 列表
4. prompts 列表
5. tools 列表

这里要注意：

- `tools / resources / prompts`
  - 是从远程 server 读取到的真实列表
- `logging / elicitation`
  - 当前根据 server 初始化能力显示支持状态
- `sampling / roots`
  - 当前显示的是“本项目这个 MCP client 侧是否声明支持”
  - 现在还没有真正实现，因此会显示为不支持

所以这块 UI 的语义应理解为：

- “当前测试可观察到的 MCP 能力”

而不是：

- “这些能力已经全部接入产品”

## 当前关闭策略

MCP client 现在是：

- 请求级创建
- 请求结束后关闭

也就是：

- 每次 `/api/chat`
  - 创建相关 MCP clients
  - 结束后 `close()`

这是最安全、最简单的第一版。

## 当前 UI 策略

MCP 弹窗当前采用：

- 左侧：server list
- 右侧：当前 server settings
- 顶部：全局开关 + 测试连接 + 文档链接

测试按钮当前只测试：

- 当前选中的一个 server

不是一次测试全部 server。

## 当前约束

### 1. 只支持远程 Server

当前只支持：

- `http`
- `sse`

不支持：

- `stdio`

### 2. 只接 Tools

当前没有接：

- resources
- prompts
- elicitation

### 3. 不做复杂审批流

当前没有用户级 tool approval 流程。

## 后续扩展建议

### 第一层：把当前 client integration 做稳

建议优先补：

- 更细的 MCP 测试错误反馈
- 多 server 结果观测
- tool 冲突策略增强
- server 连接失败时的 UI 告警

### 第二层：扩到更多 MCP 能力

可以逐步加：

- resources 浏览
- prompts 浏览
- elicitation 支持
- server capability 展示

但这些都应该继续挂在：

- `src/features/mcp/`

### 第三层：本项目自己的 MCP Server

如果后面要让本项目作为 MCP server，对外暴露能力，建议单独做：

- `src/app/api/mcp/route.ts`
  - 真正的 MCP server endpoint
- `src/features/mcp/server/hosted-*`
  - 我们自己暴露的 tools / resources / prompts

注意：

- “本项目作为 MCP client”
- “本项目作为 MCP server”

这两条链要继续保持分离，不要混在一个实现里。

## 当前最重要的结论

1. 当前 MCP 已经是按 AI SDK tools 接入聊天
2. 为了支持多 server，当前没有直接裸用 `await mcpClient.tools()`
3. 当前只做远程 MCP tools integration
4. `/api/mcp` 仍然保留给未来“本项目自己的 MCP server”
5. 后续扩展应继续围绕 `src/features/mcp/` 收敛，而不是把逻辑散进 `chat` 或 `lib`
