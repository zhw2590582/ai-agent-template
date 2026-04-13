export const zhCNModelsMessages = {
  models_page: {
    eyebrow: '模型',
    title: '模型提供商',
    description:
      '这个页面用于管理第三方模型接入信息。未登录时配置保存在本地设备，登录后则写入你的 profile.settings，后续聊天、沙盒和 agent 能力都可以复用这一份模型配置。',
    storage: {
      local: '本地草稿',
      database: '数据库配置',
    },
    status: {
      enabled: '已开启',
      disabled: '未开启',
    },
    sidebar: {
      title: '模型提供商',
      description: '先选择提供商，再填写 API 信息与模型列表。',
      toggle_provider: '切换提供商启用状态',
    },
    providers: {
      dialog_title: '添加自定义提供商',
      dialog_description: '先创建一个提供商，再在右侧继续填写 API 信息并测试连接。',
      delete_title: '删除自定义提供商',
      delete_description: '确认删除 “{provider}” 吗？该提供商及其模型配置会一并移除。',
      name_label: '提供商名称',
      name_placeholder: '例如 My OpenAI Gateway',
      duplicate_name: '这个提供商名称已经存在。',
    },
    detail: {
      title_suffix: '提供商设置',
      helper:
        '完成 API Key、Base URL 和协议格式配置后，可以直接测试连接，并从提供商同步最新模型列表。',
    },
    fields: {
      api_key: 'API Key',
      get_api_key: '获取 API Key',
      api_key_placeholder: '输入你的 API Key',
      base_url: 'API Base URL',
      api_format: 'API 格式',
      api_format_hint:
        '请根据提供商支持的协议格式进行选择，目前优先支持 OpenAI 兼容和 Anthropic 兼容。',
    },
    formats: {
      anthropic: 'Anthropic 兼容',
      openai: 'OpenAI 兼容',
    },
    models: {
      title: '可用模型列表',
      description: '同步到的模型可以直接启用，也可以补充自己的自定义模型。',
      name_placeholder: '模型显示名称',
      id_placeholder: '模型 ID，例如 gpt-4.1-mini',
      duplicate_id: '这个模型 ID 已经存在。',
      delete_title: '删除自定义模型',
      delete_description: '确认删除 “{model}” 吗？这条自定义模型配置会被移除。',
      syncing: '正在同步模型列表...',
    },
    actions: {
      import: '导入',
      export: '导出',
      add_model: '添加模型',
      add_provider: '添加自定义提供商',
      delete_provider: '删除提供商',
      edit_model: '编辑模型',
      test_connection: '测试连接',
      testing_connection: '测试中...',
      saved: '已保存',
      reset: '取消',
      save: '保存',
      saving: '保存中...',
      loading: '加载中...',
    },
    toast: {
      import_success: '配置导入成功',
      import_failed: '配置导入失败，请检查 JSON 格式',
      load_failed: '加载模型配置失败',
      provider_config_required: '请先填写 API Key 和 Base URL',
      save_local_success: '模型配置已保存到本地',
      save_success: '模型配置已保存',
      save_failed: '模型配置保存失败',
      test_connection_success: '连接成功，已同步 {count} 个模型。',
      test_connection_failed: '连接失败，请检查 API Key、Base URL 和协议格式。',
    },
  },
} as const;
