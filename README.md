# 小小拼读家 · OPW 英语学习工作台

面向 6–8 岁零基础儿童的牛津自然拼读（Oxford Phonics World）1–5 级互动学习 Web App。

## 特点
- 纯前端单页应用（HTML / CSS / JS + localStorage），**无需后端、无需构建**。
- 五大板块：任务看板 · 词汇练习 · 跟读对话 · 互动游戏 · 积分成就。
- 对齐 OPW 1–5 级（26 字母 + 短元音 + 长元音 + 辅音连缀 + R 控制元音），共 80 单元。
- 跟读模块：真人 MP3 优先（`assets/audio/`），缺项自动慢速语音合成兜底；OPW 师生问答对话模式。
- 配套资源库：分级歌谣播放器 + 真实 YouTube 拓展视频链接。
- 移动竖屏优先、平板兼容，浅蓝淡黄护眼配色。

## 本地预览
直接用浏览器打开 `index.html` 即可；麦克风录音功能需在 https 或 localhost 下使用。

## 部署（GitHub Pages）
1. 在 GitHub 新建仓库（如 `phonics-webapp`）。
2. 推送本目录全部文件到 `main` 分支。
3. 仓库 Settings → Pages → Source 选 `main` / root → Save。
4. 访问 `https://<用户名>.github.io/<仓库名>/`。

> 已包含 `.nojekyll`，避免 GitHub Pages 用 Jekyll 处理导致资源失效。
