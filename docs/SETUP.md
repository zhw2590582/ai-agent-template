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

## 必需环境变量

- `DEEPSEEK_API_KEY`

可选：

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

环境变量会在应用启动时由 [src/config/env.ts](../src/config/env.ts) 校验。

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

## 相关文档

- 项目现状：[project-status.md](./project-status.md)
- 架构说明：[architecture.md](./architecture.md)
- 测试说明：[testing.md](./testing.md)
