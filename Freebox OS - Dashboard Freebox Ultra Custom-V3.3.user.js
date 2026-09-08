// ==UserScript==
// @name         Freebox OS - Dashboard Freebox Ultra Custom
// @namespace    https://github.com/Steven17200/freebox-os-ultra-dashboard
// @version      4.2
// @description  Dashboard Ultra Custom — NET/SYS + VPN à droite
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

    const BOX_IMG = 'https://raw.githubusercontent.com/Steven17200/freebox-os-ultra-dashboard/main/Freebox%20Ultra%20Stranger%20Things.png';
    const BG_IMG = 'https://raw.githubusercontent.com/Steven17200/freebox-os-ultra-dashboard/main/Fond%20Freebox.svg';
    const ICON_FREEBOX = 'https://raw.githubusercontent.com/Steven17200/freebox-os-ultra-dashboard/main/free-app-logo.png';
    const ICON_MOBILE = 'https://raw.githubusercontent.com/Steven17200/freebox-os-ultra-dashboard/main/Free_mobile-app-logo.png';
    const ICON_UF = 'https://www.universfreebox.com/favicon.ico';

    const X_SVG = '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>';

    function tempColor(t) {
        const n = Number(t);
        if (!Number.isFinite(n)) return '#888';
        if (n < 63) return '#4CAF50';
        if (n <= 69) return '#FF9800';
        return '#F44336';
    }

    function fmtRateBytes(bytesPerSec) {
        const mbps = (Number(bytesPerSec) || 0) / 125000;
        if (mbps >= 1000) return { v: (mbps / 1000).toFixed(2), u: 'Gbps' };
        return { v: mbps.toFixed(1), u: 'Mbps' };
    }

    function fmtCapBits(bitsPerSec) {
        const bps = Number(bitsPerSec) || 0;
        if (bps <= 0) return 'n/a';
        const gbps = bps / 1e9;
        if (gbps >= 1) return gbps.toFixed(1) + ' Gbps';
        return (bps / 1e6).toFixed(0) + ' Mbps';
    }

    function fmtBytes(n) {
        n = Number(n) || 0;
        if (n < 1024) return n + ' o';
        if (n < 1048576) return (n / 1024).toFixed(1) + ' Ko';
        if (n < 1073741824) return (n / 1048576).toFixed(1) + ' Mo';
        return (n / 1073741824).toFixed(2) + ' Go';
    }

    function vpnLabel(vpn) {
        const v = String(vpn || '').toLowerCase();
        if (v.indexOf('wireguard') !== -1) return 'WireGuard';
        if (v.indexOf('openvpn') !== -1) return 'OpenVPN';
        if (v.indexOf('ipsec') !== -1 || v.indexOf('ike') !== -1) return 'IPsec';
        if (v.indexOf('pptp') !== -1) return 'PPTP';
        return vpn || 'VPN';
    }

    async function api(path) {
        try {
            const r = await fetch(path, { credentials: 'same-origin' });
            if (!r.ok) return { success: false };
            return await r.json();
        } catch (e) {
            return { success: false };
        }
    }

    function vpnHtml(list) {
        if (!list.length) {
            return '<div class="stat-label">VPN serveur</div>' +
                '<div class="stat-value"><span class="led led-off"></span>PERSONNE</div>';
        }
        let h = '<div class="stat-label">VPN serveur</div>' +
            '<div class="stat-value"><span class="led led-active"></span>' + list.length + ' CONNECTÉ' + (list.length > 1 ? 'S' : '') + '</div>';
        list.forEach(function (x) {
            const name = x.user || x.id || 'peer';
            const proto = vpnLabel(x.vpn || x.type);
            const src = x.src_ip || '?';
            const loc = x.local_ip || '';
            h += '<div class="vpn-card">' +
                '<div class="vpn-name"><span class="led" style="background:#0f0;height:7px;width:7px;"></span>' + name + '</div>' +
                '<div class="vpn-meta">' + proto + (x.authenticated === false ? ' · non auth' : '') + '</div>' +
                '<div class="vpn-meta">src ' + src + (loc ? ' → ' + loc : '') + '</div>' +
                '<div class="vpn-meta">↓ ' + fmtBytes(x.rx_bytes) + ' · ↑ ' + fmtBytes(x.tx_bytes) + '</div>' +
                '</div>';
        });
        return h;
    }

    GM_addStyle(`
        body, #u-desktop-body {
            background-image: url("${BG_IMG}") !important;
            background-size: cover !important;
            background-position: center !important;
            background-attachment: fixed !important;
        }
        #u-desktop-body img[src*="bg_freeboxos.svg"], .fbx-os-logo { display: none !important; }
        img#box-avatar.broken { display: none !important; }
        .ultra-panel {
            position: absolute;
            top: 30px; bottom: 80px; width: 280px;
            background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(20px);
            border-radius: 25px; border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px; color: white; font-family: 'Roboto', sans-serif; z-index: 9999;
            box-shadow: 0 10px 40px rgba(0,0,0,0.6); overflow-y: auto;
        }
        #panel-left { left: 10px !important; }
        #panel-right { right: 10px !important; border: 1px solid rgba(255, 0, 0, 0.2); }
        #social-tiles-container {
            position: absolute; left: 50%; transform: translateX(-50%);
            top: 130px; display: flex; gap: 20px; z-index: 10000;
        }
        .social-tile { display: flex; flex-direction: column; align-items: center; cursor: pointer; text-decoration: none !important; transition: transform 0.2s; }
        .social-tile:hover { transform: scale(1.1); }
        .social-tile .icon-wrapper {
            width: 50px; height: 50px; background: rgba(0,0,0,0.6);
            border-radius: 12px; display: flex; align-items: center; justify-content: center;
            overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .social-tile .icon-wrapper svg { width: 28px; height: 28px; fill: white; display: block; margin: auto; }
        .white-tile-custom { background: #FFFFFF !important; border: 1.5px solid #000000 !important; }
        .social-tile img.icon-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .social-tile span { color: white; font-size: 9px; margin-top: 5px; font-weight: bold; text-shadow: 1px 1px 2px black; text-align: center; width: 75px; line-height: 10px; }
        .stat-label { font-size: 10px; color: #aaa; text-transform: uppercase; margin-top: 10px; letter-spacing: 1px; }
        .stat-value { font-size: 17px; font-weight: 700; color: #fff; margin: 1px 0; display: flex; align-items: center; }
        .stat-unit { font-size: 11px; color: #f00; margin-left: 4px; font-weight: 400; }
        .max-val { font-size: 10px; color: #00d4ff; margin-top: -2px; opacity: 0.9; }
        .gauge-bar { width: 100%; height: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 5px; overflow: hidden; }
        .gauge-fill { height: 100%; transition: width 1s ease; }
        .title-h { font-weight:300; margin:0 0 15px 0; font-size:18px; letter-spacing:3px; text-align:center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
        #box-avatar { width: 100px; margin: 0 auto 15px auto; display: block; filter: drop-shadow(0 0 10px rgba(255,0,0,0.3)); }
        .led { height: 9px; width: 9px; border-radius: 50%; display: inline-block; margin-right: 8px; }
        .led-active { background: #00d4ff; box-shadow: 0 0 8px #00d4ff; }
        .led-off { background: #444; }
        .vm-card { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px; margin-top: 10px; border-left: 4px solid #444; }
        .vm-card.active { border-left-color: #00ff00; background: rgba(0,255,0,0.05); }
        .vpn-card { background: rgba(0,212,255,0.06); border-radius: 10px; padding: 8px 10px; margin-top: 8px; border-left: 3px solid #00d4ff; }
        .vpn-name { font-size: 12px; font-weight: 700; color: #fff; }
        .vpn-meta { font-size: 10px; color: #aaa; margin-top: 2px; word-break: break-all; }
        .footer-info { margin-top: 15px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.2); font-size: 11px; line-height: 1.6; color: #ccc; }
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

    function build() {
        if (!document.getElementById('panel-left')) {
            const pl = document.createElement('div');
            pl.id = 'panel-left'; pl.className = 'ultra-panel';
            document.body.appendChild(pl);
        }
        if (!document.getElementById('panel-right')) {
            const pr = document.createElement('div');
            pr.id = 'panel-right'; pr.className = 'ultra-panel';
            document.body.appendChild(pr);
        }
        addSocialTiles();
    }

    async function refresh() {
        build();
        try {
            const [conn, config, sys, diskData, partData, wifi, dhcpCfg, vmData, vpn8, vpn4] = await Promise.all([
                api('/api/v4/connection/'),
                api('/api/v4/connection/config/'),
                api('/api/v4/system/'),
                api('/api/v4/storage/disk/'),
                api('/api/v4/storage/partition/'),
                api('/api/v4/wifi/config/'),
                api('/api/v4/dhcp/config/'),
                api('/api/v8/vm/'),
                api('/api/v8/vpn/connection/'),
                api('/api/v4/vpn/connection/')
            ]);
            if (!conn.success || !sys.success) return;
            const c = conn.result || {};
            const s = sys.result || {};
            const adblockOn = !!(config.success && config.result && config.result.adblock);
            const wifiOn = !!(wifi.success && wifi.result && wifi.result.enabled);
            const dnsPrimary = (dhcpCfg.success && dhcpCfg.result && dhcpCfg.result.dns && dhcpCfg.result.dns.length) ? dhcpCfg.result.dns[0] : 'Auto';
            const updateIcon = s.need_reboot ? '<span style="color:#f44336">📥 Redémarrer</span>' : '<span style="color:#4CAF50">✅ À jour</span>';
            const down = fmtRateBytes(c.rate_down);
            const up = fmtRateBytes(c.rate_up);
            const capDown = fmtCapBits(c.bandwidth_down);
            const capUp = fmtCapBits(c.bandwidth_up);
            const state = (c.state || 'n/a').toUpperCase();
            const media = (c.media || '').toUpperCase();
            const linkOk = state === 'UP' || state === 'ACTIVE';
            let vpnList = [];
            const vpnSrc = (vpn8.success && Array.isArray(vpn8.result)) ? vpn8 : vpn4;
            if (vpnSrc.success && Array.isArray(vpnSrc.result)) {
                vpnList = vpnSrc.result.filter(function (x) { return x && (x.authenticated !== false); });
            }
            const left = document.getElementById('panel-left');
            if (left) {
                left.innerHTML =
                    '<h1 class="title-h">ULTRA <span style="color:#f00; font-weight:900;">NET</span></h1>' +
                    '<img id="box-avatar" src="' + BOX_IMG + '" alt="" onerror="this.classList.add(\'broken\')">' +
                    '<div class="stat-label">Système OS</div>' +
                    '<div style="font-size:11px; margin-bottom:4px;">Version : <b>' + (s.firmware_version || '?') + '</b></div>' +
                    '<div style="font-size:11px; margin-bottom:4px;">État : <b>' + updateIcon + '</b></div>' +
                    '<div style="font-size:11px; color:#aaa; margin-bottom:8px;">Uptime : ' + (s.uptime || '?') + '</div>' +
                    '<div class="stat-label">Réseau Wi-Fi</div>' +
                    '<div class="stat-value"><span class="led ' + (wifiOn ? 'led-active' : 'led-off') + '"></span>' + (wifiOn ? 'ACTIF' : 'OFF') + '</div>' +
                    '<div class="stat-label">Débit Descendant</div>' +
                    '<div class="stat-value">' + down.v + '<span class="stat-unit">' + down.u + '</span></div>' +
                    '<div class="max-val">Capacité : ' + capDown + '</div>' +
                    '<div class="stat-label">Débit Montant</div>' +
                    '<div class="stat-value">' + up.v + '<span class="stat-unit">' + up.u + '</span></div>' +
                    '<div class="max-val">Capacité : ' + capUp + '</div>' +
                    '<div class="footer-info">' +
                    (media || 'LIEN') + ' : <b style="color:' + (linkOk ? '#0f0' : '#f00') + ';">' + state + '</b>' +
                    (media ? ' (' + media + ')' : '') + '<br>' +
                    'IPv4 : <b style="color:#fff">' + (c.ipv4 || 'N/A') + '</b><br>' +
                    (c.ipv6 ? 'IPv6 : <b style="color:#fff;font-size:10px">' + c.ipv6 + '</b><br>' : '') +
                    'DNS : <b style="color:#00d4ff">' + dnsPrimary + '</b><br>' +
                    'Adblock : <b style="color:' + (adblockOn ? '#0f0' : '#f00') + '">' + (adblockOn ? 'ACTIF' : 'OFF') + '</b></div>';
            }
            let vmsHtml = '';
            if (vmData.success && Array.isArray(vmData.result) && vmData.result.length) {
                vmData.result.forEach(function (vm) {
                    const on = vm.status === 'running';
                    vmsHtml += '<div class="vm-card ' + (on ? 'active' : '') + '">' +
                        '<div style="font-size:11px; font-weight:700;"><span class="led" style="background:' + (on ? '#0f0' : '#f00') + '; height:7px; width:7px;"></span>' +
                        String(vm.name || 'VM').toUpperCase() + '</div>' +
                        '<div style="color:' + (on ? '#00ff00' : '#ff4444') + '; font-size:13px; font-weight:bold; font-family:monospace; margin-top:3px;">' +
                        (on ? 'ONLINE' : 'OFFLINE') + '</div></div>';
                });
            } else {
                vmsHtml = '<div style="font-size:11px;color:#888;margin-top:8px;">Aucune VM</div>';
            }
            let diskTemp = 'N/A', freeGB = '0', diskPercent = 0;
            if (diskData.success && diskData.result && diskData.result[0]) {
                const t = diskData.result[0].temp;
                diskTemp = (t === 0 || t) ? t + '°C' : 'N/A';
            }
            if (partData.success && Array.isArray(partData.result)) {
                const p = partData.result.find(function (part) { return part.total_bytes > 0; });
                if (p) {
                    freeGB = ((p.total_bytes - p.used_bytes) / (1024 ** 3)).toFixed(1);
                    diskPercent = ((p.used_bytes / p.total_bytes) * 100).toFixed(1);
                }
            }
            const cpuTemps = [s.temp_cpu0 || s.temp_cpum, s.temp_cpu1 || s.temp_cpum, s.temp_cpu2 || s.temp_cpub, s.temp_cpu3 || s.temp_cpub];
            const fan = Number(s.fan_rpm) || 0;
            const right = document.getElementById('panel-right');
            if (right) {
                right.innerHTML =
                    '<h1 class="title-h">ULTRA <span style="color:#f00; font-weight:900;">SYS</span></h1>' +
                    '<div style="display: flex; flex-wrap: wrap; justify-content: space-between;">' +
                    cpuTemps.map(function (t, i) {
                        const col = tempColor(t);
                        const val = (t === 0 || t) ? t : '--';
                        return '<div style="width: 48%; margin-bottom: 8px;">' +
                            '<div class="stat-label" style="margin-top:0;">CPU ' + i + '</div>' +
                            '<div class="stat-value" style="font-size:15px; color:' + col + ';">' + val + '°C</div>' +
                            '<div class="gauge-bar"><div class="gauge-fill" style="width:' + Math.min(100, Number(t) || 0) + '%; background:' + col + ';"></div></div></div>';
                    }).join('') +
                    '</div>' +
                    '<div class="stat-label">NVMe libre</div>' +
                    '<div class="stat-value" style="font-size:15px;">' + freeGB + ' Go <span style="font-size:11px; color:#aaa; margin-left:auto;">' + diskTemp + '</span></div>' +
                    '<div class="gauge-bar"><div class="gauge-fill" style="width:' + diskPercent + '%; background:#2196F3;"></div></div>' +
                    '<div class="stat-label">Ventilation</div>' +
                    '<div class="stat-value" style="font-size:15px;">' + fan + ' RPM</div>' +
                    '<div class="gauge-bar"><div class="gauge-fill" style="width:' + Math.min(100, (fan / 3500) * 100) + '%; background:#888;"></div></div>' +
                    '<div class="stat-label" style="margin-top:15px; border-top:1px solid #333; padding-top:8px;">Serveurs / VMs</div>' +
                    vmsHtml +
                    '<div style="margin-top:12px;border-top:1px solid #333;padding-top:4px;">' + vpnHtml(vpnList) + '</div>';
            }
        } catch (e) {
            console.error('[Ultra Dashboard]', e);
        }
    }

    build();
    refresh();
    setInterval(refresh, 5000);
    const mo = new MutationObserver(function () {
        if (!document.getElementById('panel-left') || !document.getElementById('social-tiles-container')) build();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
})();
