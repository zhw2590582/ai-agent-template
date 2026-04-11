# i18n 集成指南

## 概述

项目已完整集成 **next-intl** 实现国际化支持。

## 架构

### 文件结构

```
src/
├── app/
│   └── [locale]/              # 语言路由层
│       ├── layout.tsx         # 包含 NextIntlClientProvider
│       └── page.tsx           # 首页
├── components/
│   └── language-switcher.tsx  # 语言切换组件
├── config/
│   └── i18n.ts               # 语言配置（SUPPORTED_LOCALES, DEFAULT_LOCALE）
├── i18n/
│   └── request.ts            # next-intl 请求配置
├── locales/
│   ├── zh-CN.ts              # 中文翻译
│   └── en-US.ts              # 英文翻译
├── lib/
│   └── i18n.ts               # 工具函数（getMessages 等）
└── proxy.ts                  # 语言检测和重定向（Next.js 16+）
```

### 路由规则

- **中文**: `/zh-CN/...`
- **英文**: `/en-US/...`
- **默认**: 访问 `/` 自动重定向到 `/zh-CN`
- **检测**: 优先级顺序
  1. URL 中的 locale 参数
  2. Cookie (NEXT_LOCALE)
  3. Accept-Language header
  4. 默认语言 (zh-CN)

## 使用方法

### Server Components

```typescript
import { useTranslations } from 'next-intl';

export default function ServerComponent() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t('common.app_name')}</h1>
      <p>{t('chat.input_placeholder')}</p>
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations();

  return <button>{t('common.confirm')}</button>;
}
```

### 使用命名空间

```typescript
// 使用 'chat' 命名空间
const t = useTranslations('chat');

// 访问 chat.status.ready
const status = t('status.ready');
```

### 语言切换

```typescript
import { LanguageSwitcher } from '@/components/language-switcher';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>
        <LanguageSwitcher />
      </header>
      <main>{children}</main>
    </div>
  );
}
```

## 添加新翻译

### 1. 在 zh-CN.ts 添加键值

```typescript
// src/locales/zh-CN.ts
const zhCN = {
  // ... 现有翻译
  newFeature: {
    title: '新功能',
    description: '这是一个新功能',
  },
};
```

### 2. 在 en-US.ts 添加对应翻译

```typescript
// src/locales/en-US.ts
export const enUS: Translations = {
  // ... 现有翻译
  newFeature: {
    title: 'New Feature',
    description: 'This is a new feature',
  },
};
```

TypeScript 会自动检测缺失的翻译键！

### 3. 在组件中使用

```typescript
const t = useTranslations('newFeature');
<h2>{t('title')}</h2>;
```

## 高级功能

### 日期格式化

```typescript
import { useFormatter } from 'next-intl';

const format = useFormatter();
const formattedDate = format.dateTime(new Date(), {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

### 数字格式化

```typescript
const format = useFormatter();
const formattedNumber = format.number(1234.56, {
  style: 'currency',
  currency: 'CNY',
});
```

### 复数规则

```typescript
// 在翻译文件中
messages: {
  items: '{count, plural, =0 {no items} =1 {one item} other {# items}}';
}

// 在组件中
t('items', { count: 5 }); // => "5 items"
```

## 最佳实践

### DO ✅

- 使用语义化的翻译键名 (`common.app_name` 而不是 `title1`)
- 按功能模块组织翻译 (`chat.*`, `tools.*`, `errors.*`)
- 为所有用户可见文本添加翻译
- 使用 TypeScript 类型检查确保翻译完整性

### DON'T ❌

- 不要硬编码文本 (`'确认'` → 使用 `t('common.confirm')`)
- 不要在翻译键中包含动态值
- 不要跨命名空间访问 (保持命名空间隔离)
- 不要忘记添加英文翻译

## 配置选项

### 修改默认语言

```typescript
// src/config/i18n.ts
export const DEFAULT_LOCALE: Locale = 'en-US'; // 改为英文
```

### 添加新语言

1. 在 `SUPPORTED_LOCALES` 添加语言代码
2. 创建新的翻译文件 (如 `locales/ja-JP.ts`)
3. 在 `LOCALE_CONFIG` 添加语言信息

```typescript
// src/config/i18n.ts
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US', 'ja-JP'] as const;

export const LOCALE_CONFIG: Record<Locale, { name: string; flag: string }> = {
  'zh-CN': { name: '简体中文', flag: '🇨🇳' },
  'en-US': { name: 'English', flag: '🇺🇸' },
  'ja-JP': { name: '日本語', flag: '🇯🇵' },
};
```

## 故障排查

### 翻译不显示

1. 检查翻译键是否正确
2. 确认语言文件已导入到 `lib/i18n.ts`
3. 清理 `.next` 目录重新构建

### 路由重定向不正确

1. 检查 middleware 配置
2. 清除浏览器 cookie
3. 检查 `SUPPORTED_LOCALES` 配置

### TypeScript 类型错误

1. 确保 `en-US.ts` 实现了 `Translations` 类型
2. 运行 `bun run typecheck` 查看详细错误
3. 确保所有语言文件结构一致

## 参考资料

- [next-intl 官方文档](https://next-intl-docs.vercel.app/)
- [Next.js i18n 路由](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
