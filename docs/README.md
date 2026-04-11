# Docs

这套文档不再按“教程步骤”组织，而是按“长期演进的应用工程”组织。

如果你后面会持续实现更多 AI Agent 能力，建议按这个顺序阅读：

1. [architecture.md](./architecture.md) - 系统架构和分层设计
2. [conventions.md](./conventions.md) - 代码规范和实现原则
3. [roadmap.md](./roadmap.md) - 功能演进路线图
4. [capability-mapping.md](./capability-mapping.md) - 与教程内容的对照分析

保留的参考资料：

- `ai-agents-for-beginners/`：理论与模式参考
- `mcp-for-beginners/`：MCP 与工具协议参考

## 文档目标

- 让当前代码结构易读、易改、易扩展
- 为未来增加记忆、RAG、规划、多代理等能力预留清晰边界
- 降低“功能越来越多但目录越来越乱”的风险

## 当前文档清单

- [architecture.md](./architecture.md): 当前系统分层、职责边界和扩展入口
- [conventions.md](./conventions.md): 代码组织、命名、文件职责和实现原则
- [roadmap.md](./roadmap.md): 后续功能演进建议与推荐实现顺序（Phase 1 已完成 ✅）
- [capability-mapping.md](./capability-mapping.md): 与 `ai-agents-for-beginners` 的功能对照、实现难度分析和详细路径

## 快速开始

**如果你是新加入的开发者**，按这个顺序阅读：

1. 先看 [architecture.md](./architecture.md) 了解整体结构
2. 再看 [conventions.md](./conventions.md) 了解编码规范
3. 准备开发新功能时看 [capability-mapping.md](./capability-mapping.md)

**如果你想了解后续规划**：

- 直接看 [roadmap.md](./roadmap.md)
- 详细实现路径看 [capability-mapping.md](./capability-mapping.md)
