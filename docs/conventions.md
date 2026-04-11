# Conventions

## General Principles

- 保持目录浅，不为了“看起来企业级”而制造过深层级
- 一个文件只负责一个明确职责
- 优先复用第三方组件，不重复造基础 UI
- 先建立边界，再增加复杂度
- 在真正需要之前，不引入新依赖

## Directory Rules

### `app`

- 只放路由入口
- `page.tsx` 和 `route.ts` 尽量保持薄

### `features`

- 按功能域拆分，不按技术类型散落
- 每个功能域可以拥有自己的 `components`、`lib`、`pages`

### `components`

- `components/ui`: 基础 UI
- `components/ai-elements`: 聊天与 AI 原生组件

规则：

- 如果 UI 能用 AI Elements 或 shadcn/ui 表达，就不要新建一套平行组件
- 对第三方组件的修改要尽量小且可解释

### `server`

- 放模型、工具、agent orchestration、存储接入
- 不把客户端概念混进来

## Naming

- 文件名使用 kebab-case
- 页面组合组件使用 `xxx-page.tsx`
- 服务端入口逻辑使用明确名称，如 `chat.ts`
- 工具文件按工具语义命名，如 `weather.ts`、`datetime.ts`

## Implementation Style

### 前端

- 优先组合已有组件
- 页面组件负责组装，不负责细节实现
- 纯数据转换或 message helper 放到 `features/<domain>/lib`

### 服务端

- route 只转发到 handler
- handler 负责 orchestration
- 工具定义独立管理
- prompt 文本后续要独立抽离

## Theming

当前项目固定为暗黑主题。

规则：

- 不同时维护亮色和暗色两套业务样式
- 默认使用语义 token：`bg-background`、`text-foreground`、`border-border`
- 不在业务组件里散落硬编码亮色背景

## Dependency Policy

当前策略是“少而够用”。

允许优先使用：

- Next.js
- AI SDK
- AI Elements
- shadcn/ui 生成的源码组件
- zod

避免在没有明确收益前引入：

- 全局状态库
- ORM
- 复杂主题系统
- 重型表单框架
- 额外动画库

## Documentation Rule

文档不再写成一次性的“逐步教程”。

后续文档优先更新这些维度：

- 当前结构
- 设计决策
- 新能力如何接入
- 哪些边界已经存在
- 哪些边界需要继续拆分
