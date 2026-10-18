# KeShip 官网（keship-website）

> 船舶虚拟仿真实验平台门户站点 · **纯静态 · 零外部依赖 · 零构建**
> 梳理日期：2026-10-15

---

## 一、定位与规模

面向**船舶与海洋工程教育**的虚拟仿真实验平台门户。两个受众、两条路径：

- **学生用户** —— 预置 WSL 镜像，一键下载、一键安装，不配环境、不编译
- **开发者** —— git clone 源码，在独立 Ubuntu 或 WSL Ubuntu 中自行构建

| 项 | 值 |
|---|---|
| 页面 | 6 个（含 1 个子目录页） |
| HTML | 1,371 行 / 76.6 KB |
| CSS | 1,390 行 / 37.4 KB（单文件设计系统） |
| JS | 153 行 / 6.1 KB（原生，无框架） |
| 外部依赖 | **无**（无 CDN、无构建、无 npm 运行时依赖） |
| 部署方式 | 任意静态服务器，`python -m http.server` 即可 |

---

## 二、目录结构

```
keship-website/
├── index.html              首页（hero / 双入口 / 能力精选 / CTA）
├── features.html           核心能力（六项能力 / 物理内核 / 技术栈）
├── start.html              快速开始（学生 3 步 / 开发者 4 步）
├── showcase.html           界面速览（真实 GUI 截图 / ROS 2 联调话题）
├── get.html                获取（版本信息 / 两种获取方式 / 系统要求）
├── download/
│   ├── index.html          WSL 预置镜像下载页（双线路按钮）
│   ├── mirror-status.json  镜像线路配置（ready/url/sha256，维护者编辑）
│   └── README.md           镜像放置规范（维护者说明）
├── css/style.css           设计系统 + 全部组件
├── js/main.js              交互（导航 / 动画 / 复制 / 镜像检测）
├── assets/
│   ├── ui-preview.png      真实 GUI 截图
│   └── kzqj-logo.svg       嵙舟求舰品牌图标（帆船 + 波浪）
├── verify_site.py          静态检查脚本
└── start_server.sh         部署启动脚本（WSL / 服务器）
```

---

## 三、信息架构

主导航 6 项，顺序固定：
**首页 / 核心能力 / 快速开始 / 界面速览 / 获取 / 镜像下载**

| 页面 | 结构 |
|---|---|
| `index.html` | Hero（口号 + SVG 无人船场景 + 4 项技术指标）→ 双入口卡 → 能力精选 4 卡（2×2）→ CTA 带 |
| `features.html` | 六项核心能力 → 物理内核 6 条 → 技术栈 6 卡（`#stack`） |
| `start.html` | `#student` 学生路径 3 步 → `#dev` 开发者路径 4 步 + 参数表 + 跑通标志 + 注意事项 |
| `showcase.html` | GUI 截图 + 功能清单 → 控制联调（ROS 2 话题清单 + 3 条说明） |
| `get.html` | 当前版本卡 + 方式一（镜像）/ 方式二（源码）→ 双轨系统要求 |
| `download/index.html` | 镜像内容卡 + 下载区（智能就绪检测）+ 导入命令 → 维护者说明 3 条 |

---

## 四、设计系统

**风格**：海洋科技风（深海军蓝 + 青），浅色主题，玻璃拟态导航。

**设计令牌**（`:root` CSS 变量）：
- 背景 `--bg #f4f8fc` / 表面 `--surface #ffffff` / 正文 `--ink #0c2340`
- 主色 `--primary #0b5cad` / 强调 `--accent #0ea5e9` / 青 `--teal #0d9488`
- 深蓝 `--navy-900 #061a30` → `--navy-700 #103a5c`（Hero / 页脚 / CTA 用）
- 圆角 `--r-lg 18px` / `--r-md 14px` / `--r-sm 9px`
- 阴影 `--sh-sm/md/lg`、缓动 `--ease cubic-bezier(.22,.68,.36,1)`

**组件**：`.btn` / `.btn-primary` / `.btn-ghost` / `.btn-large`、`.hero-slogan`、`.path-cards`、`.page-hero`、`.jump-pill`、`.step`、`.code-block`（含 `.code-narrow`）、`.data-table`、`.notes`、`.physics-grid`、`.ok-band`、`.mirror-download`、`.footer-*`

**可用性**：
- 完整 `@media (prefers-reduced-motion: reduce)` 降级
- 三档响应式断点：1020px / 760px
- 移动端汉堡菜单（`aria-expanded` 同步）、`aria-current="page"` 标注当前页
- 语义化：`<header>/<nav>/<main>/<section>/<footer>`、图片均有 `alt`

---

## 五、核心功能

| 功能 | 实现 |
|---|---|
| 多页导航 | 静态 `active` 标注 + 移动端汉堡 + 滚动进度条 |
| **镜像就绪检测（双按钮同源）** | 读同目录 `mirror-status.json` 配置清单（镜像托管在外部，HEAD 探测会被 CORS 拦，故用部署时配置）：国内/国际两按钮均指向 ModelScope 仓库（统一托管、全球可访问），按 `ready`+`url` 自动启用；阿里云盘备用链接+提取码随就绪状态展示 |
| 代码复制 | `navigator.clipboard` + `execCommand` 降级，按钮 2 秒回显 |
| 入场动画 | `IntersectionObserver`（阈值 0.12），reduced-motion 直接显示 |
| 回到顶部 | 滚动 > 640px 出现 |
| 页脚年份 | JS 自动取当前年 |

