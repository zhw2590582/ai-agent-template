# Sandbox Implementation

最后更新：2026-04-15

## 目标

这份文档描述当前项目里 `Sandbox` 的实现边界、为什么当前选择 `E2B`、前期计划接入哪些能力，以及后续扩展时需要遵守的原则。

重点回答这些问题：

1. 当前 `Sandbox` 到底已经做了什么
2. 为什么当前只考虑 `E2B`
3. 前期到底该接入哪些能力，不该接哪些能力
4. `Sandbox settings` 怎么存
5. 后续如果接入真实 runtime、chat tools、skills，该往哪里放

## 当前范围

当前已经实现的是：

- 顶部 workbench 中的 `Sandbox` 弹窗
- `profile.settings.sandbox` 的读写与归一化
- `E2B API Key`、`template`、`timeout`、`workingDirectory`
- `allowInternetAccess`
- 默认环境变量文本配置
- 顶部按钮：
  - `Test connection`
  - `Get API key`
- 已安装 `e2b`
- `/api/sandbox/test`
- `src/features/sandbox/server/e2b-client.ts`
- 第一批 sandbox tools：
  - `sandbox_run_command`
  - `sandbox_read_file`
  - `sandbox_write_file`
- V1 运行时边界：
  - 文件路径限制在 `workingDirectory` 之内
  - 命令超时会被限制在安全上限内
  - 命令输出和文件读取结果会被统一截断
- V1 session lifecycle：
  - 单次 chat request 内懒创建并复用同一个 sandbox
  - request 完成后关闭
  - 空闲窗口后自动回收
  - 遇到可恢复的连接错误时自动重建一次
- 聊天请求时会把可用 sandbox tools 合并进现有 agent tools

当前还没有实现的是：

- skill runtime 兼容层
- 成本、审计、缓存、运行记录
- 跨请求 sandbox session 复用
- 持久化 volumes / snapshots

所以当前 `Sandbox` 功能更准确地说是：

- **Sandbox settings management**
- 不是完整的 **sandbox runtime integration**

当前 UI 暴露给用户的 V1 设置，已经收口为：

- `enabled`
- `apiKey`
- `timeoutSeconds`
- `workingDirectory`
- `allowInternetAccess`
- `template` 和 `envVarsText`
  - 作为 `Advanced` 折叠区保留

当前没有暴露在 UI 上，但仍保留在 settings 结构中的字段：

- `allowCommands`
- `allowFilesystem`
- `allowPty`
- `allowFileUpload`
- `allowFileDownload`
- `secure`
- `autoPause`

原因：

- 这些字段要么当前没有完整能力承接
- 要么属于产品内部策略，不适合前期直接给最终用户配置
- 要么虽然在 runtime 中部分生效，但会给用户造成“关闭后为什么 sandbox 几乎不可用”的误解

当前额外约束：

- 隐藏的 `allowCommands` / `allowFilesystem` 不再决定 V1 tool 是否暴露
- 只要 sandbox 已启用且有有效 API key，V1 默认提供 `run_command / read_file / write_file`
- 这样可以避免旧 profile 遗留值导致“UI 看不到开关，但能力被关闭”

## 为什么当前只考虑 E2B

当前项目在 `Sandbox` 上不做多 provider abstraction，原因很简单：

1. 当前真实需求还没有大到需要 provider switching
2. 过早把 `Sandbox` 设计成多 provider，会先把 schema、UI、server adapter 做复杂
3. 当前 roadmap 的重点是先把占位页推进成真实能力，不是先做通用平台层

因此当前结论是：

- `Sandbox` 默认就是 `E2B`
- UI 不暴露 provider 选择
- `SandboxSettings` 也不再保留 provider 字段

如果未来真的要支持第二家 sandbox provider，再单独评估是否需要抽象层。

## 前期只接哪些能力

当前建议前期只接四类最小能力：

### 1. Create sandbox

用途：

- 连接测试
- runtime 探活
- 初始化一次隔离会话

### 2. Commands

用途：

- 执行 shell 命令
- 跑脚本
- 安装依赖
- 执行测试

这会是后续 agent 最核心的 sandbox 能力。

### 3. Filesystem

用途：

- 写文件
- 读文件
- 上传 / 下载产物

这是后续 coding / artifact 场景必须的基础层。

### 4. Lifecycle

最少要有：

- create
- close

后续再逐步考虑：

- pause / resume
- set timeout
- reconnect

## 当前不建议优先接的能力

前期不建议马上接：

- desktop / computer use
- browser automation
- snapshots
- volumes / persistence
- public URL / port exposure
- MCP gateway
- 大规模模板系统
- 多租户运行记录
- 复杂审批流

