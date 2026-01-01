// ==UserScript==
// @name         Freebox OS - Dashboard Freebox Ultra limited
// @namespace    https://github.com/Steven17200/freebox-os-ultra-dashboard
// @version      V1
// @description  Dashboard
// @author       Steven17200 with Gemini 3
// @match        http://mafreebox.freebox.fr/
// @match        https://mafreebox.freebox.fr/
// @icon         https://www.free.fr/favicon.ico
// @match        http://192.168.1.254/
// @match        https://192.168.1.254/
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
 // --- Changer la source de l'image par le votre ---
    const boxImageUrl = "https://github.com/Steven17200/freebox-os-ultra-dashboard/blob/main/freebox%20Classic.png?raw=true";

function getTempColor(temp) {
        if (temp < 63) return '#4CAF50';
        if (temp <= 69) return '#FF9800';
        return '#F44336';
    }

    const css = `
        #u-desktop-body img[src*="bg_freeboxos.svg"], .fbx-os-logo { display: none !important; }
        .ultra-panel {
            position: absolute; top: 30px; bottom: 80px; width: 260px;
            background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(15px);
            border-radius: 25px; border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 25px; color: white; font-family: 'Roboto', sans-serif; z-index: 9999;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        #panel-left { left: 30px; }
        #panel-right { right: 30px; border: 1px solid rgba(255, 0, 0, 0.2); }
        .stat-label { font-size: 11px; color: #aaa; text-transform: uppercase; margin-top: 12px; letter-spacing: 1px; }
        .stat-value { font-size: 19px; font-weight: 700; color: #fff; margin: 1px 0; }
        .stat-unit { font-size: 12px; color: #f00; margin-left: 4px; }
        .max-val { font-size: 11px; color: #00d4ff; font-weight: normal; margin-top: -2px; margin-bottom: 5px; opacity: 0.8; }
        .gauge-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 6px; overflow: hidden; }
        .gauge-fill { height: 100%; transition: width 1s ease-in-out, background-color 0.5s ease; }
        .title-h { font-weight:300; margin:0 0 15px 0; font-size:18px; letter-spacing:2px; text-align:center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
        #box-avatar { width: 90px; margin: 0 auto 10px auto; display: block; }
        .footer-info { margin-top: 12px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.2); font-size: 11px; line-height: 1.5; }
        .state-up { color: #00ff00; font-weight: bold; }
        .state-down { color: #f44336; font-weight: bold; }
        .led { height: 10px; width: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; }
    `;

    GM_addStyle(css);

    function build() {
        const body = document.getElementById('u-desktop-body') || document.body;
        if (!document.getElementById('panel-left')) {
            const pl = document.createElement('div'); pl.id = 'panel-left'; pl.className = 'ultra-panel';
            pl.innerHTML = `<h1 class="title-h">ULTRA <span style="color:#f00; font-weight:900;">NET</span></h1><img id="box-avatar" src="${boxImageUrl}"><div id="content-left">...</div>`;
            body.appendChild(pl);
        }
        if (!document.getElementById('panel-right')) {
            const pr = document.createElement('div'); pr.id = 'panel-right'; pr.className = 'ultra-panel';
            pr.innerHTML = `<h1 class="title-h">ULTRA <span style="color:#f00; font-weight:900;">SYS</span></h1><div id="content-right">...</div>`;
            body.appendChild(pr);
        }
    }

    async function refresh() {
        try {
            const [connRes, configRes, sysRes, diskRes, partRes, wifiRes, dhcpRes, lanRes] = await Promise.all([
                fetch('/api/v4/connection/'), fetch('/api/v4/connection/config/'),
                fetch('/api/v4/system/'), fetch('/api/v4/storage/disk/'),
                fetch('/api/v4/storage/partition/'), fetch('/api/v4/wifi/config/'),
                fetch('/api/v4/dhcp/config/'), fetch('/api/v4/lan/browser/interfaces/')
            ]);

            const conn = await connRes.json();
            const config = await configRes.json();
            const sys = await sysRes.json();
            const diskData = await diskRes.json();
            const partData = await partRes.json();
            const wifi = await wifiRes.json();
            const dhcp = await dhcpRes.json();
            const lan = await lanRes.json();

            if (conn.success && sys.success) {
                const c = conn.result; const s = sys.result;
                const wifiOn = wifi.success ? wifi.result.enabled : false;
                const adblockOn = config.success ? config.result.adblock : false;
                const dnsPrimary = (dhcp.success && dhcp.result.dns && dhcp.result.dns.length > 0) ? dhcp.result.dns[0] : "Auto (Free)";
                const deviceCount = (lan.success && lan.result[0]) ? lan.result[0].host_count : "0";

                const currentDown = (c.rate_down / 125000).toFixed(1);
                const currentUp = (c.rate_up / 125000).toFixed(1);

                let maxD = (c.bandwidth_down / 125000);
                let maxU = (c.bandwidth_up / 125000);
                if (maxD > 8500) maxD = 8000;
                if (maxU > 8500) maxU = 8000;

                const isUp = c.state === "up";

                document.getElementById('content-left').innerHTML = `
                    <div class="stat-label">Wi-Fi & Appareils</div>
                    <div class="stat-value" style="display: flex; align-items: center; font-size: 15px;">
                        <span class="led" style="background:${wifiOn ? '#00d4ff' : '#555'}; box-shadow: 0 0 6px ${wifiOn ? '#00d4ff' : 'transparent'};"></span>
                        ${deviceCount} Appareils
                    </div>

                    <div class="stat-label">Débit Descendant</div>
                    <div class="stat-value">${currentDown}<span class="stat-unit">Mbps</span></div>
                    <div class="max-val">Capacité : ${maxD.toFixed(0)} Mbps</div>

                    <div class="stat-label">Débit Montant</div>
                    <div class="stat-value">${currentUp}<span class="stat-unit">Mbps</span></div>
                    <div class="max-val">Capacité : ${maxU.toFixed(0)} Mbps</div>

                    <div class="footer-info">
                        Ligne : <b>${c.media.toUpperCase()}</b> | État : <span class="${isUp ? 'state-up' : 'state-down'}">${isUp ? 'UP' : 'DOWN'}</span><br>
                        IP : <b style="color:#fff">${c.ipv4 || 'N/A'}</b><br>
                        DNS : <b style="color:#00d4ff">${dnsPrimary}</b><br>
                        Adblock : <b style="color:${adblockOn ? '#00ff00' : '#f44336'}">${adblockOn ? 'ACTIF' : 'OFF'}</b>
                    </div>
                `;

                let diskTemp = "N/A", freeGBText = "Calcul...", diskPercent = 0;
                if (diskData.success && diskData.result[0]) diskTemp = (diskData.result[0].temp || "N/A") + "°C";
                if (partData.success) {
                    const p = partData.result.find(part => part.total_bytes > 0);
                    if (p) {
                        freeGBText = ((p.total_bytes - p.used_bytes) / (1024 ** 3)).toFixed(1);
                        diskPercent = ((p.used_bytes / p.total_bytes) * 100).toFixed(1);
                    }
                }
                const cpuTemps = [s.temp_cpu0||s.temp_cpum, s.temp_cpu1||s.temp_cpum, s.temp_cpu2||s.temp_cpub, s.temp_cpu3||s.temp_cpub];

                document.getElementById('content-right').innerHTML = `
                    <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
                        ${cpuTemps.map((temp, i) => `
                            <div style="width: 48%; margin-bottom: 5px;">
                                <div class="stat-label" style="margin-top:5px;">CPU ${i}</div>
                                <div class="stat-value" style="font-size:16px; color:${getTempColor(temp)};">${temp}°C</div>
                                <div class="gauge-bar" style="height:4px;"><div class="gauge-fill" style="width:${temp}%; background-color:${getTempColor(temp)};"></div></div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="stat-label">Espace Libre (NVMe)</div>
                    <div class="stat-value">${freeGBText}<span class="stat-unit">Go dispos</span> <span style="font-size: 12px; color: #aaa; float:right;">${diskTemp}</span></div>
                    <div class="gauge-bar"><div class="gauge-fill" style="width:${diskPercent}%; background:#2196F3;"></div></div>
                    <div class="stat-label" style="margin-top:10px;">Ventilation</div>
                    <div class="stat-value">${s.fan_rpm}<span class="stat-unit">RPM</span></div>
                    <div class="gauge-bar"><div class="gauge-fill" style="width:${Math.min(s.fan_rpm/35, 100)}%; background:#888;"></div></div>

                    <div class="footer-info">
                        Uptime: <b>${s.uptime}</b><br>
                        Version OS: <b style="color:#00d4ff">${s.firmware_version}</b>
                    </div>
                `;
            }
        } catch (e) { console.error("Erreur Dash:", e); }
    }

    build();
    refresh();
    setInterval(refresh, 5000);
})();
