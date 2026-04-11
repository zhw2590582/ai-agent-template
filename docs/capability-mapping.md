# Capability Mapping

这是一份简表，用来说明教程能力和当前项目状态的关系。

| 能力                | 当前状态   | 说明                                      | 推荐接入点                  |
| ------------------- | ---------- | ----------------------------------------- | --------------------------- |
| Tool Use            | 已实现     | 已有天气、计算器、时间工具                | `src/server/ai/tools/`      |
| Memory              | 已预留边界 | 还没有持久化和历史回放                    | `src/server/ai/memory/`     |
| RAG                 | 已预留边界 | 还没有检索和来源展示                      | `src/server/ai/rag/`        |
| Context Engineering | 部分具备   | 已有 prompt 分层，但没有 context pipeline | `src/server/ai/prompts.ts`  |
| Planning            | 已预留边界 | `types.ts` 有基础类型，功能未落地         | `src/server/ai/planners/`   |
| Multi-Agent         | 已预留边界 | 还没有真实 agent orchestration            | `src/server/ai/agents/`     |
| Observability       | 基础具备   | 有日志和错误处理，没有 tracing/metrics    | `src/lib/logger.ts`         |
| Evaluation          | 未开始     | 没有评估链路                              | `src/server/ai/evaluation/` |
| Trustworthy AI      | 未开始     | 没有审批流、策略校验层                    | validation + approval flow  |
| Agentic Protocols   | 未开始     | 没有协议层实现                            | protocol layer              |

更具体的项目现状，看 [project-status.md](./project-status.md)。

更具体的开发顺序，看 [roadmap.md](./roadmap.md)。
