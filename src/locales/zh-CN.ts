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
    input_placeholder: '输入消息...',
    send: '发送',
    stop: '停止',
    retry: '重试',
    regenerate: '重新生成',
    status: {
      ready: '就绪',
      thinking: '思考中',
      error: '错误',
    },
    quick_prompts: {
      title: '快速提示',
      // 预留快速提示词
    },
    errors: {
      network: '网络错误，请重试',
      rate_limit: '请求过于频繁',
      server: '服务器错误',
      unknown: '未知错误',
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
