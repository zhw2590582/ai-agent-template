# Search Implementation

最后更新：2026-04-15

## 目标

这份文档描述当前项目里 `Search` 的真实实现边界、数据结构、持久化方式，以及它是怎么接进聊天 runtime 的。

重点回答这些问题：

1. `Search` 现在只是设置页，还是已经进入聊天主链路
2. Tavily 相关配置怎么存
3. 连接测试和真正聊天调用走的是哪两条链
4. 当前 `web_search / web_extract / web_crawl` 是怎么注册进去的
5. 现阶段还缺哪些能力

## 当前范围

当前已经实现的是：

- 顶部 workbench 里的 `Search` 弹窗
- Tavily API Key 配置
- Search / Extract / Crawl 三组设置项
- `/api/search/test` 连接测试
- `profile.settings.search` 持久化
- 聊天请求里按当前用户配置动态挂载：
  - `web_search`
  - `web_extract`
  - `web_crawl`

当前还没有实现的是：

- 独立的搜索结果历史或结果管理页
- Tavily 错误的细粒度分类展示（如 `401 / 429 / quota`）
- 搜索结果缓存、配额统计、成本观测
- 对 search / extract / crawl 的专门引用展示层
- 更强的工具路由策略或策略配置页

所以当前 `Search` 的准确定位是：

- **真实可用的搜索工具集成**
- 不是完整的 **search platform**

## 当前数据结构

位置：

- `src/features/search/types.ts`

当前 settings 结构：

```ts
type TavilySearchDepth = 'advanced' | 'basic';
type TavilySearchTopic = 'finance' | 'general' | 'news';
type TavilyExtractDepth = 'advanced' | 'basic';
type TavilyExtractFormat = 'markdown' | 'text';

interface SearchSettings {
  enabled: boolean;
  tavilyApiKey: string;
  search: {
    maxResults: number;
    searchDepth: TavilySearchDepth;
    topic: TavilySearchTopic;
  };
  extract: {
    chunksPerSource: number;
    extractDepth: TavilyExtractDepth;
    format: TavilyExtractFormat;
  };
  crawl: {
    allowExternal: boolean;
    maxDepth: number;
    pageLimit: number;
  };
}
```

语义：

- `enabled`
  - Search 全局开关
  - 决定聊天时是否允许注入 Tavily tools
- `tavilyApiKey`
  - 用户自己的 Tavily key
- `search.*`
  - 控制 `web_search`
- `extract.*`
  - 控制 `web_extract`
- `crawl.*`
  - 控制 `web_crawl`

## Source Of Truth

当前 source of truth 是：

- `profile.settings.search`

也就是说：

- guest 用户：本地 profile
- 登录用户：Supabase `profiles.settings`

Search 配置不是单独的数据库表。

归一化入口在：

- `src/features/auth/profile/profile-settings.ts`
- `src/features/search/settings.ts`

其中 `normalizeSearchSettings(...)` 负责：

- 补默认值
- 数值范围裁剪
- 非法枚举值回退

## 当前默认值和限制

位置：

- `src/config/search.ts`

当前关键默认值：

- `search.maxResults`
  - 默认 `5`
  - 范围 `1-10`
- `search.searchDepth`
  - 默认 `basic`
- `search.topic`
  - 默认 `general`
- `extract.chunksPerSource`
  - 默认 `3`
  - 范围 `1-5`
- `extract.extractDepth`
  - 默认 `basic`
- `extract.format`
  - 默认 `markdown`
- `crawl.maxDepth`
  - 默认 `1`
  - 范围 `1-5`
- `crawl.pageLimit`
  - 默认 `25`
  - 范围 `1-100`
- `crawl.allowExternal`
  - 默认 `true`

## 当前实现位置

### UI

- `src/features/search/components/search-content.tsx`
  - Search 弹窗整体内容
- `src/features/search/components/search-connection-section.tsx`
  - Tavily key 与全局开关
- `src/features/search/components/search-web-section.tsx`
  - `web_search` 默认行为设置
- `src/features/search/components/search-extract-section.tsx`
  - `web_extract` 默认行为设置
- `src/features/search/components/search-crawl-section.tsx`
  - `web_crawl` 默认行为设置

### Settings Controller

- `src/features/search/hooks/use-search-settings.ts`

这里负责：

- 本地 draft state
- 保存
- 连接测试
- 保存反馈状态

### Search Settings Normalize / Access

- `src/features/search/settings.ts`

这里负责：

