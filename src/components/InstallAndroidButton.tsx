"use client";

import { useEffect, useState } from "react";

export default function InstallAndroidButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert(
                "L'installation automatique n'est pas disponible 😕\n\n" +
                "Pourquoi ?\n" +
                "1. Tu es en mode développement (localhost), l'installation est désactivée.\n" +
                "2. Ou ton appareil a déjà installé l'application.\n" +
                "3. Ou tu navigues depuis un navigateur incompatible ou en mode privé.\n\n" +
                "Pour forcer l'installation manuellement, ouvre le menu de ton navigateur (les 3 petits points) et choisis 'Ajouter à l'écran d\\'accueil'."
            );
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        // We no longer need the prompt. Clear it up.
        setDeferredPrompt(null);
    };

    return (
        <button
            onClick={handleInstallClick}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-emerald-500/20"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Installer l'application
        </button>
    );
}
