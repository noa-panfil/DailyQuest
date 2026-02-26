"use client";

import { rejectOrRemoveFriend } from "@/app/friends/actions";
import { useState } from "react";

export default function RemoveFriendButton({ friendshipId, friendName }: { friendshipId: number, friendName: string }) {
    const [isPending, setIsPending] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleConfirmRemove = async () => {
        setIsPending(true);
        const formData = new FormData();
        formData.append("friendshipId", friendshipId.toString());
        await rejectOrRemoveFriend(formData);
        // Page will revalidate and close modal organically, or we finish pending state if needed
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={isPending}
                title="Retirer"
                className="p-2 text-slate-500 hover:bg-slate-800 hover:text-red-400 rounded-xl transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
            >
                {isPending ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                )}
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-6 scale-in-center">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100">Retirer un ami</h3>
                            <p className="text-slate-400 text-sm">
                                Es-tu sûr de vouloir retirer <span className="font-bold text-indigo-400">@{friendName}</span> de tes amis ?
                            </p>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isPending}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition duration-200 border border-slate-700"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmRemove}
                                disabled={isPending}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition duration-200 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                        Retrait...
                                    </>
                                ) : "Oui, retirer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
