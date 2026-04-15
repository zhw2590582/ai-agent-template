# Skills Implementation

最后更新：2026-04-15

## 目标

这份文档描述当前项目里 `Skills` 的真实实现边界、数据结构、持久化方式，以及为什么它现在还不能算运行时能力。

重点回答这些问题：

1. `Skills` 现在做到了哪一步
2. skill 条目目前保存的到底是什么
3. 这些条目是怎么进入 `profile.settings` 的
4. 为什么它现在还没有接入聊天 runtime
5. 后续如果要把它变成真实能力，应该先补哪几层

## 当前范围

当前已经实现的是：

- 顶部 workbench 里的 `Skills` 弹窗
- `profile.settings.skills` 持久化
- Skills 全局开关
- 已存在 skill 条目的列表展示
- 已存在条目的编辑 / 删除
- 基于 `sourceUrl` 的名称和描述派生
- skill definition 的 normalize

当前还没有实现的是：

- 真实远程 skill 导入
- 真实 skill manifest 解析
- 新增 skill 的 UI 闭环
- capability 编辑
- compatibility 校验
- 聊天 runtime 接入
- prompt / tool / MCP / sandbox 的真实编排
- marketplace、版本、审计、缓存

所以当前 `Skills` 的准确定位是：

- **配置层脚手架**
- 不是已经可用的 **runtime skill system**

## 当前数据结构

位置：

- `src/features/skills/types.ts`

当前结构：

```ts
type SkillCapability = 'browser' | 'fs' | 'git' | 'http' | 'mcp' | 'prompt' | 'shell';

interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  sourceUrl: string;
  enabled: boolean;
  capabilities: SkillCapability[];
}

interface SkillsSettings {
  enabled: boolean;
  skills: SkillDefinition[];
}
```

语义：

- `enabled`
  - Skills 全局开关
  - 目前只影响配置层语义，不影响聊天 runtime
- `skills[]`
  - 用户保存的 skill 条目
- `sourceUrl`
  - 当前最核心字段
  - 当前名称和描述都主要从它派生
- `capabilities`
  - 当前只是兼容性提示字段
  - 还没有驱动任何真实权限或 runtime 逻辑

## Source Of Truth

当前 source of truth 是：

- `profile.settings.skills`

也就是说：

- guest 用户：本地 profile
- 登录用户：Supabase `profiles.settings`

Skills 配置并不是独立数据库表。

归一化入口在：

- `src/features/auth/profile/profile-settings.ts`
- `src/features/skills/settings.ts`

## 当前 normalize 规则

位置：

- `src/features/skills/settings.ts`

当前做了这些事：

- `sourceUrl` 为空时丢弃该条 skill
- `name` 为空时，从 URL 的最后一个 path segment 推导
- `description` 为空时，生成 `Imported from ...`
- `capabilities` 默认回退到 `['prompt']`
- `id` 缺失时，按索引生成 `skill-{n}`
- capability 只接受白名单：
  - `prompt`
  - `mcp`
  - `http`
  - `fs`
  - `shell`
  - `git`
  - `browser`

当前还有两个明显的“脚手架痕迹”：

- `createSkillDraft(...)`
  - 已存在
  - 但当前 UI 没有真正走新增闭环
- `SkillCapabilityBadges`
  - 组件已存在
  - 当前列表页没有使用

## 当前实现位置

### UI

- `src/features/skills/components/skills-content.tsx`
  - Skills 弹窗整体内容
- `src/features/skills/components/skill-list.tsx`
  - skill 列表、编辑 / 删除操作
- `src/features/skills/components/skill-editor-dialog.tsx`
  - 编辑弹窗

### Settings Controller

- `src/features/skills/hooks/use-skills-settings.ts`

这里负责：

- 本地 draft state
- 保存
- 编辑本地 skill 条目
- 删除本地 skill 条目

### Settings Normalize / URL Metadata

- `src/features/skills/settings.ts`

这里负责：

