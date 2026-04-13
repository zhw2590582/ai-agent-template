export const zhCNAuthMessages = {
  auth: {
    sign_in: '登录',
    title: '登录到 AI Agent',
    description:
      '当前已接入 Supabase 社交登录。登录后，后续会话持久化和 memory 能力会基于你的账号展开。',
    back_to_chat: '返回聊天',
    sign_in_with_google: '使用 Google 登录',
    sign_in_with_github: '使用 GitHub 登录',
    terms_agreement: '注册即表示你同意我们的',
    terms_of_service: '服务条款',
    privacy_policy: '隐私政策',
    github_description: '将跳转到 GitHub 完成授权，然后回到当前应用。',
    oauth_description: '将跳转到对应平台完成授权，然后回到当前应用。',
    signed_in_as: '当前登录账号',
    signed_in_description:
      '你已经完成登录。接下来可以直接返回聊天页，后续会基于登录态接入会话存储和 memory。',
    continue_to_chat: '进入聊天',
    sign_out: '退出登录',
    configuration_missing_title: 'Supabase 配置缺失',
    configuration_missing_description:
      '请先在环境变量中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY，再使用社交登录。',
    errors: {
      oauth_callback:
        '登录回调失败，请检查 Supabase Redirect URL 以及 Google / GitHub OAuth 配置。',
      sign_in_failed: '登录失败，请重试',
      sign_out_failed: '退出登录失败，请重试',
    },
    toast: {
      sign_out_success: '已退出登录',
    },
  },
} as const;
