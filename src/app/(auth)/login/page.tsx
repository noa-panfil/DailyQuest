"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import Link from "next/link";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, null);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-10 -translate-y-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -translate-x-10 translate-y-20 pointer-events-none" />

            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col items-center">

                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
                    DailyQuest
                </h1>
                <p className="text-slate-400 text-sm mb-8 font-medium">Bon retour ! Prêt pour la quête du jour ?</p>

                <form action={formAction} className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="ton@email.com"
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-slate-600 shadow-inner"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Mot de passe</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-slate-600 shadow-inner"
                        />
                    </div>

                    {state?.error && (
                        <p className="text-red-400 text-xs font-bold px-1">{state.error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/25 mt-2 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <p className="text-slate-500 text-xs font-semibold mt-6">
                    Tu n'as pas de compte ?{" "}
                    <Link href="/register" className="text-indigo-400 hover:text-indigo-300">
                        Créer un compte
                    </Link>
                </p>
            </div>
        </div>
    );
}
