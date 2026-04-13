export const zhCNMemoryMessages = {
  memory_page: {
    controls: {
      title: 'Memory 控制',
      description: 'Memory 配置会基于 Supabase 持久化的会话摘要和长期记忆逐步接入。',
      enabled: '已启用',
      disabled: '未启用',
      scope_account: '账号记忆',
      scope_guest: '访客模式',
      notice_title: 'Memory V1',
      notice_authenticated:
        '会话摘要已经开始用于上下文压缩。长期记忆和可配置控制项会在下一阶段接入。',
      notice_guest: '访客模式可以保留本地会话，但长期记忆只会对已登录账号开放。',
    },
    saved_memories: {
      title: '已保存记忆',
      description: '当记忆写入能力启用后，长期偏好和稳定事实会出现在这里。',
      empty_title: '还没有已保存记忆',
      empty_description:
        'Memory V1 会把稳定的用户偏好和事实存到 Supabase，而不是只临时拼进 prompt。',
    },
    summaries: {
      title: '会话摘要',
      description: '这些摘要就是后续可重新注入聊天上下文的压缩信息。',
      empty_title: '还没有摘要',
      empty_description: '当某个会话超过短上下文窗口，并且助手完成回复后，这里会开始出现摘要。',
    },
  },
} as const;
