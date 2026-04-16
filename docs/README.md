# Docs

给 AI 和协作者的最小阅读顺序：

1. [project-status.md](./project-status.md)
   当前真实能力、边界和缺口
2. [architecture.md](./architecture.md)
   当前代码结构和主链路
3. [agent-harness.md](./agent-harness.md)
   只在修改聊天 runtime 时看
4. [conventions.md](./conventions.md)
   开发约束和改动原则
5. [roadmap.md](./roadmap.md)
   下一阶段推荐顺序
6. [review-findings.md](./review-findings.md)
   按 feature 复盘时记录的真实问题

运行和维护相关：

- [SETUP.md](./SETUP.md): 本地启动、环境变量、常用命令
- [testing.md](./testing.md): 测试命令、测试分层、当前覆盖范围
- [i18n-guide.md](./i18n-guide.md): 国际化实现方式和扩展规则

参考资料目录：

- `ai-agents-for-beginners/`: AI Agent 理论与设计模式参考
- `mcp-for-beginners/`: MCP 协议与工具化参考
- `multi-agent/`: 多代理协调模式、拆分边界和何时值得引入多代理的参考
  - [multi-agent-coordination-patterns.md](./multi-agent/multi-agent-coordination-patterns.md)
  - [building-multi-agent-systems-when-and-how-to-use-them.md](./multi-agent/building-multi-agent-systems-when-and-how-to-use-them.md)
  - [ai-sdk-subagents.md](./multi-agent/ai-sdk-subagents.md)

文档约定：

- 能力边界统一收口到 [project-status.md](./project-status.md)
- 不再为每个 feature 单独维护一份长实现文档
- 只有当某个主题需要独立设计约束时，才保留单独文档，例如 [agent-harness.md](./agent-harness.md)