这些能力都可能有价值，但不是当前阶段最值当的第一批能力。

## V1 安全边界

当前 sandbox tools 已经加上的约束：

- `sandbox_read_file` 和 `sandbox_write_file`
  - 只能访问 `workingDirectory` 以内的路径
  - 不允许通过绝对路径或 `..` 逃逸出 workspace root
- `sandbox_run_command`
  - `cwd` 同样限制在 `workingDirectory` 以内
  - 超时时间会被限制在 V1 上限内
- 输出控制
  - 命令 stdout/stderr 会截断
  - 文件读取结果会截断
  - 单次写文件内容大小有限制

这些边界是为了让 V1 足够可控，而不是为了做一套完整的策略系统。

## V1 Session Lifecycle

当前 session 模型刻意保持简单：

- 一个 chat request 内只创建一个 `SandboxSession`
- 只有第一次真正调用 sandbox tool 时，才懒创建 E2B sandbox
- 后续同一请求中的多个 sandbox tool 调用复用同一实例
- request 完成时统一关闭
- 如果中途空闲超出短窗口，会自动回收
- 如果读写文件时遇到常见的可恢复错误，会自动重建一次后重试当前操作
- `run_command` 不会自动重试，避免有副作用的命令被重复执行

当前明确不做的事情：

- 不做跨请求复用池
- 不做全局 session registry
- 不做 pause / resume orchestration
- 不做复杂的 failure state machine

这样做的原因很简单：前期先把行为收敛清楚，比过早做“智能 session 管理”更重要。

## 是否需要新的 npm 依赖

需要。

当前项目里还没有 `E2B` SDK 依赖。

当前建议优先安装：

```bash
bun add e2b
```

原因：

- 当前目标是做通用 sandbox runtime
- 不是做 notebook / code interpreter 产品
- 当前更需要的是 sandbox + commands + filesystem + lifecycle

因此当前默认方向是：

- 已接入 `e2b`
- 暂不优先接 `@e2b/code-interpreter`

如果后续目标变成“让模型直接运行结构化代码片段并返回结果对象”，再单独评估是否补 `@e2b/code-interpreter`。

## Source Of Truth

当前 source of truth 是：

- `profile.settings.sandbox`

也就是说：

- guest 用户：本地 profile
- 登录用户：Supabase `profiles.settings`

当前 `Sandbox` 配置不是单独的数据库表。

## 当前数据结构

位置：

- `src/features/sandbox/types.ts`

当前结构：

```ts
interface SandboxAccessSettings {
  allowCommands: boolean;
  allowFileDownload: boolean;
  allowFileUpload: boolean;
  allowFilesystem: boolean;
  allowInternetAccess: boolean;
  allowPty: boolean;
}

interface SandboxSettings {
  access: SandboxAccessSettings;
  apiKey: string;
  autoPause: boolean;
  enabled: boolean;
  envVarsText: string;
  secure: boolean;
  template: string;
  timeoutSeconds: number;
  workingDirectory: string;
}
```

注意：

- `SandboxSettings` 当前是“运行时配置 + 预留策略字段”的混合结构
- 并不等于“所有字段都应该在前端设置面板展示”
- 后续如果 UI 继续收口，可以考虑把用户设置和内部策略拆开

语义：

- `enabled`
  - sandbox 全局开关
  - 未来决定聊天时是否允许接 sandbox tools
- `apiKey`
  - 当前是用户自己的 `E2B API Key`
- `template`
  - 默认 runtime template
- `timeoutSeconds`
  - 默认生命周期窗口
- `workingDirectory`
  - 默认工作目录
- `envVarsText`
  - 文本形式的环境变量输入
- `access.*`
  - 当前只是策略声明
  - 后续会变成真正的 tool gating / runtime policy 输入

## 当前实现位置

### UI

- `src/features/sandbox/components/sandbox-content.tsx`
  - Sandbox 弹窗整体内容
- `src/features/sandbox/components/sandbox-connection-section.tsx`
  - API key 与启用开关
- `src/features/sandbox/components/sandbox-runtime-section.tsx`
  - timeout / workdir / internet access
- `src/features/sandbox/components/sandbox-environment-section.tsx`
  - `Advanced` 折叠区
  - template / 环境变量输入

### Settings Controller

- `src/features/sandbox/hooks/use-sandbox-settings.ts`
  - Sandbox settings draft、保存、重置

### Settings Normalize

- `src/features/sandbox/settings.ts`
  - `normalizeSandboxSettings(...)`
  - `hasSandboxAccess(...)`

### Config

- `src/config/sandbox.ts`
  - 默认 template、timeout、workdir

