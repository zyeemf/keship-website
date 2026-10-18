# KeShip 镜像发放目录（download/）

## 用途

存放镜像下载页（`index.html`）与线路配置（`mirror-status.json`）。**镜像本体托管在 ModelScope，不在本目录**（6.4 GB 超出站点托管限额，且外部托管跨域无法 HEAD 探测，故用配置清单方案）。

## 当前分发架构（2026-10-18 定稿）

| 线路 | 渠道 | 说明 |
|---|---|---|
| 国内 | ModelScope 仓库 `zyeemf/KeShip-V010-WSL-Image` | 阿里 CDN、免登录、单文件约 6.4 GB 直下；版本用 git tag 管理（当前 v0.1.0） |
| 国际 | **同上**（统一托管） | ModelScope 全球可访问，国际/国内同源，不做双源分发 |
| 备用 | 阿里云盘 | `mirror-status.json` 的 `backup.url`/`backup.code` 就绪后自动显示 |
| 应急 | GitHub Release 分卷（4×1.9GB） | **预案**：仅当 ModelScope 故障时启动——上传现成分卷（`E:\KeShip-Release\v0.1.0\parts\KeShip-WSL-Image.tar.part_*`，共 4 份，round-trip 已验证），把 `intl.url` 改回 Release tag 页即可 |

## 如何更新版本（维护者）

1. 构建新镜像（基准 + `build_version.sh`，见 `../../WSL_IMAGE_RUNBOOK.md`）→ 导出 tar + `certutil` 算 SHA256；
2. `ms_upload.sh <新tar> "说明" v0.x.x` 上传 ModelScope（持久凭据已配，自动打版本 tag）；
3. 本目录 `mirror-status.json`：更新 `sha256` / `sizeGB`，确认两条线路 `ready:true`；
4. （可选）阿里云盘备用：填 `backup.url` + `backup.code`；
5. 推送网站三站（`deploy_site.py push all`）→ 按钮自动切到新版本。

> ⚠ ModelScope 机审严格：仓库内**严禁上传图片/截图**（2026-10-18 曾有 GUI 截图被整体 revert）。README 与 .bat 为纯文本，安全。

## 镜像规范（发放时核对）

- 内容：Ubuntu 24.04 LTS + ROS 2 Jazzy + Gazebo Harmonic（gz-sim8）+ KeShip 及全部依赖（已编译就绪）+ 中文字体（fonts-noto-cjk）；
- 当前 v0.1.0：**约 6.4 GB**，SHA256 `2c392c4a69b215f58439d3807e123635e06af7a43abf57023193256abd05a123`；
- 导入命令（写入下载页）：`wsl --import KeShip E:\WSLDistros\KeShip <路径>\KeShip-WSL-Image.tar --version 2`；
- 学生启动：`KeShip-Start.bat`（随 ModelScope 仓库分发，双击即用）；
- 导入失败最常见原因：`.tar` 不完整——务必提供 SHA256 校验值。

## 历史说明（已废弃）

- 2026-10-17 前：镜像放本目录 + HEAD 探测就绪——已废弃（CORS 拦跨域探测 + 6.4 GB 超托管限额），改配置清单方案；
- 旧版网站曾提供 `KeShip-v1.0.0.zip` 入口（2025-08-09），从未发布且内容已远落后，已移除。
