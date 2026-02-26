"use client";

import { useState } from "react";
import { updatePrivacySettings } from "./actions";

export default function PrivacyForm({ initialFriendsPrivacy, initialAnswersPrivacy }: { initialFriendsPrivacy: string, initialAnswersPrivacy: string }) {
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [privacyFriends, setPrivacyFriends] = useState(initialFriendsPrivacy);
    const [privacyAnswers, setPrivacyAnswers] = useState(initialAnswersPrivacy);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setMessage({ text: "", type: "" });

        const formData = new FormData();
        formData.append("privacyFriends", privacyFriends);
        formData.append("privacyAnswers", privacyAnswers);

        const res = await updatePrivacySettings(formData);

        if (res?.error) {
            setMessage({ text: res.error, type: "error" });
        } else if (res?.success) {
            setMessage({ text: "Préférences mises à jour !", type: "success" });
        }

        setIsPending(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 p-6 rounded-3xl shadow-xl flex flex-col gap-6">
            {message.text && (
                <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-950/50 text-red-400 border border-red-900/50' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        {message.type === 'error' ? (
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        )}
                    </svg>
                    {message.text}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Qui peut voir tes amis ?</label>
                <select
                    value={privacyFriends}
                    onChange={(e) => setPrivacyFriends(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 p-3 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                >
                    <option value="public">🌍 Tout le monde (Public)</option>
                    <option value="friends">👥 Mes amis uniquement</option>
                    <option value="private">🔒 Seulement moi (Privé)</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Qui peut voir tes réponses ?</label>
                <select
                    value={privacyAnswers}
                    onChange={(e) => setPrivacyAnswers(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 p-3 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                >
                    <option value="public">🌍 Tout le monde (Public)</option>
                    <option value="friends">👥 Mes amis uniquement</option>
                    <option value="private">🔒 Seulement moi (Privé)</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30 flex justify-center items-center gap-2 group disabled:opacity-50"
            >
                {isPending ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Enregistrement...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Sauvegarder les préférences
                    </>
                )}
            </button>
        </form>
    );
}
