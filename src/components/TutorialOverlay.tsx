"use client";

import { useState, useEffect } from "react";
import { finishTutorial } from "@/app/actions/tutorial";
import { useRouter } from "next/navigation";

export default function TutorialOverlay({ username }: { username: string }) {
    const [step, setStep] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const router = useRouter();

    const nextStep = (delay = 0) => {
        if (delay > 0) {
            setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => { setStep(s => s + 1); setIsTransitioning(false); }, 300);
            }, delay);
        } else {
            setIsTransitioning(true);
            setTimeout(() => { setStep(s => s + 1); setIsTransitioning(false); }, 300);
        }
    };

    // Auto-advance step 0 after 3 seconds
    useEffect(() => {
        if (step === 0) {
            nextStep(3000);
        }
    }, []);

    // Simulate chat receiving response
    useEffect(() => {
        if (step === 5 && selectedAnswer) {
            setChatMessages([
                { id: 1, text: `🚨 Mon vote de ce jour : ${selectedAnswer}`, isMe: true }
            ]);

            setTimeout(() => {
                setChatMessages(prev => [
                    ...prev,
                    { id: 2, text: "Félicitations ! Tu as terminé le tutoriel, tu es prêt à profiter de DailyQuest au maximum !🚀", isMe: false, sender: "Tutoriel", isFinal: true }
                ]);
            }, 1500);
        }
    }, [step, selectedAnswer]);

    const handleAnswer = (ans: string) => {
        setSelectedAnswer(ans);
        nextStep(600); // give time to see click then advance
    };

    const handleFinish = async () => {
        setIsTransitioning(true);
        await finishTutorial();
        router.refresh();
    };

    return (
        <div className="fixed inset-0 min-h-[100dvh] bg-slate-950/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4">

            <div className={`w-full max-w-md transition-all duration-500 ease-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

                {step === 0 && (
                    <div className="flex flex-col items-center gap-6 text-center animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl p-1 shadow-2xl shadow-indigo-500/50 flex items-center justify-center mb-2">
                            <span className="text-5xl font-bold text-white">DQ</span>
                        </div>
                        <h1 className="text-3xl font-black text-white">Bienvenue sur DailyQuest, <span className="text-indigo-400">{username}</span> !</h1>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            Faisons ensemble tes premiers pas dans l'application.
                        </p>
                    </div>
                )}

                {step === 1 && (
                    <div className="flex flex-col items-center gap-6 animate-in slide-in-from-right-8 duration-500 w-full">
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                            <h2 className="text-xl font-bold text-white mb-4">Étape 1 : Trouve ton premier ami</h2>
                            <p className="text-slate-400 text-sm mb-6">Dans DailyQuest, on ne s'amuse pas seul. Ajoute le robot "Tutoriel" dans tes amis.</p>

                            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
                                        TU
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white">Tutoriel</span>
                                        <span className="text-xs text-slate-400">Le Guide Officiel</span>
                                    </div>
                                </div>
                                <button onClick={() => nextStep(0)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg animate-pulse">
                                    Ajouter
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col items-center gap-6 animate-in slide-in-from-right-8 duration-500 w-full">
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full shadow-2xl relative overflow-hidden text-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                            <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Ami ajouté !</h2>
                            <p className="text-slate-400 text-sm mb-6">Tutoriel a accepté ta demande instantanément.</p>

                            <h2 className="text-xl font-bold text-white mb-4 mt-8">Étape 2 : Créons un groupe</h2>
                            <p className="text-slate-400 text-sm mb-6">Les quêtes quotidiennes se partagent en groupe pour ouvrir les débats.</p>

                            <button onClick={() => nextStep(0)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 mt-2">
                                Créer le groupe "Mon Premier Groupe"
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col items-center gap-6 animate-in slide-in-from-right-8 duration-500 w-full text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mx-auto shadow-lg shadow-blue-500/20 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-white">Parfait !</h2>
                        <p className="text-slate-300">Le groupe a été créé. Il est temps de passer à l'action.</p>
                        <button onClick={() => nextStep(0)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-full transition-colors mt-2">
                            Continuer
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="flex flex-col items-center gap-4 animate-in slide-in-from-right-8 duration-500 w-full">
                        <h2 className="text-xl font-bold text-white text-center mb-2">Étape 3 : Ta Première Question</h2>

                        <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full shadow-2xl relative overflow-hidden">
                            <div className="p-6 pb-4 border-b border-slate-800">
                                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-wide uppercase mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    Question du jour (Tutoriel)
                                </div>
                                <h3 className="text-xl font-extrabold text-white leading-tight">
                                    Pour naviguer sur l'application, qu'est-ce qui est le plus important ?
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 p-6 pt-4">
                                {["Des questions stimulantes", "L'interface magnifique", "Interagir avec mes amis"].map((ans, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(ans)}
                                        className={`p-4 rounded-xl border text-left font-bold transition-all ${selectedAnswer === ans ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
                                            }`}
                                    >
                                        {ans}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="flex flex-col h-[70vh] max-h-[600px] w-full bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                        {/* Header Group */}
                        <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 bg-indigo-600 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-white text-xs z-10">TU</div>
                                <div className="w-10 h-10 bg-emerald-600 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-white text-xs z-0">TOI</div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Mon Premier Groupe</h3>
                                <p className="text-xs text-slate-400">2 membres (Toi + Tutoriel)</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-slate-950">
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`flex flex-col gap-2 w-full animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                                    <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl p-3 ${msg.isMe
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md rounded-tr-sm'
                                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                                            }`}>
                                            {!msg.isMe && <span className="text-xs font-bold text-indigo-400 mb-1 block">{msg.sender}</span>}
                                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>

                                    {/* Apparition du bouton juste sous le message final de Tutoriel */}
                                    {msg.isFinal && (
                                        <div className="w-full flex justify-center mt-6 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500">
                                            <button onClick={handleFinish} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-3 hover:scale-105 active:scale-95">
                                                Terminer le tutoriel
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
