export const zhCNAuthMessages = {
  auth: {
    sign_in: '登录',
    title: '登录到 AI Agent',
    description:
      '当前已接入 Supabase 社交登录。登录后，后续会话持久化和 memory 能力会基于你的账号展开。',
    sign_in_with_google: '使用 Google 登录',
    sign_in_with_github: '使用 GitHub 登录',
    terms_agreement: '注册即表示你同意我们的',
    terms_of_service: '服务条款',
    privacy_policy: '隐私政策',
    signed_in_as: '当前登录账号',
    sign_out: '退出登录',
    configuration_missing_title: 'Supabase 配置缺失',
    configuration_missing_description:
      '请先在环境变量中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY，再使用社交登录。',
    errors: {
      sign_in_failed: '登录失败，请重试',
      sign_out_failed: '退出登录失败，请重试',
    },
    toast: {
      sign_out_success: '已退出登录',
    },
  },
} as const;
