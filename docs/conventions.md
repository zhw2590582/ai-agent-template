# Conventions

这份文档只保留当前最重要的开发约束。

## 基本原则

- 保持目录浅，不为了“未来可能会用到”过度拆分
- 一个文件只负责一个明确职责
- 先复用现有组件，再考虑新增抽象
- 优先修正真实问题，不制造新的框架层
- 新依赖要有明确收益

## 目录规则

### `src/app`

- 只放路由入口和布局
- `page.tsx`、`layout.tsx`、`route.ts` 保持薄
- 不把业务逻辑、模型逻辑、工具逻辑塞进这里

### `src/features`

- 按业务域拆分
- 当前只有 `features/chat` 是真实业务域
- 新功能成熟后再升格为独立 feature，不要为占位页提前建一整套目录

### `src/components`

- `components/ui`: 基础 UI
- `components/ai-elements`: AI 聊天相关组件
- 业务域优先组合这些已有组件，不重复造基础控件

### `src/server`

- 放模型、工具、prompt、chat handler 和后续编排逻辑
- 不引入客户端概念

## 命名规则

- 文件名使用 kebab-case
- 页面级组合组件使用 `*-page.tsx`
- 服务端入口文件使用明确语义，如 `chat.ts`
- 工具文件按工具语义命名，如 `weather.ts`、`datetime.ts`

## 实现约束

### 前端

- 页面只负责组装
- 组件内部只处理自己的 UI 和交互
- 纯前端 helper 放到 `features/<domain>/lib`

### 服务端

- `route.ts` 只负责调用 handler
- handler 负责请求编排
- 模型、prompt、工具各自分层

## 主题约束

- 当前支持亮色和暗色切换，但不要为每个业务模块维护两套独立设计
- 优先使用语义化 token：`bg-background`、`text-foreground`、`border-border`
- 主题状态必须避免 hydration mismatch，服务端和客户端首帧要基于同一主题来源

## Tailwind 约束

- `bun run lint` 出现的 Tailwind 警告要修，不要忽略
- 优先使用标准类名和语义尺寸
- 任意值只在确实没有标准类可表达时使用

## 依赖策略

优先使用已有技术栈：

- Next.js
- React
- AI SDK
- AI Elements
- shadcn/ui
- Zod

没有明确收益时，不主动引入：

- 全局状态库
- ORM
- 重型表单框架
- 额外 UI 系统
- 复杂动画库

## 文档规则

更新文档时，优先写这些信息：

- 当前真实状态
- 已完成范围
- 哪些仍是占位
- 改动后的边界和实现位置
- 下一步推荐动作

不要再写成一次性教程式文档。

## i18n 规则

- URL 使用 `/zh-CN/...` 和 `/en-US/...`
- 所有语言文件必须保持相同结构
- 翻译 key 使用稳定语义命名
- 新增用户可见文本时，同步更新中英文翻译
