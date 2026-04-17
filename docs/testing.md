# Testing

## 当前测试栈

- Vitest
- React Testing Library
- jsdom

## 常用命令

```bash
bun test
bun run test:run
bun run test:unit
bun run test:integration
bun run test:coverage
```

`bun run test:e2e` 目前只是占位命令，还没有真实 E2E 套件。

## Supabase Inspector

排查登录用户、会话持久化、memory consolidation 这类线上数据问题时，优先用仓库内置的管理员脚本：

```bash
bun run inspect:supabase user <userId>
bun run inspect:supabase conversation <conversationId>
```

前置条件：

- `.env.local` 或当前 shell 里已经配置：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

脚本入口：

- [scripts/inspect-supabase.ts](../scripts/inspect-supabase.ts)

当前能力：

- `user <userId>`
  - 返回该用户的 auth user、profile、最近会话列表、全部 memories
- `conversation <conversationId>`
  - 返回该会话记录、所属 profile、关联 memories

当前默认限制：

- 最近会话列表最多返回 `20` 条
- 上限来自 [src/config/dev.ts](../src/config/dev.ts) 的 `SUPABASE_INSPECTOR_CONVERSATION_LIMIT`

典型排查场景：

- 某个用户的 `profile` / `preference` / `workflow` / `fact` memory 为什么没有被 consolidation
- 某条 conversation 是否真的写入了数据库
- conversation 和 memory 的 `conversation_id` 是否对得上
- profile settings 或 locale 是否是预期值

说明：

- 这个脚本直接使用 Supabase service role，只用于本地开发和管理员排查
- 不要把输出直接贴到公开渠道，里面可能包含用户 profile、memory 和 settings

## 当前测试分层

```text
tests/
├── unit/
├── integration/
└── e2e/
```

当前现实情况：

- `unit/` 有基础组件和工具测试
- `integration/` 有聊天 API 相关测试
- `e2e/` 只有占位目录

## 当前测试重点

已有覆盖主要集中在：

- i18n
- 错误处理
- 语言切换
- chat route 和部分模型行为

还需要补的高价值测试：

1. 主题 hydration 场景
2. 聊天主链路更多边界情况
3. 工具调用结果展示
4. 真正的 E2E

## 建议

- 改服务端链路时，至少跑 `bun run test:run`
- 改 UI 交互时，补对应组件测试
- 要合并前，跑 `bun run ci`
