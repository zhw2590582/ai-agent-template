export const zhCNSharedMessages = {
  common: {
    app_name: 'AI Agent Template',
    welcome: '欢迎',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    disabled: '未开启',
    enabled: '已开启',
    save: '保存',
  },
  theme: {
    switch_to_light: '切换到浅色模式',
    switch_to_dark: '切换到深色模式',
  },
  navigation: {
    models: 'Models',
    subagent: 'Subagent',
    sandbox: 'Sandbox',
    mcp: 'MCP',
    skills: 'Skills',
    rag: 'RAG',
    memory: 'Memory',
    settings: 'Settings',
    search: 'Search',
  },
  placeholders: {
    models: {
      title: '模型页面',
      description: '这里先保留为空页面，后续用于管理模型和连接配置。',
    },
    subagent: {
      title: 'Subagent 页面',
      description: '这里先保留为空页面，后续用于管理 subagent 角色、策略和执行配置。',
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
    rag: {
      title: 'RAG 页面',
      description:
        '这里先保留为空页面，后续用于管理知识库索引、检索链路、召回策略与答案 grounding 配置。',
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
} as const;
