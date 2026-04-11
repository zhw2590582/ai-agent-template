# 第 4 章：Tool Use Design Pattern

第四章是一个真正的分水岭。

如果说前面三章还在帮你建立认知，那么从这一章开始，课程终于进入了 agent 最核心的能力之一：

**tool use。**

你可以把第四章压缩成一句话：

**没有工具的 agent，很多时候只是“会说话”；有工具的 agent，才开始真正“会做事”。**

## 这一章最重要的结论

1. tool use 是让 LLM 从“回答问题”升级到“执行任务”的关键。
2. tool 本质上就是 agent 可以调用的函数、API 或外部系统能力。
3. function calling 是 tool use 的底层机制。
4. tool 越强，agent 能力越强，但风险也越高。
5. 有副作用的工具必须考虑审批、校验和权限控制。

## 1. 什么是 Tool Use Design Pattern

Tool Use Design Pattern，就是给 LLM 外接工具，让它为了完成目标去调用这些工具。

工具可以很简单：

- 计算器函数
- 查时间函数

也可以很复杂：

- 调天气 API
- 查数据库
- 调 CRM
- 发邮件
- 执行代码
- 调搜索服务

你可以这样理解：

**LLM 负责判断“该做什么”，tool 负责真正完成“怎么做”。**

## 2. 为什么 tool use 这么重要

因为纯 LLM 有天然限制：

- 知识可能过时
- 不能直接访问实时数据
- 不能直接操作外部系统
- 不能稳定完成精确计算和事务操作

一旦加上 tool，它就可以：

- 查实时信息
- 访问数据库
- 执行代码
- 调外部 API
- 自动化流程

所以第四章其实在告诉你：

**agent 的上限，很多时候不是模型大小决定的，而是工具体系决定的。**

## 3. 这一章列出的典型使用场景

- `Dynamic Information Retrieval`
- `Code Execution`
- `Workflow Automation`
- `Customer Support`
- `Content Generation and Editing`

规律是：

**只要问题的答案不完全在模型脑子里，而要依赖外部世界，tool use 几乎就会出现。**

## 4. Tool Use 的关键构件有哪些

这一章强调，tool use 不只是“注册个函数”这么简单，它至少包含：

- `Function/Tool Schemas`
- `Function Execution Logic`
- `Message Handling System`
- `Tool Integration Framework`
- `Error Handling & Validation`
- `State Management`

## 5. function calling 到底是什么

标准流程是：

1. 你把工具 schema 发给模型
2. 模型根据用户请求挑选一个工具
3. 模型返回“要调哪个函数”和“参数是什么”
4. 你的代码执行这个函数
5. 把函数结果回给模型
6. 模型再基于结果生成最终回答

重点：

**模型第一次返回的通常不是最终答案，而是一个 tool call。**

## 6. 如果不靠框架，你要自己做什么

如果直接用 LLM API 实现 tool use，通常要手写：

- 工具 schema
- messages 管理
- 解析 tool call
- 提取参数
- 执行函数
- 把 tool result append 回历史
- 再发第二次模型请求

所以 lesson 4 延续了第二章的主题：

**tool use 可以手写，但框架能极大减少样板代码。**

## 7. Microsoft Agent Framework 在这一章做了什么抽象

notebook 里主要做了 4 件事：

- 用 `@tool` 把函数注册成工具
- 用类型注解和 docstring 自动形成 schema
- 把多个工具挂到 agent 上
- 用 `approval_mode` 控制是否需要人工批准

## 8. 这一章代码里真正想教你的是什么

### 工具 schema 很重要

模型理解工具，靠的是：

- 函数名
- 参数名
- 参数类型
- `Annotated` 描述
- docstring

也就是说：

**工具的接口设计，就是 prompt engineering 的一部分。**

### 多个工具可以组合

agent 不一定只调用一次工具，它可以为了一个请求串多个工具。

### 副作用工具要管控

像 `book_flight` 这样的工具和“查信息”不是一个风险等级。

所以：

**读操作可以自动跑，写操作、交易操作、不可逆操作应该有人审批。**

## 9. structured output 在第四章里的位置

这一章还把第三章的“结构化输出”带进来了。

原因是：

**成熟的 tool-use agent，不应该只会输出自然语言，而要能把工具结果整理成稳定结构。**

## 10. 可信 AI 的重点

tool use 的风险，不在模型“说错话”，而在模型“做错事”。

所以至少要考虑：

- 最小权限
- 只读优先
- 参数校验
- 人工审批
- 安全执行环境
- 错误隔离
- 审计日志

## 11. 你学完第四章，应该真正得到什么

- tool 是 agent 真正行动能力的来源
- function calling 是其底层机制
- schema 设计直接影响 agent 调用效果
- 多工具组合是 agent 完成复杂任务的基础
- 有副作用的工具必须做人类在环控制

## 12. 学习版总结

- agent 之所以像 agent，关键就在它能调用工具
- 模型不直接执行工具，而是先生成 tool call
- 工具设计要重视名称、参数、描述
- 读操作适合自动化，写操作要审批
- tool use 让 agent 真正连上外部世界，也把安全问题带进来了
