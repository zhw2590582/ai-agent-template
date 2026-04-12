/**
 * 中文翻译文件
 *
 * 说明：
 * - 这是项目的主要语言文件
 * - 使用嵌套对象组织翻译
 * - 每个功能模块有独立的命名空间
 */

const zhCN = {
  common: {
    app_name: 'AI Agent 应用',
    welcome: '欢迎',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    back: '返回',
    back_to_chat: '返回聊天',
    next: '下一步',
    previous: '上一步',
    search: '搜索',
    filter: '筛选',
    reset: '重置',
    submit: '提交',
  },

  chat: {
    title: '通用 AI Agent',
    subtitle: 'chatgpt.com inspired',
    welcome_message:
      '我是一个通用 AI Agent。你可以直接聊天，也可以让我查时间、做计算，或调用工具来辅助回答。',
    input_placeholder: '输入消息...',
    send: '发送',
    stop: '停止',
    actions: {
      retry: '重试',
      regenerate: '重新生成',
      copy: '复制',
      copy_response: '复制回答',
    },
    composer: {
      placeholder: '给 AI Agent 发送消息',
      workspace_hint: '宽屏工作区，支持流式回复与工具调用',
      model_label: '模型',
    },
    header: {
      show_sidebar: '显示侧边栏',
      hide_sidebar: '隐藏侧边栏',
    },
    sidebar: {
      agent_workspace: 'AI Agent',
      messages: '{count} 条消息',
      current: '当前',
      new_chat: '新对话',
      history: '历史记录',
      history_item: '记录 {index}',
      history_empty_title: '还没有历史记录',
      no_history: '还没有历史记录。先发一条消息，之后会出现在这里。',
      no_preview: '这段会话还没有可展示的摘要。',
      dark_mode_only: '仅支持暗色模式',
      loading_more: '加载更多…',
      search_placeholder: '搜索对话…',
      options_label: '对话选项',
      rename: '重命名',
      delete: '删除',
    },
    empty_state: {
      title: '今天想让 agent 帮你做什么？',
      description: '',
    },
    retry: '重试',
    regenerate: '重新生成',
    status: {
      ready: '就绪',
      thinking: '思考中',
      error: '错误',
    },
    errors: {
      network: '网络错误，请重试',
      rate_limit: '请求过于频繁',
      server: '服务器错误',
      request_failed: '请求失败。请检查 DEEPSEEK_API_KEY 配置，或稍后重试。',
      unknown: '未知错误',
      invalid_conversation: '对话不存在或已被删除',
      create_conversation_failed: '创建对话失败，请重试',
      send_message_failed: '发送消息失败，请重试',
      load_more_failed: '加载更多对话失败',
    },
    toast: {
      copied: '已复制到剪贴板',
      copy_failed: '复制失败',
    },
    models: {
      deepseek_chat: 'DeepSeek Chat',
      deepseek_coder: 'DeepSeek Coder',
    },
  },

  tools: {
    weather: {
      name: '天气查询',
      description: '查询城市天气信息',
    },
    calculator: {
      name: '计算器',
      description: '执行数学计算',
    },
    datetime: {
      name: '时间查询',
      description: '获取当前时间',
    },
  },

  settings: {
    title: '设置',
    language: '语言',
    theme: '主题',
    // 未来扩展
  },

  theme: {
    switch_to_light: '切换到浅色模式',
    switch_to_dark: '切换到深色模式',
  },

  auth: {
    sign_in: '登录',
    title: '登录到 AI Agent',
    description:
      '当前已接入 Supabase 社交登录。登录后，后续会话持久化和 memory 能力会基于你的账号展开。',
    dialog_description: '使用社交账号快速登录。当前弹窗支持 Google 和 GitHub。',
    back_to_chat: '返回聊天',
    sign_in_with_google: '使用 Google 登录',
    sign_in_with_github: '使用 GitHub 登录',
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

  navigation: {
    providers: 'Providers',
    agents: 'Agents',
    sandbox: 'Sandbox',
    mcp: 'MCP',
    skills: 'Skills',
    memory: 'Memory',
    settings: 'Settings',
    search: 'Search',
  },

  placeholders: {
    providers: {
      title: 'Providers 页面',
      description: '这里先保留为空页面，后续用于管理模型提供商和连接配置。',
    },
    agents: {
      title: 'Agents 页面',
      description: '这里先保留为空页面，后续用于管理 agent 角色、策略和执行配置。',
    },
    sandbox: {
      title: 'Sandbox 页面',
      description: '这里先保留为空页面，后续用于测试与调试能力。',
    },
    mcp: {
      title: 'MCP 页面',
      description: '这里先保留为空页面，后续用于管理 MCP 连接与工具。',
    },
    skills: {
      title: 'Skills 页面',
      description: '这里先保留为空页面，后续用于管理技能包和工作流。',
    },
    memory: {
      title: 'Memory 页面',
      description: '这里先保留为空页面，后续用于查看和控制记忆策略与存储。',
    },
    settings: {
      title: 'Settings 页面',
      description: '这里先保留为空页面，后续用于应用级设置和偏好配置。',
    },
    search: {
      title: 'Search 页面',
      description: '这里先保留为空页面，后续用于搜索功能。',
    },
  },

  errors: {
    config_missing: '系统配置缺失，请联系管理员',
    config_invalid: '系统配置无效，请联系管理员',
    api_key_invalid: 'API Key 无效，请检查配置',
    api_rate_limit: '请求过于频繁，请稍后再试',
    api_timeout: '请求超时，请重试',
    api_network: '网络连接失败，请检查网络',
    input_invalid: '输入内容无效',
    input_too_long: '输入内容过长',
    model_error: 'AI 模型服务异常',
    model_overload: 'AI 服务负载过高，请稍后重试',
    tool_execution_error: '工具执行失败',
    unknown: '未知错误，请稍后重试',
  },
};

/**
 * 翻译类型（用于类型推断）
 * 将所有字符串字面量转换为 string 类型
 */
type DeepStringify<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepStringify<T[K]> }
    : T;

export type Translations = DeepStringify<typeof zhCN>;

export { zhCN };
