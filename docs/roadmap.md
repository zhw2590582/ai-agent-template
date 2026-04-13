# Roadmap

这份路线图只保留当前建议顺序，不复述已经完成的历史细节。

## Now

### 1. Memory V1 收尾

目标：把当前已落地的 Memory V1 打磨成可持续维护的能力。

优先做：

1. memory import
2. 进一步的记忆归并与规范化
3. 更稳定的相关性检索
4. Memory 行为测试补齐

推荐落点：

- `src/features/memory/`
- `src/features/chat/server/`
- `src/features/chat/storage/`

### 2. Provider / Models 整理

目标：把当前较浅的模型配置整理成更可扩展的 provider abstraction。

优先做：

1. 统一模型定义
2. provider 配置和默认策略
3. 模型可用性检查
4. 失败回退策略

推荐落点：

- `src/features/chat/ai/core/models.ts`
- `src/config/app.ts`
- 需要时再拆新的模型配置文件

## Next

### 3. 页面去占位化

目标：让导航中的关键页面变成真实页面，而不是 workbench 占位视图。

优先做：

1. `Models`
2. `Sandbox`
3. `MCP`
4. `Settings`

### 4. RAG

目标：让回答可以基于外部知识源。

优先做：

1. 文档切片
2. 向量存储
3. retrieval 注入
4. 来源展示 UI

## Later

### 5. Planning

目标：支持多步骤任务拆解与执行。

### 6. Multi-Agent / Subagent

目标：支持多个 specialized agents 协作。

### 7. Production Readiness

目标：补齐 tracing、权限、审计、E2E，并在需要时把当前内存限流升级为集中式后端。

## 当前不建议优先做

- 重写现有聊天主链路
- 过早引入数据库抽象层
- 为占位页面设计完整 UI 系统
- 在没有真实需求前引入重型 agent framework
- 在 provider 抽象未理顺前同时接太多模型供应商
