export const zhCNSearchMessages = {
  search_page: {
    title: '网页搜索',
    description: '填写你的 Tavily key，让助手在需要时查询最新网页信息。',
    enabled_label: '启用网页搜索',
    enabled_description: '当问题需要当前信息或网页信息时，允许助手调用 Tavily。',
    api_key_label: 'Tavily API key',
    api_key_description: '这个 key 会保存在你的 profile 设置里，并只用于你的聊天请求。',
    api_key_placeholder: '输入你的 Tavily API key',
    api_key_hint: '如果还没配置 key，可以先保持关闭。',
    get_api_key: '获取 API key',
    toast: {
      save_failed: '搜索设置保存失败。',
      save_success: '搜索设置已保存。',
    },
  },
} as const;
