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
