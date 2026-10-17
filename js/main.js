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

    /* ---------- 镜像就绪检测（仅下载页） ---------- */
    var mirrorBtn = document.getElementById('mirror-btn');
    if (mirrorBtn) {
        var mirrorFile = mirrorBtn.dataset.file || 'KeShip-WSL-Image.tar';
        var mirrorText = document.getElementById('mirror-btn-text');
        var mirrorStatus = document.getElementById('mirror-status');

        function mirrorPending() {
            mirrorBtn.classList.add('is-pending');
            mirrorBtn.setAttribute('aria-disabled', 'true');
            mirrorBtn.removeAttribute('href');
            if (mirrorText) mirrorText.textContent = '镜像即将提供';
            if (mirrorStatus) mirrorStatus.textContent = '镜像文件尚未就绪——请联系课程组 / 实验室获取当期发放方式。';
        }

        fetch(mirrorFile, { method: 'HEAD' })
            .then(function (r) {
                if (r.ok) {
                    mirrorBtn.classList.remove('is-pending');
                    mirrorBtn.setAttribute('aria-disabled', 'false');
                    mirrorBtn.setAttribute('href', mirrorFile);
                    if (mirrorText) mirrorText.textContent = '下载 WSL 预置镜像';
                    if (mirrorStatus) mirrorStatus.textContent = '镜像已就绪（约 11 GB）。下载后按导入命令安装即可。';
                } else {
                    mirrorPending();
                }
            })
            .catch(mirrorPending);
    }

    /* ---------- 页脚年份 ---------- */
    var yearEl = $('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
