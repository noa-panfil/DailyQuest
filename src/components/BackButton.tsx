"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallbackUrl = "/" }: { fallbackUrl?: string }) {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 2) {
            router.back();
        } else {
            router.push(fallbackUrl);
        }
    };

    return (
        <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center bg-slate-800/50 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 rounded-xl transition-all duration-200 border border-slate-700/50 hover:border-indigo-500/30 active:scale-90"
            title="Retour"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    );
}
