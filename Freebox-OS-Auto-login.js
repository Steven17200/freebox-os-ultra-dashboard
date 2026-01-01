// ==UserScript==
// @name         Freebox OS Auto-login
// @namespace    https://github.com/Steven17200/freebox-os-ultra-dashboard
// @version      1.0
// @description  Remplit automatiquement le mot de passe et clique sur le bouton de connexion pour le modem.
// @author       Steven17200
// @match        https://192.168.1.254/login.php
// @match        http://mafreebox.freebox.fr/
// @icon         https://www.free.fr/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Définir le mot de passe
    const password = 'VOTRE_PASSWORD';

    // Attendre que le champ de mot de passe soit disponible
    const waitForPasswordField = setInterval(() => {
        const passwordField = document.querySelector('input[type="password"]');
        if (passwordField) {
            clearInterval(waitForPasswordField);

            // Remplir le mot de passe
            passwordField.value = password;

            // Attendre 1 seconde avant de cliquer sur le bouton de connexion
            setTimeout(() => {
                const loginButton = document.querySelector('input[type="submit"][value="Connexion"], button[type="submit"]');
                if (loginButton) {
                    loginButton.click();
                } else {
                    console.error('Bouton de connexion non trouvé.');
                }
            }, 1000);
        }
    }, 100); // Vérifier toutes les 100ms
})();
