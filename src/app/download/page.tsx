"use client";

import { useState } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import InstallAndroidButton from "@/components/InstallAndroidButton";

export default function DownloadPage() {
    const [selectedOS, setSelectedOS] = useState<'ios' | 'android' | null>(null);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
            <header className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Télécharger l'App
                </h1>
                <BackButton fallbackUrl="/account" />
            </header>

            <main className="flex-1 flex flex-col max-w-md mx-auto p-6 gap-8 pb-24 w-full">

                <div className="text-center mt-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl p-1 shadow-2xl shadow-indigo-500/30 mb-6 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm rounded-[22px]"></div>
                        <span className="text-5xl z-10 font-bold bg-gradient-to-br from-white to-slate-200 bg-clip-text text-transparent">DQ</span>
                    </div>

                    <h2 className="text-2xl font-black mb-2 text-slate-100">DailyQuest partout avec toi</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        Installe l'application directement sur l'écran d'accueil de ton téléphone pour ne rater aucune question !
                    </p>
                </div>

                {!selectedOS ? (
                    <div className="flex flex-col gap-4">
                        <h3 className="text-slate-300 font-bold text-center mb-2">Sur quel appareil es-tu ?</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedOS('ios')}
                                className="bg-slate-900 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-4 group transition-all"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16.365 1.545c.801-.989 1.353-2.395 1.205-3.801-1.229.049-2.731.841-3.565 1.838-.667.801-1.295 2.257-1.115 3.633 1.365.105 2.7-.723 3.475-1.67zm-1.127 4.199c-1.85-.045-3.415 1.135-4.329 1.135-.916 0-2.285-1.077-3.829-1.045-2.009.027-3.865 1.163-4.897 2.969-2.109 3.665-.541 9.071 1.511 12.025 1.005 1.455 2.207 3.109 3.791 3.051 1.517-.061 2.091-.985 3.923-.985 1.831 0 2.355.985 3.945.955 1.637-.025 2.665-1.503 3.655-2.957 1.141-1.669 1.611-3.287 1.636-3.371-.035-.015-3.159-1.213-3.193-4.821-.027-3.023 2.473-4.493 2.585-4.555-1.423-2.079-3.619-2.361-4.399-2.401z" />
                                    </svg>
                                </div>
                                <span className="font-bold text-white text-lg">Apple</span>
                                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">iPhone / iPad</span>
                            </button>

                            <button
                                onClick={() => setSelectedOS('android')}
                                className="bg-slate-900 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/50 p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-4 group transition-all"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                        <path d="M17.523 15.3414C17.523 16.0354 16.9602 16.5982 16.2662 16.5982C15.5722 16.5982 15.0094 16.0354 15.0094 15.3414C15.0094 14.6474 15.5722 14.0846 16.2662 14.0846C16.9602 14.0846 17.523 14.6474 17.523 15.3414ZM8.99059 15.3414C8.99059 16.0354 8.4278 16.5982 7.7338 16.5982C7.0398 16.5982 6.47701 16.0354 6.47701 15.3414C6.47701 14.6474 7.0398 14.0846 7.7338 14.0846C8.4278 14.0846 8.99059 14.6474 8.99059 15.3414ZM18.0673 10.3688L19.8675 7.25881C19.9575 7.10086 19.9042 6.89655 19.7462 6.80653C19.5883 6.71651 19.384 6.76983 19.294 6.92778L17.4475 10.1264C15.8286 9.39088 13.978 8.97395 12 8.97395C10.022 8.97395 8.17143 9.39088 6.55246 10.1264L4.70599 6.92778C4.61598 6.76983 4.41167 6.71651 4.25372 6.80653C4.09577 6.89655 4.04245 7.10086 4.13247 7.25881L5.93274 10.3688C2.51522 12.2359 0.22416 15.7533 0 19.8519H24C23.7758 15.7533 21.4848 12.2359 18.0673 10.3688Z" />
                                    </svg>
                                </div>
                                <span className="font-bold text-white text-lg">Android</span>
                                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Samsung, Pixel...</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                        <button
                            onClick={() => setSelectedOS(null)}
                            className="text-indigo-400 text-sm font-bold flex items-center gap-2 hover:text-indigo-300 w-fit"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Changer d'appareil
                        </button>

                        {selectedOS === 'ios' && (
                            /* Section iOS */
                            <section className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-blue-500/10 transition-colors" />

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16.365 1.545c.801-.989 1.353-2.395 1.205-3.801-1.229.049-2.731.841-3.565 1.838-.667.801-1.295 2.257-1.115 3.633 1.365.105 2.7-.723 3.475-1.67zm-1.127 4.199c-1.85-.045-3.415 1.135-4.329 1.135-.916 0-2.285-1.077-3.829-1.045-2.009.027-3.865 1.163-4.897 2.969-2.109 3.665-.541 9.071 1.511 12.025 1.005 1.455 2.207 3.109 3.791 3.051 1.517-.061 2.091-.985 3.923-.985 1.831 0 2.355.985 3.945.955 1.637-.025 2.665-1.503 3.655-2.957 1.141-1.669 1.611-3.287 1.636-3.371-.035-.015-3.159-1.213-3.193-4.821-.027-3.023 2.473-4.493 2.585-4.555-1.423-2.079-3.619-2.361-4.399-2.401z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Sur iPhone & iPad</h3>
                                </div>

                                <ol className="flex flex-col gap-4 text-sm text-slate-300">
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                                        <p>Ouvre Safari (ça ne marche pas sur Chrome/Firefox iOS).</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                                        <p>
                                            Appuie sur le bouton de Partage en bas de l'écran
                                            <span className="inline-flex items-center bg-slate-800 px-2 py-1 ml-2 rounded-lg text-blue-400 leading-none shadow-inner border border-slate-700/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            </span>
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                                        <p>
                                            Choisis <strong>"Sur l'écran d'accueil"</strong> (icône avec un petit +).
                                            <span className="inline-flex items-center bg-slate-800 px-2 py-1 ml-2 rounded-lg text-slate-200 leading-none shadow-inner border border-slate-700/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </span>
                                        </p>
                                    </li>
                                </ol>
                            </section>
                        )}

                        {selectedOS === 'android' && (
                            /* Section Android */
                            <section className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-emerald-500/10 transition-colors" />

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                            <path d="M17.523 15.3414C17.523 16.0354 16.9602 16.5982 16.2662 16.5982C15.5722 16.5982 15.0094 16.0354 15.0094 15.3414C15.0094 14.6474 15.5722 14.0846 16.2662 14.0846C16.9602 14.0846 17.523 14.6474 17.523 15.3414ZM8.99059 15.3414C8.99059 16.0354 8.4278 16.5982 7.7338 16.5982C7.0398 16.5982 6.47701 16.0354 6.47701 15.3414C6.47701 14.6474 7.0398 14.0846 7.7338 14.0846C8.4278 14.0846 8.99059 14.6474 8.99059 15.3414ZM18.0673 10.3688L19.8675 7.25881C19.9575 7.10086 19.9042 6.89655 19.7462 6.80653C19.5883 6.71651 19.384 6.76983 19.294 6.92778L17.4475 10.1264C15.8286 9.39088 13.978 8.97395 12 8.97395C10.022 8.97395 8.17143 9.39088 6.55246 10.1264L4.70599 6.92778C4.61598 6.76983 4.41167 6.71651 4.25372 6.80653C4.09577 6.89655 4.04245 7.10086 4.13247 7.25881L5.93274 10.3688C2.51522 12.2359 0.22416 15.7533 0 19.8519H24C23.7758 15.7533 21.4848 12.2359 18.0673 10.3688Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Sur Android</h3>
                                </div>

                                <div className="mt-4">
                                    <InstallAndroidButton />
                                </div>
                            </section>
                        )}

                        <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 px-6 rounded-2xl text-center w-full transition-colors border border-slate-700/80 shadow-lg flex items-center justify-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            J'ai compris, retour à l'accueil
                        </Link>
                    </div>
                )}

            </main>
        </div>
    );
}
