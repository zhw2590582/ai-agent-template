# Capability Mapping

这是一份简表，用来说明“教程中的 agent 能力”和“当前项目代码现状”的关系。

| 能力                     | 当前状态   | 说明                                                  | 当前接入点                          |
| ------------------------ | ---------- | ----------------------------------------------------- | ----------------------------------- |
| Tool Use                 | 已预留骨架 | 工具注册入口还在，但当前没有默认启用的真实工具        | `src/features/chat/ai/tools/`       |
| Conversation Persistence | 已实现     | 登录用户的会话可创建、保存、分页、搜索                | `src/features/chat/storage/`        |
| Auth                     | 已实现     | Supabase 社交登录和 profile 同步已接通                | `src/features/auth/`                |
| Model / Provider Config  | 已实现     | 用户可配置 provider、同步模型、自定义 provider/model  | `src/features/models/`              |
| Context Engineering      | 部分具备   | 已有系统 prompt 分层，但没有完整 context pipeline     | `src/features/chat/ai/prompts.ts`   |
| Memory                   | 已实现     | 会话摘要、长期记忆、跨会话注入、Memory 管理 UI 已接通 | `src/features/memory/`              |
| RAG                      | 已预留边界 | 还没有检索和来源展示                                  | `src/features/rag/`                 |
| Planning                 | 已预留边界 | 类型和导航边界存在，功能未落地                        | `src/features/chat/server/types.ts` |
| Multi-Agent / Subagent   | 已预留边界 | 导航和页面存在，但没有真实 orchestration              | `src/features/subagent/`            |
| Sandbox                  | 已实现 V1  | 已有设置 UI、连接测试、E2B runtime 接入与首批 tools   | `src/features/sandbox/`             |
| MCP                      | 部分具备   | 远程 MCP tools integration 已接通，但能力仍不完整     | `src/features/mcp/`                 |
| Skills                   | 占位       | 只有导航和占位页                                      | `src/features/skills/`              |
| Observability            | 基础具备   | 有日志和错误处理，没有 tracing/metrics                | `src/lib/logger.ts`                 |
| Evaluation               | 未开始     | 没有评估链路                                          | 待定                                |
| Trustworthy AI           | 未开始     | 没有审批流、策略校验层                                | 待定                                |

更具体的项目现状，看 [project-status.md](./project-status.md)。

更具体的开发顺序，看 [roadmap.md](./roadmap.md)。
