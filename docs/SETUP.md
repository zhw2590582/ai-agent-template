# 项目设置指南

## 首次运行

1. **安装依赖**

   ```bash
   bun install
   ```

2. **配置环境变量**

   ```bash
   # 复制环境变量模板
   cp .env.example .env.local

   # 编辑 .env.local，填入你的 API Key
   ```

3. **启动开发服务器**

   ```bash
   bun dev
   ```

4. **访问应用**

   应用支持多语言访问：
   - **中文**: `http://localhost:3000/zh-CN`
   - **English**: `http://localhost:3000/en-US`
   - **默认**: `http://localhost:3000` (自动重定向到 zh-CN)

## 环境变量说明

必需的环境变量：

- `DEEPSEEK_API_KEY`: DeepSeek API Key（[获取地址](https://platform.deepseek.com/api_keys)）

可选的环境变量：

- `OPENAI_API_KEY`: 如果需要使用 OpenAI 模型

环境变量会在应用启动时自动验证，缺少必需变量会报错。

## 常用命令

```bash
# 开发
bun dev              # 启动开发服务器

# 构建
bun run build        # 生产构建
bun start            # 运行生产服务器

# 代码质量
bun run format       # Prettier 格式化（自动修复）
bun run format:check # 检查格式（不修改）
bun run lint         # ESLint 检查
bun run typecheck    # TypeScript 类型检查
bun run ci           # 完整 CI 检查（提交前运行）
```

### CI 检查说明

`bun run ci` 会依次执行：

1. `format:check` - 检查代码格式
2. `lint` - 检查代码质量
3. `typecheck` - 检查类型安全

建议在提交代码前运行此命令。

## 国际化

项目支持中英文切换：

- **翻译文件**: `src/locales/zh-CN.ts` 和 `src/locales/en-US.ts`
- **语言切换**: 使用 `<LanguageSwitcher />` 组件
- **详细文档**: [i18n-guide.md](i18n-guide.md)

## 项目结构

详见 [architecture.md](architecture.md)

## 开发规范

详见 [conventions.md](conventions.md)

## GitHub Actions

项目已配置 CI/CD 流程：

- **CI**: 每次 push 和 PR 都会运行 format/lint/typecheck/build
- **Deploy**: 合并到 main 后自动部署到 Vercel
- **Dependabot**: 自动检查依赖更新

详见 [.github/README.md](../.github/README.md)
