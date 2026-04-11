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

## Tailwind CSS 规范 ⚠️

**严格要求**：所有 Tailwind 警告必须修复，不允许忽略。

### 必须遵守的规则

1. **使用标准类名而非任意值**

   ```tsx
   // ❌ 错误
   className = 'min-w-[96px]';

   // ✅ 正确
   className = 'min-w-24';
   ```

2. **important 修饰符位置**

   ```tsx
   // ❌ 错误
   className = 'dark:!bg-[var(--color)]';

   // ✅ 正确
   className = 'dark:bg-(--color)!';
   ```

3. **calc 表达式中的空格**

   ```tsx
   // ❌ 错误
   className = 'translate-y-[calc(-50%_-_2px)]';

   // ✅ 正确
   className = 'translate-y-[calc(-50%-2px)]';
   ```

4. **优先使用语义化尺寸**

   ```tsx
   // ❌ 避免自定义像素值
   className = 'rounded-[2px]';

   // ✅ 使用预定义尺寸
   className = 'rounded-xs';
   ```

### 检查方式

```bash
# 本地检查（会显示 Tailwind 警告）
bun run lint

# CI 中也会强制检查
bun run ci
```

### 为什么严格要求

- ✅ 保持代码一致性
- ✅ 利用 Tailwind 的优化
- ✅ 避免不必要的任意值
- ✅ 更好的类型提示和自动补全
- ✅ 减少打包体积

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

## i18n 约定

已集成 **next-intl** 实现完整的国际化支持。

### 目录结构

```
src/
├── app/
│   └── [locale]/        # 语言路由
│       ├── layout.tsx   # 带 i18n 的布局
│       └── page.tsx     # 页面
├── components/
│   └── language-switcher.tsx  # 语言切换组件
├── config/
│   └── i18n.ts          # i18n 配置
├── i18n/
│   └── request.ts       # next-intl 请求配置
├── locales/
│   ├── zh-CN.ts         # 中文翻译
│   └── en-US.ts         # 英文翻译
├── lib/
│   └── i18n.ts          # i18n 工具函数（与 next-intl 兼容）
└── proxy.ts             # 语言检测路由（Next.js 16+）
```

### 路由规则

- **URL 格式**: `/zh-CN/...` 或 `/en-US/...`
- **默认语言**: `zh-CN`
- **自动检测**: 根据浏览器语言自动重定向

### 翻译文件规范

1. **统一结构**：所有语言文件必须保持相同的嵌套结构
2. **命名约定**：使用 snake_case 命名翻译键
3. **模块化**：按功能域组织翻译（common, chat, tools, errors 等）
4. **类型安全**：英文翻译文件必须实现 `Translations` 类型

### 使用方式

#### Server Components

```typescript
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations();

  return <h1>{t('common.app_name')}</h1>;
}
```

#### Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations();

  return <button>{t('common.confirm')}</button>;
}
```

#### 嵌套命名空间

```typescript
const t = useTranslations('chat');
// 访问 chat.status.ready
const status = t('status.ready');
```

### 语言切换

使用 `LanguageSwitcher` 组件：

```typescript
import { LanguageSwitcher } from '@/components/language-switcher';

<LanguageSwitcher />;
```

```

### 添加新翻译

1. 在 `zh-CN.ts` 中添加键值
2. 在 `en-US.ts` 中添加对应翻译
3. TypeScript 会自动提示缺失的翻译

### 集成计划

Phase 2-3 完成后，考虑集成 `next-intl`：

- 服务端自动语言检测
- 路由级语言切换
- 日期、数字格式化
```
