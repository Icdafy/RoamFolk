# 漫楼 RoamFolk

温暖、精致的微缩生活网页游戏：从立体大厦选择楼层，以可爱小人或拟人化物品角色自由探索、工作、摸鱼、游玩和吃饭。

## 当前状态

当前版本 **v0.1.1：第一阶段工程准备**。v0.1.0 文档版及历史保留。

已落地 Sites / React / TypeScript / Three.js 工程、Blender 4.5.13 LTS、可编辑样片及 GLB 导出、九层注册、共享接口、环境与资源检查、自动测试和发布打包流程。

当前页面是**工程预览**：可查看原创建筑样片、缩放和复位镜头，查看九个正式楼层的筹备状态。样片不是正式大厦或 21 层；所有正式楼层仍为待开放。

尚未实现：25 层大厦选层交互、正式室内模型、角色、移动/寻路、碰撞、活动、IndexedDB 存档、多人游戏。下一阶段为 v0.2.0 大厦入口；21 层正式建模等待参考图片。

## 启动

需要 Node.js 24 LTS。项目根目录运行：

```powershell
npm ci
npm run dev
```

访问终端显示的地址，默认 [本地开发预览](http://localhost:3000/)。

```powershell
npm run doctor
npm run check
npm run build
npm start
```

生产构建预览通常为 [本地生产预览](http://127.0.0.1:8787/)。
运行网页不依赖 Blender；编辑模型时使用 `git lfs pull` 取得 .blend 源文件，配置 Blender 后运行 `npm run assets:generate`。

完整启动与构建包使用方法见 [启动说明](docs/启动说明.md)。

## 文档与发布

- [完整开发计划](docs/完整开发计划.md)：原始计划保留，实际进展以本 README 为准。
- [工程与资源规范](docs/工程与资源规范.md)：目录、Blender、接口与发布流程。
- [第一阶段验收记录](docs/第一阶段验收.md)：已验证项目和未验证范围。
- [更新日志](CHANGELOG.md)、[v0.1.1 发布说明](docs/releases/v0.1.1.md)。
- [GitHub 仓库](https://github.com/Icdafy/RoamFolk)、[GitHub Releases](https://github.com/Icdafy/RoamFolk/releases)。

本地项目根目录：`F:\漫楼`。网页预览使用 Sites 所有者私有访问；公开 GitHub 源码与 Release 不受该网页访问权限限制。最终发布状态和私人预览入口见 GitHub Release 的发布回执，避免将预分配网址误认为已上线。
