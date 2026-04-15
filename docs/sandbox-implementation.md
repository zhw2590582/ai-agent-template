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
- 执行策略开关：
  - `allowFilesystem`
  - `allowCommands`
  - `allowPty`
  - `allowInternetAccess`
  - `allowFileUpload`
  - `allowFileDownload`
- 默认环境变量文本配置
- 顶部按钮：
  - `Test connection`
  - `Get API key`

当前还没有实现的是：

- 真实 `E2B` SDK client
- `/api/sandbox/test`
- sandbox lifecycle 管理
- 命令执行
- 文件上传 / 下载 / 读写
- chat tools 注入
- skill runtime 兼容层
- 成本、审计、缓存、运行记录

所以当前 `Sandbox` 功能更准确地说是：

- **Sandbox settings management**
- 不是完整的 **sandbox runtime integration**

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

- 优先研究和接入 `e2b`
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
  - template / timeout / workdir / secure / autoPause
- `src/features/sandbox/components/sandbox-access-section.tsx`
  - 执行策略开关
- `src/features/sandbox/components/sandbox-environment-section.tsx`
  - 环境变量输入

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
  -> useAppProfile.updateSandboxSettings(...)
  -> /api/profile
  -> normalizeProfileSettings(...)
  -> profile.settings.sandbox
  -> localStorage or Supabase
```

也就是说，当前 `Sandbox` 还没有进入 chat runtime。

## V1 推荐推进顺序

### Step 1. `/api/sandbox/test`

目标：

- 验证 API key 是否可用
- 验证能否创建最小 sandbox
- 立即关闭 sandbox

当前只做：

- create
- close

不要在这个阶段就把命令执行和文件同步一起塞进去。

### Step 2. `src/features/sandbox/server/e2b-client.ts`

目标：

- 抽出统一的 `E2B` server-side adapter

建议前期只封装：

- `createSandbox`
- `closeSandbox`
- `runCommand`
- `readFile`
- `writeFile`

### Step 3. sandbox tools

目标：

- 先把最小工具接进聊天

建议第一批工具只考虑：

- `sandbox_run_command`
- `sandbox_write_file`
- `sandbox_read_file`

这时才需要决定如何把 `access.*` 映射成真正的 tool gating。

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

- [ ] 安装 `e2b`
- [ ] 研究官方 JS SDK 的最小接入方式
- [ ] 新增 `/api/sandbox/test`
- [ ] 新增 `src/features/sandbox/server/e2b-client.ts`
- [ ] 把 `Test connection` 按钮接成真实能力
- [ ] 评估第一批 sandbox tools 的输入 / 输出 schema

## 相关文档

- [project-status.md](./project-status.md)
- [architecture.md](./architecture.md)
- [roadmap.md](./roadmap.md)
- [capability-mapping.md](./capability-mapping.md)
- E2B docs: https://e2b.dev/docs
