"use client";

import { useState, useEffect } from "react";

export default function LostStrikePopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(true);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative origin-center transition-all animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center border-2 border-red-500/50 shadow-inner">
                        <span className="text-3xl">💔</span>
                    </div>
                    <h2 className="text-xl font-black text-white bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">Série brisée...</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Mince ! Tu as raté la dernière question et ta série est retombée à <strong className="text-white">zéro</strong>.<br /><br />
                        Pas de panique, c'est l'occasion parfaite de recommencer une nouvelle série encore plus longue !
                    </p>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="mt-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-colors border border-slate-600 shadow-md transform active:scale-[0.98]"
                    >
                        C'est reparti !
                    </button>
                </div>
            </div>
        </div>
    );
}
