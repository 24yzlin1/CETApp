# CETApp 小程序

## 项目简介

CETApp 是一款基于 **WeChat Mini Program** 的英语单词学习工具，帮助用户通过每日打卡、单词卡片、错题本和游戏化的方式提升词汇量。项目使用 **TypeScript** + **tDesign MiniProgram UI 组件库** 开发，支持自定义词库、学习进度管理以及多种交互页面。

## 功能特性

- **每日打卡**：记录学习进度，支持打卡与预览两种模式。
- **单词卡片**：按章节划分的单词卡片展示，可自定义卡片组。
- **错题本**：收集用户答错的单词，便于复习。
- **单词成长记**：展示学习历史记录与进度曲线。
- **收藏页**：用户可以收藏喜欢的单词卡片。
- **词义对对碰游戏**：通过游戏巩固记忆，提高学习兴趣。
- **自定义卡片**：用户可以创建、编辑、删除自己的卡片组。
- **倒计时提醒**：展示距次日零点的倒计时，提醒用户完成打卡。

## 技术栈

- **小程序框架**：WeChat Mini Program
- **语言**：TypeScript
- **UI 组件库**：[tdesign‑miniprogram](https://github.com/Tencent/tdesign-miniprogram)
- **工具函数**：位于 `utils/` 目录，封装了数据获取、导航、卡片操作等业务逻辑。

## 项目结构 (摘录)

```
miniprogram/
├─ app.json               # 小程序全局配置，定义页面路由及全局组件
├─ app.ts                 # 小程序入口文件(可在这里初始化全局数据)
├─ app.wxss               # 全局样式
├─ components/            # 公共 UI 组件(如 result、table 等)
├─ pages/                 # 各业务页面
│   ├─ index/             # 首页，展示功能入口、打卡、倒计时等
│   ├─ agent/             # 与 AI Agent 对话页面
│   ├─ profile/           # 个人资料页
│   ├─ favorite/          # 收藏页
│   ├─ history/           # 成长记录页
│   ├─ word_cards/        # 单词卡片展示页(包括内置和自定义卡片)
│   ├─ word_game/         # 词义对对碰游戏页
│   └─ mistake/           # 错题本页面
├─ utils/                 # 业务工具函数、类型定义
│   ├─ type.ts            # 数据模型(UserCardGroup 等)
│   ├─ util.ts            # 核心业务函数(如 getWordCards、navigateTo...)
│   └─ word_list.ts       # 单词列表标题常量
└─ miniprogram_npm/       # tdesign‑miniprogram 的依赖代码
```

## 开发环境 & 编译

1. **安装依赖** (项目根目录)
   ```bash
   npm install   # 仅安装 tdesign-miniprogram 依赖
   ```
2. **使用微信开发者工具**
   - 打开「微信开发者工具」 → 「导入项目」
   - 项目目录选择本仓库根目录 (`CETApp`)
   - 勾选「使用 npm 模块」并点击「构建 npm」
3. **调试**
   - 通过微信开发者工具可以实时预览页面、查看 console 输出。
   - 如需修改组件样式或业务逻辑，编辑对应的 `.ts/.wxml/.wxss` 文件后保存，工具会自动热更新。

## 页面说明

| 页面          | 路径                          | 功能                                         |
| ------------- | ----------------------------- | -------------------------------------------- |
| 首页          | `pages/index/index`           | 显示功能列表、头像、打卡按钮、倒计时、欢迎语 |
| 与 Agent 对话 | `pages/agent/agent`           | 与 AI Agent 进行对话，帮助记单词或答疑       |
| 个人资料      | `pages/profile/profile`       | 展示用户头像、昵称等信息，可进入设置页       |
| 错题本        | `pages/mistake/mistake`       | 列出用户答错的单词，支持删除与再次练习       |
| 成长记录      | `pages/history/history`       | 以列表方式展示学习天数、累计单词量等统计信息 |
| 收藏页        | `pages/favorite/favorite`     | 用户收藏的单词卡片集合                       |
| 单词卡片      | `pages/word_cards/word_cards` | 根据章节展示单词卡片，支持打卡 / 预览模式    |
| 词义对对碰    | `pages/word_game/word_game`   | 记忆游戏，随机匹配中文 / 英文词义进行选择    |

## 如何贡献

1. Fork 本仓库。
2. 在 `dev` 分支或自建分支上进行功能开发或 bug 修复。
3. 提交 **Pull Request**，描述改动动机与实现细节。
4. 通过手动测试后，项目维护者会合并代码。

> 若想添加新页面或组件，请参考已有页面的目录结构与 `Component` 写法，保持注释风格与 `ts`/`wxml`/`wxss` 的统一。

## 许可证

本项目采用 **MIT License**，许可证文件已添加到项目根目录 `LICENSE`。

---

> **注意**：本项目仅用于学习与个人练习，如需在生产环境使用，请自行评估数据安全与合规性。
