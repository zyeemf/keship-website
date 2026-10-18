/* =========================================================
   KeShip 官网脚本 · 原生 JS，零依赖
   （多页站：当前页高亮由各页 HTML 的 .active 静态标注）
   ========================================================= */
(function () {
    'use strict';

    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

    /* ---------- 移动端菜单 ---------- */
    var navToggle = $('.nav-toggle');
    var navLinks = $('#nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            var open = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
        });

        // 点击导航项后收起菜单
        $$('.nav-link', navLinks).forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // 点击菜单外区域收起
        document.addEventListener('click', function (e) {
            if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---------- 导航栏滚动状态 + 阅读进度 ---------- */
    var navbar = $('#navbar');
    var progress = $('#nav-progress');
    var backTop = $('#back-top');

    function onScroll() {
        var y = window.scrollY || document.documentElement.scrollTop;
        if (navbar) navbar.classList.toggle('scrolled', y > 12);
        if (backTop) backTop.classList.toggle('show', y > 640);

        if (progress) {
            var doc = document.documentElement;
            var max = doc.scrollHeight - window.innerHeight;
            progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- 入场动画 ---------- */
    var revealEls = $$('.reveal');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
    }

    /* ---------- 代码复制 ---------- */
    function flash(btn) {
        var old = btn.textContent;
        btn.textContent = '已复制 ✓';
        btn.classList.add('copied');
        setTimeout(function () {
            btn.textContent = old;
            btn.classList.remove('copied');
        }, 2000);
    }

    function legacyCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* 忽略 */ }
        document.body.removeChild(ta);
    }

    $$('.copy-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var el = document.getElementById(btn.dataset.code);
            if (!el) return;
            var text = el.textContent;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () { flash(btn); })
                    .catch(function () { legacyCopy(text); flash(btn); });
            } else {
                legacyCopy(text);
                flash(btn);
            }
        });
    });

    /* ---------- 镜像就绪检测（仅下载页）：读同目录 mirror-status.json 配置清单 ----------
       为什么不用 HEAD 探测：镜像托管在阿里云盘/GitHub（跨域），浏览器 fetch HEAD 会被
       CORS 拦截；改为部署时更新的本地配置清单，同源读取，无跨域问题。 */
    var mirrorPanel = document.getElementById('mirror-btn-cn');
    if (mirrorPanel) {
        function setMirrorBtn(btnId, textId, ready, url, label, pendingText) {
            var btn = document.getElementById(btnId);
            var text = document.getElementById(textId);
            if (!btn) return;
            if (ready && url) {
                btn.classList.remove('is-pending');
                btn.setAttribute('aria-disabled', 'false');
                btn.setAttribute('href', url);
                if (text) text.textContent = label;
            } else {
                btn.classList.add('is-pending');
                btn.setAttribute('aria-disabled', 'true');
                btn.removeAttribute('href');
                if (text) text.textContent = pendingText || '即将提供';
            }
        }

        function mirrorPending(statusText) {
            setMirrorBtn('mirror-btn-cn', 'mirror-btn-cn-text', false, '', '', '国内线路即将提供');
            setMirrorBtn('mirror-btn-intl', 'mirror-btn-intl-text', false, '', '', '国际线路即将提供');
            var st = document.getElementById('mirror-status');
            if (st) st.textContent = statusText || '镜像文件尚未就绪——请联系课程组 / 实验室获取当期发放方式。';
        }

        fetch('mirror-status.json', { cache: 'no-store' })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(function (cfg) {
                var ch = cfg.channels || {};
                var cn = ch.cn || {}, intl = ch.intl || {};
                setMirrorBtn('mirror-btn-cn', 'mirror-btn-cn-text', !!cn.ready, cn.url, cn.label || '国内线路下载', '国内线路即将提供');
                setMirrorBtn('mirror-btn-intl', 'mirror-btn-intl-text', !!intl.ready, intl.url, intl.label || '国际线路下载', '国际线路即将提供');
                var st = document.getElementById('mirror-status');
                if (st) {
                    if (cn.ready || intl.ready) {
                        var txt = '镜像已就绪（约 ' + (cfg.sizeGB || 6) + ' GB），国内用户建议使用国内线路。';
                        var backup = (ch.cn && ch.cn.backup) || {};
                        if (cn.ready && backup.url) {
                            txt += ' ' + (backup.label || '备用线路') + '：' + backup.url +
                                (backup.code ? '（提取码 ' + backup.code + '）' : '');
                        }
                        txt += cfg.sha256 ? ' SHA256：' + cfg.sha256 : '';
                        st.textContent = txt;
                    } else {
                        st.textContent = '镜像文件尚未就绪——请联系课程组 / 实验室获取当期发放方式。';
                    }
                }
            })
            .catch(function () { mirrorPending(); });
    }

    /* ---------- 页脚年份 ---------- */
    var yearEl = $('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
