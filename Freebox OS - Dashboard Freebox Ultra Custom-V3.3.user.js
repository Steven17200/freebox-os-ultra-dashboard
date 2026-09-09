// ==UserScript==
// @name         Freebox OS - Dashboard Freebox Ultra Custom
// @namespace    https://github.com/Steven17200/freebox-os-ultra-dashboard
// @version      4.5
// @description  Dashboard Ultra Custom — fond + tuiles sociales (sans panneaux NET/SYS)
// @author       Steven17200
// @icon         https://www.free.fr/favicon.ico
// @match        http://mafreebox.freebox.fr/*
// @match        https://mafreebox.freebox.fr/*
// @match        http://192.168.1.254/*
// @match        https://192.168.1.254/*
// @grant        GM_addStyle
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Steven17200/freebox-os-ultra-dashboard/main/Freebox%20OS%20-%20Dashboard%20Freebox%20Ultra%20Custom-V3.3.user.js
// @downloadURL  https://raw.githubusercontent.com/Steven17200/freebox-os-ultra-dashboard/main/Freebox%20OS%20-%20Dashboard%20Freebox%20Ultra%20Custom-V3.3.user.js
// @connect      raw.githubusercontent.com
// @connect      github.com
// ==/UserScript==

(function () {
    'use strict';

    const BG_IMG = 'https://raw.githubusercontent.com/Steven17200/freebox-os-ultra-dashboard/main/Fond%20Freebox.svg';
    const ICON_FREEBOX = 'https://raw.githubusercontent.com/Steven17200/freebox-os-ultra-dashboard/main/free-app-logo.png';
    const ICON_MOBILE = 'https://raw.githubusercontent.com/Steven17200/freebox-os-ultra-dashboard/main/Free_mobile-app-logo.png';
    const ICON_UF = 'https://www.universfreebox.com/favicon.ico';

    const X_SVG = '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>';

    GM_addStyle(`
        body, #u-desktop-body {
            background-image: url("${BG_IMG}") !important;
            background-size: cover !important;
            background-position: center !important;
            background-attachment: fixed !important;
        }
        #u-desktop-body img[src*="bg_freeboxos.svg"], .fbx-os-logo { display: none !important; }
        #panel-left, #panel-right, .ultra-panel { display: none !important; }
        #social-tiles-container {
            position: absolute; left: 50%; transform: translateX(-50%);
            top: 128px; display: flex; gap: 26px; z-index: 10000;
            font-family: Roboto, "Segoe UI", sans-serif;
        }
        .social-tile { display: flex; flex-direction: column; align-items: center; cursor: pointer; text-decoration: none !important; transition: transform 0.15s; gap: 8px; }
        .social-tile:hover { transform: scale(1.05); }
        .social-tile .icon-wrapper {
            width: 56px; height: 56px; background: #5c5f66;
            border-radius: 16px; display: flex; align-items: center; justify-content: center;
            overflow: hidden; border: none; box-shadow: 0 1px 4px rgba(0,0,0,0.18);
        }
        .social-tile .icon-wrapper svg { width: 26px; height: 26px; fill: white; display: block; margin: auto; }
        .white-tile-custom { background: #ffffff !important; border: none !important; }
        .social-tile img.icon-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .social-tile span {
            color: #1a1a1a;
            background: #e8e8e8;
            font-size: 11px;
            margin-top: 0;
            font-weight: 500;
            text-shadow: none;
            text-align: center;
            width: auto;
            max-width: 118px;
            line-height: 1.25;
            padding: 5px 10px;
            border-radius: 8px;
        }
    `);

    function addSocialTiles() {
        if (document.getElementById('social-tiles-container')) return;
        const container = document.createElement('div');
        container.id = 'social-tiles-container';
        container.innerHTML =
            '<a href="https://x.com/UniversFreebox/" target="_blank" class="social-tile"><div class="icon-wrapper">' + X_SVG + '</div><span>X Univers Freebox</span></a>' +
            '<a href="https://www.universfreebox.com/" target="_blank" class="social-tile"><div class="icon-wrapper"><img src="' + ICON_UF + '" class="icon-img" onerror="this.style.display=\'none\'"></div><span>Univers Freebox</span></a>' +
            '<a href="https://x.com/free" target="_blank" class="social-tile"><div class="icon-wrapper">' + X_SVG + '</div><span>X Free</span></a>' +
            '<a href="https://subscribe.free.fr/login/" target="_blank" class="social-tile"><div class="icon-wrapper white-tile-custom"><img src="' + ICON_FREEBOX + '" class="icon-img" onerror="this.style.display=\'none\'"></div><span>Espace Freebox</span></a>' +
            '<a href="https://mobile.free.fr/account/v2" target="_blank" class="social-tile"><div class="icon-wrapper white-tile-custom"><img src="' + ICON_MOBILE + '" class="icon-img" onerror="this.style.display=\'none\'"></div><span>Espace Mobile</span></a>';
        document.body.appendChild(container);
    }

    function removePanels() {
        ['panel-left', 'panel-right'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        document.querySelectorAll('.ultra-panel').forEach(function (el) { el.remove(); });
    }

    function build() {
        removePanels();
        addSocialTiles();
    }

    build();
    const mo = new MutationObserver(function () {
        removePanels();
        if (!document.getElementById('social-tiles-container')) addSocialTiles();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
})();
