#!/usr/bin/env python3
"""KeShip 网站交付前自检（多页版 v2，含子目录页）：
标签配对 / 本地资源（按页目录解析）/ 锚点（含跨页 page.html#frag 与 ../ 相对路径）/
复制按钮匹配 / 导航一致性与当前页落位 / CSS 花括号 /
关键内容抽查（口号恰好 1 处、课题组署名每页、镜像文件名等，每项报告样本数）。
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
PAGES = ["index.html", "features.html", "start.html", "showcase.html", "get.html", "download/index.html"]
NAV = {"index.html", "features.html", "start.html", "showcase.html", "get.html", "download/index.html"}
errors = []
pages = {}

for name in PAGES:
    p = ROOT / name
    if not p.exists():
        errors.append(f"缺失页面: {name}")
        continue
    pages[name] = p.read_text(encoding="utf-8")

if not pages:
    print("没有可检查的页面"); sys.exit(1)

VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr",
        "circle","path","rect","stop","animate","use","line","polygon","ellipse"}

def page_dir(name):
    return (ROOT / name).parent

def resolve(name, file_part):
    """把页内相对路径解析为相对 ROOT 的页面名（posix 风格）。"""
    target = (page_dir(name) / file_part).resolve()
    try:
        return target.relative_to(ROOT).as_posix()
    except ValueError:
        return None

def check_tags(html, name):
    stack = []
    for m in re.finditer(r'''<(/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^'">])*)>''', html):
        closing, tag, attrs = m.group(1), m.group(2).lower(), m.group(3)
        if tag in VOID or attrs.rstrip().endswith("/"):
            continue
        if closing:
            if not stack:
                errors.append(f"[{name}] 多余闭合标签 </{tag}>")
            elif stack[-1][0] != tag:
                errors.append(f"[{name}] 标签交叉: 期待 </{stack[-1][0]}> 实得 </{tag}>")
                stack.pop()
            else:
                stack.pop()
        else:
            stack.append((tag, html[:m.start()].count("\n") + 1))
    for tag, ln in stack:
        errors.append(f"[{name}] 未闭合标签 <{tag}> (第 {ln} 行)")

# ---------- 每页检查 ----------
all_anchors = {}
for name, html in pages.items():
    check_tags(html, name)
    all_anchors[name] = set(re.findall(r'id="([^"]+)"', html))

    # 本地资源（按页所在目录解析）
    for val in re.findall(r'(?:src|href)="([^"]+)"', html):
        if val.startswith(("http", "data:", "mailto:", "#")):
            continue
        file_part = val.split("#")[0]
        if file_part and not (page_dir(name) / file_part).resolve().exists():
            errors.append(f"[{name}] 缺失本地资源: {val}")

    # 复制按钮 <-> 代码块
    codes = set(re.findall(r'data-code="([^"]+)"', html))
    code_ids = set(re.findall(r'<code id="([^"]+)"', html))
    if codes != code_ids:
        errors.append(f"[{name}] 复制按钮与代码块不匹配: 按钮多 {sorted(codes-code_ids)} / 代码多 {sorted(code_ids-codes)}")

    # 课题组署名（每页页脚）
    if "嵙舟求舰" not in html:
        errors.append(f"[{name}] 缺少课题组署名「嵙舟求舰」")

    # 页脚链接一致性（6 项应与 NAV 完全一致；download/ 子目录页要解析 ../）
    foot_html = re.search(r'<nav class="footer-links".*?</nav>', html, re.S)
    if not foot_html:
        errors.append(f"[{name}] 缺少页脚导航")
    else:
        foot_hrefs = set()
        for h in re.findall(r'href="([^"]+)"', foot_html.group(0)):
            r = resolve(name, h)
            if r:
                foot_hrefs.add(r)
        if foot_hrefs != NAV:
            errors.append(f"[{name}] 页脚链接不一致: {sorted(foot_hrefs)}")

    # 导航
    nav_html = re.search(r'<nav class="nav-links".*?</nav>', html, re.S)
    if not nav_html:
        errors.append(f"[{name}] 缺少主导航")
    else:
        nav_text = nav_html.group(0)
        hrefs = set()
        for h in re.findall(r'href="([^"]+)"', nav_text):
            r = resolve(name, h)
            if r:
                hrefs.add(r)
        if hrefs != NAV:
            errors.append(f"[{name}] 导航链接不一致: {sorted(hrefs)}")
        actives = len(re.findall(r'class="nav-link active"', nav_text))
        if actives != 1:
            errors.append(f"[{name}] 当前页高亮应为 1 个，实为 {actives}")
        else:
            # 解析 active 项的 href，确认落在本页
            m = re.search(r'<a href="([^"]+)" class="nav-link active"', nav_text)
            if not m or resolve(name, m.group(1)) != name:
                errors.append(f"[{name}] active 未落在本页")

# ---------- 跨页锚点 ----------
for name, html in pages.items():
    for href in re.findall(r'href="([^"]+)"', html):
        if href.startswith(("http", "data:", "mailto:")):
            continue
        file_part, _, frag = href.partition("#")
        target = resolve(name, file_part) if file_part else name
        if frag:
            if target not in all_anchors:
                errors.append(f"[{name}] 跨页锚点目标页不存在: {href}")
            elif frag not in all_anchors[target]:
                errors.append(f"[{name}] 锚点无对应 id: {href}")

# ---------- CSS ----------
css = (ROOT / "css/style.css").read_text(encoding="utf-8")
if css.count("{") != css.count("}"):
    errors.append(f"CSS 花括号不配对: {{={css.count('{')} }}={css.count('}')}")

# ---------- 关键内容抽查（防空转：报告样本数） ----------
joined = "\n".join(pages.values())
checks = {
    "BDS（反馈1）": ("BDS", "GPS"),
    "版本 v0.1.0": ("v0.1.0", None),
    "Qt 5.15（非 Qt6）": ("Qt 5.15", "Qt6"),
    "GitHub 仓库": ("github.com/zyeemf/KeShip", None),
    "SSH over 443": ("ssh.github.com:443", None),
    "CodeHub 完整 URL": ("codehub.devcloud.cn-east-3.huaweicloud.com", None),
    "wsl --import（学生镜像）": ("wsl --import", None),
    "clone 到 ~/keship_ws": ("~/keship_ws", None),
    "start_keship.sh": ("start_keship.sh", None),
    "BUILD.md 指引": ("doc/BUILD.md", None),
    "单例互斥": ("单例互斥", None),
    "镜像下载页链接": ("download/index.html", None),
    "镜像文件名（智能检测目标）": ("KeShip-WSL-Image.tar", None),
    "嵙舟求舰品牌图标": ("kzqj-logo.svg", None),
}
for label, (must, forbid) in checks.items():
    n = joined.count(must)
    if n == 0:
        errors.append(f"内容缺失: {label}")
    if forbid and forbid in joined:
        errors.append(f"过时/错误内容残留: {forbid}")

# 口号只保留 hero 一处
slogan_n = joined.count("会点鼠标")
if slogan_n != 1:
    errors.append(f"口号「会点鼠标」应恰好出现 1 次（仅 hero），实为 {slogan_n}")

# 已精简的首页技术栈横条不应残留（与 features 页重复）
if "stack-strip" in joined or "stack-chip" in joined:
    errors.append("残留已删除的首页技术栈横条标记")

# 已废弃的 bat 入口不应再出现（仓库不含该文件）
if "start_keshipv0010.bat" in joined:
    errors.append("残留已废弃入口: start_keshipv0010.bat（仓库不含此文件）")

print(f"检查样本: {len(pages)} 页 / 锚点 {sum(len(v) for v in all_anchors.values())} 个 / "
      f"复制按钮 {len(re.findall(r'data-code=', joined))} 个 / 口号 {slogan_n} 处 / CSS {len(css)} 字符")
if errors:
    print("❌ 发现问题:")
    for e in errors:
        print("  -", e)
    sys.exit(1)
print("✅ 全部通过")
