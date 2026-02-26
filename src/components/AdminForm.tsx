"use client";

import { useState } from "react";
import { addDailyQuestion } from "@/app/admin/actions";

export default function AdminForm() {
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<{ error?: string; success?: boolean }>({});

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        setMessage({});

        const result = await addDailyQuestion(formData);

        if (result.error) {
            setMessage({ error: result.error });
        } else if (result.success) {
            setMessage({ success: true });
            (document.getElementById('admin-form') as HTMLFormElement).reset();
        }

        setIsPending(false);
    }

    // Obtenir la date d'aujourd'hui formatée YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    return (
        <form id="admin-form" action={handleSubmit} className="flex flex-col gap-4 relative z-10 w-full">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 tracking-wider">LA QUESTION (QCM)</label>
                <textarea
                    name="questionText"
                    placeholder="Ex: Si tu devais manger un seul plat toute ta vie..."
                    required
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-y min-h-[80px] text-white"
                />
            </div>

            <div className="flex flex-col gap-3 p-4 border border-slate-700/50 rounded-xl bg-slate-950/50 shadow-inner mt-2">
                <label className="text-xs font-bold text-indigo-400 tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    LES RÉPONSES
                </label>

                <div className="flex flex-col gap-2">
                    <input name="option1" required placeholder="Option 1 (obligatoire)" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                    <input name="option2" required placeholder="Option 2 (obligatoire)" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                    <input name="option3" placeholder="Option 3 (facultative)" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                    <input name="option4" placeholder="Option 4 (facultative)" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
            </div>

            {message.error && (
                <p className="text-red-400 text-xs font-semibold">{message.error}</p>
            )}

            {message.success && (
                <p className="text-emerald-400 text-xs font-semibold p-2 bg-emerald-950 rounded-lg text-center shadow-lg">
                    ✅ La question a été ajoutée à la banque de questions !
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 px-4 rounded-xl mt-2 transition-transform active:scale-[0.98] disabled:opacity-50"
            >
                {isPending ? "Ajout en cours..." : "Ajouter cette question"}
            </button>
        </form>
    );
}
