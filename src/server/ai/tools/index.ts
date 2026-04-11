/**
 * AI Agent 工具集
 *
 * 功能:
 * 1. 为首页聊天界面提供一组通用的服务器端工具
 * 2. 演示 AI SDK 的工具调用能力
 * 3. 为工具调用可视化组件提供真实数据来源
 */

import { calculate } from './calculator';
import { getDateTime } from './datetime';
import { getWeatherInformation } from './weather';

/**
 * 导出统一工具集合，便于在 API 路由中直接注册。
 */
export const agentTools = {
  getWeatherInformation,
  calculate,
  getDateTime,
};

/**
 * 导出单个工具，便于其他模块单独引用
 */
export { calculate, getDateTime, getWeatherInformation };