- `normalizeSkillsSettings(...)`
- `deriveSkillMetadataFromUrl(...)`
- capability 白名单

## 当前 UI 行为

当前用户能做的事：

- 开 / 关 Skills 全局开关
- 查看当前已保存的 skill 条目
- 编辑条目的：
  - `sourceUrl`
  - `enabled`
- 删除条目
- 在编辑弹窗里看到基于 URL 派生的：
  - 名称
  - 描述

当前用户不能做的事：

- 通过正常 UI 新增 skill
- 编辑 `capabilities`
- 拉远程 skill 元数据
- 测试 skill 是否可用
- 预览 skill manifest
- 把 skill 绑定到聊天行为

这里有一个容易误判的点：

- `SkillEditorDialog` 同时支持 `mode="add" | "edit"`
- 但当前 `SkillsContent` 只接了 `edit`
- `skill-list.tsx` 里的 “Import Skill” 按钮是禁用态，并显示 `In development`

所以当前新增流程只是代码预留，不是实际可用能力。

## 当前请求链路

### 1. 保存 Skills 设置

```text
Skills dialog
  -> useSkillsSettings.save()
  -> workbench.setSkillsSettings(...)
  -> useAppProfile.updateSkillsSettings(...)
  -> normalizeProfileSettings(...)
  -> local profile or Supabase profiles.settings
```

### 2. 编辑 / 删除已有条目

```text
Skills dialog
  -> local draft update
  -> save()
  -> persist whole skills settings
```

也就是说，当前没有单独的 `/api/skills/*`。

Skills 只是 `profile.settings` 聚合对象里的一个字段。

## 为什么 Skills 现在还不是运行时能力

当前代码里 `skillsSettings` 只出现在：

- `src/features/chat/components/workbench/chat-workbench.tsx`
- `src/features/chat/hooks/use-chat-workbench.ts`
- `src/features/auth/profile/use-app-profile.ts`

当前没有出现的地方：

- `/api/chat` 请求体
- `chat-request-context.ts`
- `chat/ai/tools/*`
- `streamText(...)` 的 tools 构造
- 任何 prompt 注入层

也就是说：

- Skills 当前不会进入聊天请求
- 服务端不会 resolve `skillsSettings`
- 打开或关闭 Skills 不会改变 assistant 的运行时行为

所以目前的 `Skills` 更接近：

- 一个待完成的 skill registry 草稿层

而不是：

- 一个已经接入 agent orchestration 的能力层

## 当前限制

- 新增 skill 按钮仍是禁用态
- skill 元数据当前只从 URL 派生，不读远程 manifest
- `capabilities` 目前不能编辑，也没有被 UI 展示
- 没有 skill 下载、缓存、版本和签名校验
- 没有 compatibility 检查
- 没有任何运行时注入逻辑
- 没有与 `Search / MCP / Sandbox` 的真正能力映射

## 和其它能力的关系

`Skills` 不应该直接等同于：

- Search
- MCP
- Sandbox

更合理的理解是：

- `Search / MCP / Sandbox` 是底层能力提供者
- `Skills` 是未来的能力编排、模板或提示层

所以后续接入顺序应该是：

1. 先把 skill manifest / metadata / import 流程做实
2. 再定义 skill 如何声明需要哪些底层能力
3. 再决定 skill 最终是注入：
   - prompt
   - tool policy
   - workflow
   - 还是 runtime capability bundle

不要反过来先把 `Skills` 做成一个模糊的万能执行层。

## 推荐下一步

1. 打通“导入 skill”按钮，至少完成新增条目闭环
2. 定义远程 skill manifest 结构，而不是继续只靠 URL 派生名称/描述
3. 把 `capabilities` 从隐藏字段变成真正可见、可校验的兼容性声明
4. 明确 skill 的 runtime contract：
   - 只是 prompt 模板
   - 还是能声明工具依赖
   - 还是能声明 workflow 行为
5. 在 runtime contract 明确之后，再接 `/api/chat` 和 request context