- `normalizeSearchSettings(...)`
- `hasSearchAccess(...)`

当前判断 Search 是否可用的条件是：

- `settings.enabled === true`
- `settings.tavilyApiKey.trim().length > 0`

### Tavily Client

- `src/features/search/server/tavily-client.ts`

这里负责：

- 统一 POST Tavily API
- 统一 Authorization header
- 非 `2xx` 时抛统一错误
- 用 `zod` 对返回数据做 parse

### 连接测试

- `src/app/api/search/test/route.ts`
- `src/features/search/server/tavily.ts`

当前测试调用的是 Tavily Search endpoint，而不是 crawl / extract。

测试查询固定为：

- `latest technology news`

测试返回：

- `answer`
- `resultCount`

### Chat Runtime Integration

- `src/features/chat/hooks/use-chat-session.ts`
  - 把 `profile.settings.search` 塞进 `/api/chat` 请求体
- `src/features/chat/server/schemas.ts`
  - 校验 `searchSettings`
- `src/features/chat/server/chat.ts`
  - 把 `searchSettings` 交给 request context
- `src/features/chat/server/chat-request-context.ts`
  - resolve settings
  - 创建 search tools
  - 与 sandbox / MCP tools 合并
- `src/features/chat/ai/tools/index.ts`
  - `buildSearchAgentTools(...)`
- `src/features/chat/ai/tools/web_search.ts`
- `src/features/chat/ai/tools/web_extract.ts`
- `src/features/chat/ai/tools/web_crawl.ts`

## 当前请求链路

### 1. 保存 Search 设置

```text
Search dialog
  -> useSearchSettings.save()
  -> workbench.setSearchSettings(...)
  -> useAppProfile.updateSearchSettings(...)
  -> normalizeProfileSettings(...)
  -> local profile or Supabase profiles.settings
```

### 2. Tavily 连接测试

```text
Search dialog
  -> POST /api/search/test
  -> validateRequest(searchTestSchema)
  -> testTavilyConnection(...)
  -> tavilyRequest(...)
  -> return resultCount
```

### 3. 聊天时注入 Search tools

```text
Search settings in profile
  -> useChatSession.prepareSendMessagesRequest(...)
  -> /api/chat
  -> loadChatRequestContext(...)
      -> resolve search settings
      -> buildSearchAgentTools(...)
      -> create web_search / web_extract / web_crawl
  -> runGenerateTextWorkflow(...)
  -> streamText({ tools })
```

## 当前三个工具的边界

### `web_search`

位置：

- `src/features/chat/ai/tools/web_search.ts`

用途：

- 查最新信息
- 查当前事件
- 查近期产品变化

输入：

- `query`
- `topic?`

输出：

- `answer`
- `query`
- `results[]`

### `web_extract`

位置：

- `src/features/chat/ai/tools/web_extract.ts`

用途：

- 用户直接给 URL
- 需要读取某个具体网页

输入：

- `urls[]`
- `query?`

输出：

- `failedCount`
- `results[]`

### `web_crawl`

位置：

- `src/features/chat/ai/tools/web_crawl.ts`

用途：

- 遍历文档站
- 检查多页面知识库

输入：

- `url`
- `instructions?`

输出：

- `resultCount`
- `results[]`

## 为什么 Search 已经算真实能力

因为它不只是“配置页已存在”。

当前已经完成了完整闭环：

- 用户能配置自己的 Tavily key
- 用户能保存这些配置
- 用户能做连接测试
- 聊天请求会带上这些配置
- 服务端会按配置决定是否注册 Search tools
- workflow 会把这些 tools 真正交给模型使用

这和当前 `Skills` 的成熟度不一样。

## 当前限制

- `Search` 当前只绑定 Tavily
- 连接测试错误仍是粗粒度成功 / 失败反馈
- 当前没有搜索缓存层
- 当前没有 quota / usage / cost 观测
- 当前没有 tool 结果的专门 UI 引用层
- 当前工具策略主要依赖 prompt 和基础 tool loop
- 还没有 provider fallback 或多 search provider 抽象

## 推荐下一步

1. 细化 Tavily 错误分类，至少区分 `401 / 429 / quota / network`
2. 给 `web_search / web_extract / web_crawl` 增加更清晰的聊天结果引用展示
3. 增加搜索缓存、usage 统计和成本观测
4. 视需要抽出 provider interface，再考虑第二个 search provider
5. 如果后续要让 search 成为更强策略层，再增加 tool routing / policy，而不是把逻辑塞回 UI
