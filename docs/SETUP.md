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
bun run lint         # ESLint 检查
bun run format       # Prettier 格式化
bun run format:check # 检查格式（不修改）
```

## 项目结构

详见 [docs/architecture.md](docs/architecture.md)
