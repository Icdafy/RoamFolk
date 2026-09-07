# 后续多人服务器

第一阶段不启用游戏服务器。公共世界阶段按完整计划使用 Node.js + Colyseus；
通过 shared/types.ts 的 WorldSession 契约与单机实现区分。网页交付 Worker 不承担游戏状态同步。
