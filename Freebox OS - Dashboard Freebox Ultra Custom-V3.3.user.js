// ==UserScript==
// @name         Freebox OS - Dashboard Freebox Ultra Custom
// @namespace    http://tampermonkey.net/
// @version      V3.3
// @description  Alignement parfait des icônes SVG (X/Free) et Images
// @author       Steven17200 with Gemini 3
// @match        http://mafreebox.freebox.fr/*
// @match        https://mafreebox.freebox.fr/*
// @match        http://192.168.1.254/*
// @match        https://192.168.1.254/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    const boxImageUrl = "https://i.postimg.cc/FFLkDLFg/Freebox-Ultra-Stranger-Things-perso.png";
    const customBgUrl = "https://raw.githubusercontent.com/Steven17200/freebox-os-ultra-dashboard/ea85a7f54b61d4398e16004306f07acf7c260713/Fond%20Freebox.svg";

    function getTempColor(temp) {
        if (temp < 63) return '#4CAF50';
        if (temp <= 69) return '#FF9800';
        return '#F44336';
    }

    GM_addStyle(`
        /* Fond d'écran et Logos */
        body, #u-desktop-body {
            background-image: url("${customBgUrl}") !important;
            background-size: cover !important;
            background-position: center !important;
            background-attachment: fixed !important;
        }
        #u-desktop-body img[src*="bg_freeboxos.svg"] { display: none !important; }
        .fbx-os-logo, .fbx-os-home-logo, .fbx-os-home-version, .fbx-os-home-logo-cnt {
            color: #FFFFFF !important;
            fill: #FFFFFF !important;
            text-shadow: 0px 2px 4px rgba(0,0,0,0.5) !important;
        }
        .fbx-os-home-logo img, .fbx-os-logo img { filter: brightness(0) invert(1) !important; }

        /* SYMÉTRIE 10PX */
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

        /* TEXTE ROUGE AU CLIC TUILES */
        .u-desktop-shortcut-text { color: #ffffff !important; font-weight: bold !important; }
        .u-desktop-shortcut.u-shortcut-selected .u-desktop-shortcut-text { color: #ff0000 !important; }

        /* STYLE DES TUILES SUR LE BUREAU */
        #social-tiles-container {
            position: absolute;
            left: 310px;
            bottom: 60px;
            display: flex; gap: 15px; z-index: 10;
        }
        .social-tile {
            display: flex; flex-direction: column; align-items: center;
            cursor: pointer; text-decoration: none !important; transition: transform 0.2s;
        }
        .social-tile:hover { transform: scale(1.1); }

        .social-tile .icon-wrapper {
            width: 55px; height: 55px;
            background: rgba(0,0,0,0.6);
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center; /* Centrage total */
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
        }

        /* --- MODIF V3.3 : Centrage forcé pour les icônes SVG (X et Free) --- */
        .social-tile .icon-wrapper svg {
            width: 30px; height: 30px;
            fill: white;
            display: block;
            margin: auto; /* Sécurité supplémentaire pour le centrage */
        }

        /* FOND BLANC + LISERÉ NOIR EXTÉRIEUR POUR LES DEUX ESPACES ABONNÉS */
        .white-tile-custom {
            background: #FFFFFF !important;
            border: 1.5px solid #000000 !important;
        }

        .social-tile img.icon-img {
            width: 100%; height: 100%;
            object-fit: cover;
            display: block;
        }

        .social-tile span { color: white; font-size: 10px; margin-top: 8px; font-weight: bold; text-shadow: 1px 1px 2px black; text-align: center; width: 80px; line-height: 11px; }

        /* Styles statistiques */
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
        .footer-info { margin-top: 15px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.2); font-size: 11px; line-height: 1.6; color: #ccc; }
    `);

    function addSocialTiles() {
        if (document.getElementById('social-tiles-container')) return;
        const container = document.createElement('div');
        container.id = 'social-tiles-container';

        const xIcon = `<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>`;
        const ufSiteIcon = `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRU0fmXzVd3mpLpmZn1gaIQsQMwRSL91Okm1Q&s`;
        const fbxAboIcon = `https://github.com/Steven17200/freebox-os-ultra-dashboard/blob/main/free-app-logo.png?raw=true`;
        const mobileAboIcon = `https://github.com/Steven17200/freebox-os-ultra-dashboard/blob/main/Free_mobile-app-logo.png?raw=true`;

        container.innerHTML = `
            <a href="https://x.com/UniversFreebox/" target="_blank" class="social-tile"><div class="icon-wrapper">${xIcon}</div><span>X Univers Freebox</span></a>
            <a href="https://www.universfreebox.com/" target="_blank" class="social-tile"><div class="icon-wrapper"><img src="${ufSiteIcon}" class="icon-img"></div><span>Univers Freebox</span></a>
            <a href="https://x.com/free" target="_blank" class="social-tile"><div class="icon-wrapper">${xIcon}</div><span>X Free</span></a>
            <a href="https://subscribe.free.fr/login/" target="_blank" class="social-tile"><div class="icon-wrapper white-tile-custom"><img src="${fbxAboIcon}" class="icon-img"></div><span>Espace Freebox</span></a>
            <a href="https://mobile.free.fr/account/v2" target="_blank" class="social-tile"><div class="icon-wrapper white-tile-custom"><img src="${mobileAboIcon}" class="icon-img"></div><span>Espace Mobile</span></a>
        `;
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
        try {
            const [connRes, configRes, sysRes, diskRes, partRes, wifiRes, dhcpCfgRes, vmRes] = await Promise.all([
                fetch('/api/v4/connection/'), fetch('/api/v4/connection/config/'),
                fetch('/api/v4/system/'), fetch('/api/v4/storage/disk/'),
                fetch('/api/v4/storage/partition/'), fetch('/api/v4/wifi/config/'),
                fetch('/api/v4/dhcp/config/'), fetch('/api/v8/vm/')
            ]);
            const conn = await connRes.json(); const config = await configRes.json();
            const sys = await sysRes.json(); const diskData = await diskRes.json();
            const partData = await partRes.json(); const wifi = await wifiRes.json();
            const dhcpCfg = await dhcpCfgRes.json(); const vmData = await vmRes.json();

            if (conn.success && sys.success) {
                const c = conn.result; const s = sys.result;
                const adblockOn = config.success ? config.result.adblock : false;
                const wifiOn = wifi.success ? wifi.result.enabled : false;
                const dnsPrimary = (dhcpCfg.success && dhcpCfg.result.dns && dhcpCfg.result.dns.length > 0) ? dhcpCfg.result.dns[0] : "Auto";
                const updateIcon = s.need_reboot ? '<span style="color:#f44336">📥 Redémarrer</span>' : '<span style="color:#4CAF50">✅ À jour</span>';

                document.getElementById('panel-left').innerHTML = `
                    <h1 class="title-h">ULTRA <span style="color:#f00; font-weight:900;">NET</span></h1>
                    <img id="box-avatar" src="${boxImageUrl}">
                    <div class="stat-label">Système OS</div>
                    <div style="font-size:11px; margin-bottom:4px;">Version : <b>${s.firmware_version}</b></div>
                    <div style="font-size:11px; margin-bottom:4px;">État : <b>${updateIcon}</b></div>
                    <div style="font-size:11px; color:#aaa; margin-bottom:8px;">Uptime : ${s.uptime}</div>
                    <div class="stat-label">Réseau Wi-Fi</div>
                    <div class="stat-value"><span class="led ${wifiOn ? 'led-active' : 'led-off'}"></span>${wifiOn ? 'ACTIF' : 'OFF'}</div>
                    <div class="stat-label">Débit Descendant</div>
                    <div class="stat-value">${(c.rate_down / 125000).toFixed(1)}<span class="stat-unit">Mbps</span></div>
                    <div class="max-val">Capacité : 8.0 Gbps</div>
                    <div class="stat-label">Débit Montant</div>
                    <div class="stat-value">${(c.rate_up / 125000).toFixed(1)}<span class="stat-unit">Mbps</span></div>
                    <div class="max-val">Capacité : 8.0 Gbps</div>
                    <div class="footer-info">
                        FTTH : <b style="color:#0f0;">${c.state.toUpperCase()}</b> (${c.media.toUpperCase()})<br>
                        IP : <b style="color:#fff">${c.ipv4 || 'N/A'}</b><br>
                        DNS : <b style="color:#00d4ff">${dnsPrimary}</b><br>
                        Adblock : <b style="color:${adblockOn ? '#0f0' : '#f00'}">${adblockOn ? 'ACTIF' : 'OFF'}</b>
                    </div>`;

                let vmsHtml = '';
                if (vmData.success && vmData.result) {
                    vmData.result.forEach(vm => {
                        const isRunning = vm.status === 'running';
                        vmsHtml += `<div class="vm-card ${isRunning ? 'active' : ''}"><div style="font-size:11px; font-weight:700;"><span class="led" style="background:${isRunning ? '#0f0' : '#f00'}; height:7px; width:7px;"></span>${vm.name.toUpperCase()}</div><div style="color:${isRunning ? '#00ff00' : '#ff4444'}; font-size:13px; font-weight:bold; font-family:monospace; margin-top:3px;">${isRunning ? 'ONLINE' : 'OFFLINE'}</div></div>`;
                    });
                }
                let diskTemp = "N/A", freeGB = "0", diskPercent = 0;
                if (diskData.success && diskData.result[0]) diskTemp = (diskData.result[0].temp || "N/A") + "°C";
                if (partData.success) {
                    const p = partData.result.find(part => part.total_bytes > 0);
                    if (p) {
                        freeGB = ((p.total_bytes - p.used_bytes) / (1024 ** 3)).toFixed(1);
                        diskPercent = ((p.used_bytes / p.total_bytes) * 100).toFixed(1);
                    }
                }
                const cpuTemps = [s.temp_cpu0||s.temp_cpum, s.temp_cpu1||s.temp_cpum, s.temp_cpu2||s.temp_cpub, s.temp_cpu3||s.temp_cpub];
                document.getElementById('panel-right').innerHTML = `
                    <h1 class="title-h">ULTRA <span style="color:#f00; font-weight:900;">SYS</span></h1>
                    <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
                        ${cpuTemps.map((t, i) => `<div style="width: 48%; margin-bottom: 8px;"><div class="stat-label" style="margin-top:0;">CPU ${i}</div><div class="stat-value" style="font-size:15px; color:${getTempColor(t)};">${t}°C</div><div class="gauge-bar"><div class="gauge-fill" style="width:${t}%; background:${getTempColor(t)};"></div></div></div>`).join('')}
                    </div>
                    <div class="stat-label">NVMe</div>
                    <div class="stat-value" style="font-size:15px;">${freeGB} Go <span style="font-size:11px; color:#aaa; margin-left:auto;">${diskTemp}</span></div>
                    <div class="gauge-bar"><div class="gauge-fill" style="width:${diskPercent}%; background:#2196F3;"></div></div>
                    <div class="stat-label">Ventilation</div>
                    <div class="stat-value" style="font-size:15px;">${s.fan_rpm} RPM</div>
                    <div class="gauge-bar"><div class="gauge-fill" style="width:${(s.fan_rpm/3500)*100}%; background:#888;"></div></div>
                    <div class="stat-label" style="margin-top:15px; border-top:1px solid #333; padding-top:8px;">Serveurs / VMs</div>
                    ${vmsHtml}`;
            }
        } catch (e) { console.error(e); }
    }

    build(); refresh(); setInterval(refresh, 5000);
})();