### Server Runtime

- `src/features/sandbox/server/e2b-client.ts`
  - `Sandbox.create(...)`
  - env vars 解析
  - create / close
  - workspace path 约束
  - run command
  - read file / write file
  - 懒创建、空闲回收、故障重建
- `src/features/sandbox/server/test.ts`
  - sandbox connection test helper

### Test API

- `src/app/api/sandbox/test/route.ts`
  - E2B create + kill 最小探活

### Chat Tools

- `src/features/chat/ai/tools/sandbox_run_command.ts`
- `src/features/chat/ai/tools/sandbox_read_file.ts`
- `src/features/chat/ai/tools/sandbox_write_file.ts`
- `src/features/chat/ai/tools/index.ts`
  - `buildSandboxAgentTools(...)`

### Profile Persistence

- `src/features/auth/profile/use-app-profile.ts`
  - `updateSandboxSettings(...)`
- `src/features/auth/profile/profile-settings.ts`
  - 把 sandbox 归并进 `AppProfileSettings`
- `src/app/api/profile/route.ts`
  - `sandbox` 请求体校验

## 当前请求链路

```text
Sandbox UI
  -> workbench dialog
  -> useSandboxSettings
  -> /api/sandbox/test (connection test)
  -> useAppProfile.updateSandboxSettings(...)
  -> /api/profile
  -> normalizeProfileSettings(...)
  -> profile.settings.sandbox
  -> localStorage or Supabase

Chat request
  -> /api/chat
  -> resolve sandbox settings
  -> create lazy SandboxSession
  -> build sandbox tools from access policy
  -> merge with search / MCP tools
  -> close sandbox on finish
```

也就是说，当前 `Sandbox` 已经进入 chat runtime，但还是最小版：

- 只有三个基础 tools
- 还没有运行记录、审批、缓存、持久 sandbox
- 还没有与 skills 做兼容层

## V1 推荐推进顺序

### Step 1. `/api/sandbox/test`

目标：

- 验证 API key 是否可用
- 验证能否创建最小 sandbox
- 立即关闭 sandbox

当前已做：

- create
- close

这一步当前不会执行额外命令，只做最小探活。

### Step 2. `src/features/sandbox/server/e2b-client.ts`

目标：

- 抽出统一的 `E2B` server-side adapter

当前已封装：

- `createSandbox`
- `closeSandbox`
- `runCommand`
- `readFile`
- `writeFile`

### Step 3. sandbox tools

目标：

- 先把最小工具接进聊天

当前第一批工具：

- `sandbox_run_command`
- `sandbox_write_file`
- `sandbox_read_file`

当前已经把 `access.*` 映射成最小 tool gating：

- `allowCommands`
  - 控制 `sandbox_run_command`
- `allowFilesystem`
  - 控制 `sandbox_read_file`
  - 控制 `sandbox_write_file`

### Step 4. skills compatibility

目标：

- 让一部分依赖文件系统 / 命令执行的 skill 变成可执行

但这一步必须建立在 sandbox tools 已经稳定的前提上。

## 关键原则

### 1. 先做 runtime，再谈 skills

`skills` 不是底层能力。

当前顺序必须是：

- sandbox runtime
- sandbox tools
- skill compatibility

不要反过来。

### 2. 先做最小可验证闭环

比起先做大量 schema 和 fancy UI，当前更重要的是：

- API key 可测试
- sandbox 可创建
- sandbox 可关闭

这是最小闭环。

### 3. 不要过早做多 provider abstraction

当前只有 `E2B` 真实需求，先把它做好。

### 4. `access.*` 只是策略输入，不是最终安全保证

后续即使有这些开关，也不能只靠前端配置保证安全。

真正执行时还需要：

- server-side gating
- tool-level permission check
- 运行时超时与资源限制
- 审计 / 日志 / 失败处理

## 当前待办

- [x] 安装 `e2b`
- [x] 研究官方 JS SDK 的最小接入方式
- [x] 新增 `/api/sandbox/test`
- [x] 新增 `src/features/sandbox/server/e2b-client.ts`
- [x] 把 `Test connection` 按钮接成真实能力
- [x] 接入第一批 sandbox tools
- [ ] 细化 sandbox test 错误反馈
- [ ] 评估 command / file output 截断和展示样式
- [ ] 增加 tool 使用日志与运行记录
- [ ] 评估是否需要持久 sandbox session / reconnect

## 相关文档

- [project-status.md](./project-status.md)
- [architecture.md](./architecture.md)
- [roadmap.md](./roadmap.md)
- [capability-mapping.md](./capability-mapping.md)
- E2B docs: https://e2b.dev/docs
