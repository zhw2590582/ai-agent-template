# 测试指南

本项目使用 **Vitest** 作为测试框架，配合 React Testing Library 进行组件测试。

## 快速开始

### 运行测试

```bash
# 交互式监听模式（开发时推荐）
bun test

# 运行一次所有测试（CI 使用）
bun run test:run

# 带 UI 界面的测试
bun run test:ui

# 生成测试覆盖率报告
bun run test:coverage
```

### 运行特定测试

```bash
# 运行特定文件
bun test src/lib/errors.test.ts

# 运行匹配的测试
bun test calculator

# 监听模式下按 'p' 过滤文件名
```

## 测试文件组织

### 目录结构

测试文件与源文件放在同一目录，使用 `.test.ts` 或 `.test.tsx` 后缀：

```
src/
├── lib/
│   ├── errors.ts
│   ├── errors.test.ts     # 单元测试
│   ├── i18n.ts
│   └── i18n.test.ts
├── components/
│   ├── language-switcher.tsx
│   └── language-switcher.test.tsx  # 组件测试
└── server/
    └── ai/
        └── tools/
            ├── calculator.ts
            └── calculator.test.ts
```

### 命名约定

- **单元测试**: `*.test.ts` - 测试纯函数、工具类
- **组件测试**: `*.test.tsx` - 测试 React 组件
- **集成测试**: `*.integration.test.ts` - 测试多个模块协作

## 编写测试

### 单元测试示例

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01');
    expect(formatDate(date)).toBe('2024-01-01');
  });

  it('should handle invalid date', () => {
    expect(() => formatDate(null as any)).toThrow();
  });
});
```

### 组件测试示例

```typescript
// src/components/button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should handle click event', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### 异步测试示例

```typescript
// src/server/api.test.ts
import { describe, it, expect } from 'vitest';
import { fetchData } from './api';

describe('fetchData', () => {
  it('should fetch data successfully', async () => {
    const result = await fetchData('test');
    expect(result).toBeDefined();
  });

  it('should throw on error', async () => {
    await expect(fetchData('invalid')).rejects.toThrow();
  });
});
```

## Mocking

### Mock 函数

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();
mockFn('hello');

expect(mockFn).toHaveBeenCalledWith('hello');
expect(mockFn).toHaveBeenCalledOnce();
```

### Mock 模块

```typescript
// 自动 mock
vi.mock('./module', () => ({
  someFunction: vi.fn(() => 'mocked'),
}));

// 部分 mock
vi.mock('./module', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    someFunction: vi.fn(),
  };
});
```

### 全局 Mocks

项目已在 `vitest.setup.ts` 中配置了常用 mocks：

- **Next.js navigation**: `useRouter`, `usePathname`, `useSearchParams`
- **next-intl**: `useTranslations`, `useLocale`, `useFormatter`

## 测试覆盖率

### 查看覆盖率

```bash
bun run test:coverage
```

覆盖率报告会生成在 `coverage/` 目录：

- `coverage/index.html` - HTML 报告
- `coverage/coverage-final.json` - JSON 数据

### 覆盖率目标

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## 最佳实践

### DO ✅

- **一个测试一个断言**（或紧密相关的几个）
- **使用描述性的测试名称**（should/when/given）
- **测试公共 API，不测试实现细节**
- **使用 `describe` 分组相关测试**
- **清理副作用**（自动通过 `afterEach(cleanup)`）
- **Mock 外部依赖**（API、数据库、第三方服务）

### DON'T ❌

- **不要测试第三方库的功能**
- **不要过度 mock**（影响测试可信度）
- **不要在测试中使用真实的 API 调用**
- **不要忽略测试失败**
- **不要写脆弱的测试**（依赖具体的实现细节）

## 调试测试

### 使用 VS Code 调试器

1. 在测试文件中设置断点
2. 按 F5 或点击 "Run and Debug"
3. 选择 "Vitest" 配置

### 使用 console.log

```typescript
it('should do something', () => {
  const result = myFunction();
  console.log(result); // 会在测试输出中显示
  expect(result).toBe(expected);
});
```

### 只运行特定测试

```typescript
// 只运行这个测试
it.only('should only run this', () => {
  // ...
});

// 跳过这个测试
it.skip('should skip this', () => {
  // ...
});

// 标记为 TODO
it.todo('should implement this later');
```

## CI 集成

测试已集成到 CI pipeline：

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: bun run test:run
```

每次 push 或 PR 都会自动运行测试。

## 常见问题

### Q: 测试运行很慢？

A: 使用 `test:run` 而非 `test`，或者限制测试范围：

```bash
bun test src/lib  # 只测试 lib 目录
```

### Q: jsdom 环境限制？

A: 某些浏览器 API 在 jsdom 中不可用（如 `IntersectionObserver`）。解决方案：

```typescript
// vitest.setup.ts
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

### Q: React 组件测试报错？

A: 确保使用 `@testing-library/react` 的最新版本，并查看是否需要 mock Router 或 i18n。

## 参考资料

- [Vitest 官方文档](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
