# Setup

## 首次运行

```bash
bun install
cp .env.example .env.local
bun run dev
```

访问地址：

- 中文：`http://localhost:3000/zh-CN`
- 英文：`http://localhost:3000/en-US`
- 默认：`http://localhost:3000`

## 环境变量

最低可运行配置：

- 无

聊天模型改为在应用内 `/models` 页面配置，默认不再依赖服务端预置模型 API Key。

当前 `/models` 页支持：

- 预置 provider 配置
- 自定义 provider 新增 / 删除
- 测试连接并同步模型列表
- 自定义模型新增 / 编辑 / 删除
- guest 本地存储和登录用户数据库持久化

如果要启用登录和会话持久化，还需要：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

如果要启用额外平台能力，还预留了这些变量：

- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `NEXT_PUBLIC_SENTRY_DSN`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `MEM0_API_KEY`
- `E2B_API_KEY`
- `TAVILY_API_KEY`

环境变量会在应用启动时由 [src/config/env.ts](../src/config/env.ts) 校验；当前核心依赖是 Supabase，模型接入由用户自行填写 provider 配置。

## 常用命令

```bash
bun run dev
bun run build
bun run start

bun run format
bun run format:check
bun run lint
bun run typecheck
bun run test:run
bun run ci
```

## 提交前最低检查

```bash
bun run ci
```

它会执行：

1. `format:check`
2. `lint`
3. `typecheck`
4. `test:run`

## 当前现实说明

- 不配 Supabase 也能本地跑聊天，但登录和会话持久化不可用
- `test:e2e` 目前仍是占位命令
- `/api/mcp` 目前只是占位接口，不需要额外配置

## 相关文档

- 项目现状：[project-status.md](./project-status.md)
- 架构说明：[architecture.md](./architecture.md)
- 测试说明：[testing.md](./testing.md)
