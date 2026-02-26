"use client";

import { useState } from "react";
import { addMemberToGroup, leaveGroup, kickMember } from "./actions";
import { useRouter } from "next/navigation";

export default function GroupMembersModal({
    groupId,
    groupName,
    members,
    availableFriends,
    isAdmin,
    currentUserId
}: {
    groupId: number,
    groupName: string,
    members: any[],
    availableFriends: any[],
    isAdmin: boolean,
    currentUserId: number
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [kickConfirm, setKickConfirm] = useState<{ id: number, username: string } | null>(null);
    const [leaveConfirm, setLeaveConfirm] = useState(false);
    const router = useRouter();

    const handleAddFriend = async (friendId: number) => {
        setIsPending(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("groupId", groupId.toString());
        formData.append("userId", friendId.toString());

        const res = await addMemberToGroup(formData);
        if (res?.error) {
            setError(res.error);
        } else if (res?.success) {
            setSuccess("Ami ajouté avec succès !");
            router.refresh();
        }
        setIsPending(false);
    };

    const handleLeave = async () => {
        setIsPending(true);
        const res = await leaveGroup(groupId);
        if (res?.error) {
            setError(res.error);
            setIsPending(false);
            setLeaveConfirm(false);
        } else {
            router.push("/groups");
        }
    };

    const handleKick = async () => {
        if (!kickConfirm) return;
        setIsPending(true);
        const res = await kickMember(groupId, kickConfirm.id);
        if (res?.error) {
            setError(res.error);
        } else {
            setSuccess(`${kickConfirm.username} a été exclu.`);
            router.refresh();
        }
        setKickConfirm(null);
        setIsPending(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl transition duration-200 shadow-md active:scale-95"
                title="Membres"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-200">Membres</h2>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto pr-2 flex flex-col gap-6">
                            {/* Liste des membres */}
                            <div className="flex flex-col gap-3">
                                {members.map(m => (
                                    <div key={m.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 group/member transition-all hover:bg-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-sm uppercase text-slate-300 shadow-inner">
                                                {m.username.slice(0, 2)}
                                            </div>
                                            <span className="font-semibold text-slate-200">{m.username} {m.id === currentUserId && "(Toi)"}</span>
                                        </div>

                                        {isAdmin && m.id !== currentUserId && (
                                            <button
                                                onClick={() => setKickConfirm({ id: m.id, username: m.username })}
                                                className="p-2 text-slate-500 hover:text-red-400 transition-all hover:scale-110 active:scale-90"
                                                title="Exclure ce membre"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {(!isAdmin || members.length > 1) && (
                                    <button
                                        onClick={() => setLeaveConfirm(true)}
                                        disabled={isPending}
                                        className="mt-2 w-full p-3 rounded-2xl border border-red-900/30 bg-red-950/20 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                    >
                                        Quitter le groupe
                                    </button>
                                )}
                            </div>

                            {/* Section pour ajouter des potes */}
                            {isAdmin && (
                                <div className="border-t border-slate-800 pt-4 mt-2 flex flex-col gap-3">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Ajouter des amis</h3>

                                    {error && <p className="text-red-400 text-xs font-semibold px-1">{error}</p>}
                                    {success && <p className="text-emerald-400 text-xs font-semibold px-1 p-2 bg-emerald-950/50 rounded-lg">{success}</p>}

                                    {availableFriends.length === 0 ? (
                                        <p className="text-xs text-slate-500 italic p-2">Aucun ami disponible à inviter.</p>
                                    ) : (
                                        availableFriends.map(f => (
                                            <div key={f.id} className="flex items-center justify-between p-3 bg-indigo-950/20 rounded-2xl border border-indigo-900/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center font-bold text-xs uppercase text-indigo-300">
                                                        {f.username.slice(0, 2)}
                                                    </div>
                                                    <span className="font-semibold text-slate-200 text-sm">{f.username}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleAddFriend(f.id)}
                                                    disabled={isPending}
                                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-xl transition duration-200 shadow-lg text-xs disabled:opacity-50"
                                                >
                                                    Ajouter
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pop-up de confirmation d'exclusion */}
                    {kickConfirm && (
                        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
                            <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 text-center max-w-[280px]">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 border border-red-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">Exclure {kickConfirm.username} ?</h3>
                                    <p className="text-sm text-slate-400 font-medium">Cette action est irréversible. On le sort vraiment ?</p>
                                </div>
                                <div className="flex flex-col w-full gap-3">
                                    <button
                                        onClick={handleKick}
                                        disabled={isPending}
                                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl transition duration-200 shadow-lg shadow-red-600/30 text-sm uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {isPending ? "Exclusion..." : "OUI, DEHORS !"}
                                    </button>
                                    <button
                                        onClick={() => setKickConfirm(null)}
                                        disabled={isPending}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl transition duration-200 text-sm"
                                    >
                                        Non, on le garde
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pop-up de confirmation de départ */}
                    {leaveConfirm && (
                        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
                            <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 text-center max-w-[280px]">
                                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-2 border border-indigo-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">Quitter le groupe ?</h3>
                                    <p className="text-sm text-slate-400 font-medium">Tu ne verras plus les nouveaux messages de cette discussion.</p>
                                </div>
                                <div className="flex flex-col w-full gap-3">
                                    <button
                                        onClick={handleLeave}
                                        disabled={isPending}
                                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl transition duration-200 shadow-lg shadow-red-600/30 text-sm uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {isPending ? "Départ..." : "QUITTER LE GROUPE"}
                                    </button>
                                    <button
                                        onClick={() => setLeaveConfirm(false)}
                                        disabled={isPending}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl transition duration-200 text-sm"
                                    >
                                        Je reste finalement
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
