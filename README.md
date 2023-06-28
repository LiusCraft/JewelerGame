# 项目描述

宝石商人游戏项目，卡牌类游戏。（目前已有机器人玩家功能）

技术栈：Vue 3 + TypeScript + Vite + NativeUI

项目地址: http://gem.xhystudy.cn

> 该项目是为了快速学习Vue3+TypeScript而编写的项目，存在不规范等代码问题，若大佬愿意指导欢迎issue提交或私信。

## 功能
目前支持:创建房间、搜索房间、房间内添加机器人、房间内进行文字聊天、触发一些语音催促、对局详情面板。

# 初始化与前后端对接

在当前前端项目下执行: `npm install`

然后更改后端连接地址：

1. main.ts文件中需要更改 ws连接地址为您当前地址。
2. apis/index.ts文件中需要更改 baseUrl请求地址。

# 问题

目前在玩家非正常退出的现象下，房间显示还是有问题，但是正常游玩的情况下无问题
