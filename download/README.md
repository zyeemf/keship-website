# KeShip 镜像发放目录（download/）

## 用途

存放 KeShip 预置 WSL 镜像（学生用户一键安装用），由 `download/index.html`（镜像下载页）自动识别并启用下载按钮。

## 如何放置镜像（维护者）

1. 将镜像文件复制到本目录；
2. 命名为 **`KeShip-WSL-Image.tar`**（固定名，版本更新直接覆盖）；
3. 刷新 `download/index.html` —— 下载按钮自动从「即将提供」变为可点击，**无需改动任何代码**。

> 就绪检测需要经 HTTP 访问网页（站点服务器）；直接双击本地文件时检测不生效，按钮保持「即将提供」。

## 当前状态

- `KeShip-WSL-Image.tar`：**尚未提供**（待放入）。
- 页面文案：未就绪时提示联系课程组 / 实验室。

## 镜像规范（发放时核对）

- 内容：Ubuntu 24.04 LTS + ROS 2 Jazzy + Gazebo Harmonic（gz-sim8）+ KeShip 及全部依赖（已编译就绪）+ 中文字体（fonts-noto-cjk）；
- 大小约 11 GB；对应 KeShip `v0.1.0`（2026-10-12）；
- 导入命令（写入下载页）：`wsl --import KeShip E:\WSLDistros\KeShip <路径>\KeShip-WSL-Image.tar --version 2`；
- 建议同时向发放对象提供文件校验值（SHA256），导入失败最常见原因是 `.tar` 不完整。

## 历史说明（已废弃）

- 旧版网站曾提供 `KeShip-v1.0.0.zip` 下载入口（2025-08-09），该安装包从未随站发布，且版本内容已远落后于当前代码。该入口已移除，统一改为「学生镜像 / git 源码」双路分发。
