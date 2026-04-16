# i18n Guide

## 当前实现

项目使用 `next-intl`，支持：

- `en-US`（默认）
- `zh-CN`

路由形式：

- `/zh-CN/...`
- `/en-US/...`

## 关键文件

- [src/app/[locale]/layout.tsx](../src/app/[locale]/layout.tsx)
- [src/i18n/request.ts](../src/i18n/request.ts)
- [src/config/i18n.ts](../src/config/i18n.ts)
- [src/i18n/locales/zh-CN.ts](../src/i18n/locales/zh-CN.ts)
- [src/i18n/locales/en-US.ts](../src/i18n/locales/en-US.ts)
- [src/i18n/locales/blocks](../src/i18n/locales/blocks)
- [src/components/ui-settings/language-switcher.tsx](../src/components/ui-settings/language-switcher.tsx)
- [src/proxy.ts](../src/proxy.ts)

## 检测顺序

当前运行时主要由 `next-intl` 的 locale 路由处理中间层接管，整体优先级可以理解为：

1. URL locale
2. Locale cookie
3. `Accept-Language`
4. 默认语言

当前默认语言是 `en-US`。

聊天 API 自己还有一层 locale 兜底逻辑，会从 `?lang=`、cookie 和 `Accept-Language` 再判断一次。

## 维护规则

- 聚合入口和 block 文件都必须保持相同结构
- 新增用户可见文本时，要同步更新中英文
- 翻译 key 用稳定语义命名，不要用临时编号
- 导航文案和占位页文案要一起维护，避免单语缺失

## 当前文件组织

现在的 locale 组织方式是：

1. `src/i18n/locales/blocks/<locale>/*`
   按领域拆分消息块，例如 `chat.ts`、`models.ts`、`auth.ts`、`shared.ts`
2. `src/i18n/locales/<locale>.ts`
   只做聚合导出

## 新增翻译

1. 先判断它属于哪个领域 block
2. 在 `src/i18n/locales/blocks/zh-CN/*.ts` 中加键
3. 在 `src/i18n/locales/blocks/en-US/*.ts` 中补对应值
4. 运行 `bun run typecheck`

## 备注

i18n 已经是当前真实功能，不是预留能力。
