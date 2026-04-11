import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 使用 jsdom 环境支持 DOM API
    environment: 'jsdom',

    // 全局测试设置
    globals: true,

    // 测试设置文件
    setupFiles: ['./vitest.setup.ts'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        '**/types.ts',
        'src/app/**', // Next.js 路由文件
      ],
    },

    // 测试文件匹配模式（统一放在 tests 目录）
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],

    // 排除目录
    exclude: ['node_modules', 'dist', '.next', '.idea', '.git', 'build'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