---

## 六、内容事实基线（已与代码逐项核对）

| 项 | 事实 | 核对来源 |
|---|---|---|
| 版本 | **v0.1.0**（2026-10-12） | 仓库 `git tag` |
| GUI 框架 | **Qt 5.15**（不是 Qt6） | `CMakeLists.txt` L89 |
| 仿真引擎 | Gazebo Harmonic（gz-sim8） | 代码 / BUILD.md |
| 中间件 | ROS 2 Jazzy | 同上 |
| 定位传感器 | **BDS（北斗）**（不是 GPS） | GUI 实测 |
| GitHub | `github.com/zyeemf/KeShip`；网络受限用 `ssh://git@ssh.github.com:443/...` | `git remote` |
| 华为云 | `codehub.devcloud.cn-east-3.huaweicloud.com/.../KeShip.git` | `git remote` |
| 克隆路径 | `~/keship_ws` | 文档一致 |
| 启动 | `~/keship_ws/start_keship.sh`（仓库**无** bat 入口） | 仓库实查 |
| 镜像 | 固定名 `KeShip-WSL-Image.tar`，约 6.4 GB（v0.1.0），托管 ModelScope | 约定+实测 |
| 课题组署名 | 嵙舟求舰（每页页脚 + 图标） | — |

---

## 七、验证体系（**双层，互补**）

| 层 | 脚本 | 覆盖 | 命令 |
|---|---|---|---|
| **静态**（源码） | `verify_site.py` | 标签配对、本地资源、跨页锚点（含 `../`）、复制按钮匹配、主导航**与页脚**一致性、active 落位、口号计数=1、署名、禁用词、CSS 花括号 | `python verify_site.py` |
| **渲染**（布局） | `../verify_layout.cjs` | 6 页 × 3 视口（1440/1024/390）横向溢出，并定位越界元素 | `cd .. && node verify_layout.cjs` |

**为什么要两层**：静态检查读的是 HTML/CSS 文本，**看不见"渲染后被长内容撑破视口"**。本项目曾两次出现同类溢出（`download` 页 1440 下溢出 50px、`start` 页 1024/390 下溢出 98/654px），**静态检查完全无感**，都是渲染层检查才发现的。

`verify_layout.cjs` 支持 `file://` 协议（设 `KSHIP_BASE`），**无需启动服务器**即可检查。

---

## 八、本地预览与部署

```bash
# 本地预览（任选）
cd keship-website && python -m http.server 8765
#   浏览器打开 http://127.0.0.1:8765/

# 直接双击 index.html 也可浏览，但下载页的"镜像就绪检测"需 HTTP 环境才生效
```

**部署**：整目录拷到任意静态服务器即可（Apache / Nginx / GitHub Pages / 对象存储）。`start_server.sh` 为 WSL/服务器场景的一键启动脚本。

---

## 九、维护守则

1. **长内容的 grid/flex 列必须用 `minmax(0, 1fr)`，并把该 item 的 `min-width` 置 0**
   判据：列内可能出现**长不可断内容**（命令、URL、代码）。否则列的 `min-width: auto` 会被内容的 min-content 撑破 → 横向溢出。
   （`.code-block` 的 `overflow: hidden` 只裁剪显示，**不改变**对外贡献的 min-content。）
2. **口号「会点鼠标」全站恰好 1 处**（仅首页 hero）；改文案后必须复跑自检。
3. **禁用词**：`GPS`（应为 BDS）、`Qt6`（应为 Qt 5.15）、`start_keshipv0010.bat`（仓库无此文件）—— 自检脚本会拦截。
4. **导航 6 项与页脚 6 项必须一致**（均含「镜像下载」与「获取」，顺序相同），自检脚本会校验。
5. **改完内容/样式，跑双层检查**：`python verify_site.py` + `node verify_layout.cjs`。
6. **不依赖外部资源**：新增图标一律内联 SVG 或放 `assets/`，禁止引 CDN（保证离线与内网可用）。
7. **不留后台服务**：预览优先用本地文件路径；确需 HTTP（如镜像检测）时用完即停。

---

## 十、待办与已知限制

| # | 事项 | 状态 |
|---|---|---|
| 1 | 镜像分发链接待回填 `download/mirror-status.json`（阿里云盘 + GitHub Release + SHA256） | 待镜像制作完成；回填后按钮自动启用，**无需改代码** |
| 2 | 旧备份 `webkeship/keship-website20260810.zip`（8 月旧包） | 待确认是否清理 |
| 3 | `start.html`「配置环境」代码框（720px）与其它步骤代码框宽度不统一 | 已知取舍：克隆步骤含超长 URL，统一收窄会触发横向滚动 |
| 4 | 首页/`get` 页左侧卡片与右列底部不齐平 | 已知取舍：内容自适应优先于强行拉平（拉平会导致大片留白） |

---

*本文档由 2026-10-15 全面梳理生成，随站点一同维护。*
