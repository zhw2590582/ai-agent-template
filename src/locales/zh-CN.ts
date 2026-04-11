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
      enter_hint: 'Enter 发送，Shift + Enter 换行',
    },
    header: {
      show_sidebar: '显示侧边栏',
      hide_sidebar: '隐藏侧边栏',
    },
    sidebar: {
      agent_workspace: 'Agent 工作区',
      messages: '{count} 条消息',
      new_chat: '新对话',
      history: '历史记录',
      history_item: '记录 {index}',
      no_history: '还没有历史记录。先发一条消息，之后会出现在这里。',
      dark_mode_only: '仅支持暗色模式',
    },
    empty_state: {
      title: '今天想让 agent 帮你做什么？',
      description: '你可以直接聊天，也可以让它查时间、做计算，或者触发工具完成更具体的任务。',
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

  auth: {
    sign_in: '登录',
    title: '登录入口',
    description: '认证流程还未接入，这里预留为后续接入登录系统的入口页面。',
    back_to_chat: '返回聊天',
  },

  navigation: {
    providers: 'Providers',
    agents: 'Agents',
    plugins: 'Plugins',
    tools: 'Tools',
    skills: 'Skills',
    memory: 'Memory',
    settings: 'Settings',
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
    plugins: {
      title: 'Plugins 页面',
      description: '这里先保留为空页面，后续用于浏览和管理插件能力。',
    },
    tools: {
      title: 'Tools 页面',
      description: '这里先保留为空页面，后续用于查看和配置可调用工具。',
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
