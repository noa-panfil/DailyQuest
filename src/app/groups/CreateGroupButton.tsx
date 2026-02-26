"use client";

import { useState, useEffect } from "react";
import { createGroup, searchMyFriends } from "./actions";
import { useRouter } from "next/navigation";

export default function CreateGroupButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");

    // Friend search state
    const [friendQuery, setFriendQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<any[]>([]);

    const router = useRouter();

    useEffect(() => {
        const fetchFriends = async () => {
            if (friendQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            const fd = new FormData();
            fd.append("q", friendQuery);
            const res = await searchMyFriends(fd);
            if (res?.success) {
                // Filter out already selected friends
                setSearchResults(res.friends.filter((f: any) => !selectedFriends.some(sel => sel.id === f.id)));
            }
        };

        const timeoutId = setTimeout(fetchFriends, 300);
        return () => clearTimeout(timeoutId);
    }, [friendQuery, selectedFriends]);

    const handleSelectFriend = (friend: any) => {
        if (!selectedFriends.find(f => f.id === friend.id)) {
            setSelectedFriends([...selectedFriends, friend]);
        }
        setFriendQuery("");
        setSearchResults([]);
    };

    const handleRemoveFriend = (friendId: number) => {
        setSelectedFriends(selectedFriends.filter(f => f.id !== friendId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setError("");

        if (!groupName.trim()) {
            setError("Le nom du groupe est requis.");
            setIsPending(false);
            return;
        }

        const formData = new FormData();
        formData.append("name", groupName);
        formData.append("friendIds", JSON.stringify(selectedFriends.map(f => f.id)));

        const res = await createGroup(formData);

        if (res?.error) {
            setError(res.error);
        } else if (res?.groupId) {
            router.push(`/groups/${res.groupId}`);
            setIsOpen(false);
            setGroupName("");
            setSelectedFriends([]);
        }

        setIsPending(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30 flex items-center gap-1 text-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nouveau
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative max-h-[90vh] flex flex-col">
                        <h2 className="text-xl font-bold text-slate-200 mb-4 shrink-0">Créer un groupe</h2>

                        <div className="overflow-y-auto pr-2 pb-2">
                            <form id="create-group-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-slate-400">Nom du groupe</label>
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-700 p-3 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                                        placeholder="Ex: Les tryharders"
                                        required
                                        maxLength={50}
                                        autoFocus
                                    />
                                </div>

                                {/* Recherche d'amis */}
                                <div className="flex flex-col gap-1.5 relative">
                                    <label className="text-sm font-bold text-slate-400">Ajouter des amis</label>

                                    {/* Selected Friends Badges */}
                                    {selectedFriends.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {selectedFriends.map(f => (
                                                <div key={f.id} className="bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 py-1 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                                                    {f.username}
                                                    <button type="button" onClick={() => handleRemoveFriend(f.id)} className="hover:text-indigo-100">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <input
                                        type="text"
                                        value={friendQuery}
                                        onChange={(e) => setFriendQuery(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-700 p-3 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                                        placeholder="Chercher par pseudo..."
                                    />

                                    {searchResults.length > 0 && (
                                        <div className="absolute top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-20 max-h-48 overflow-y-auto">
                                            {searchResults.map(f => (
                                                <button
                                                    key={f.id}
                                                    type="button"
                                                    onClick={() => handleSelectFriend(f)}
                                                    className="w-full text-left px-4 py-3 border-b border-slate-700/50 last:border-0 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center font-bold text-[10px] uppercase text-slate-300">
                                                        {f.username.slice(0, 2)}
                                                    </div>
                                                    <span className="text-sm font-semibold">{f.username}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {error && <p className="text-red-400 text-xs font-semibold px-1 mt-2">{error}</p>}

                        <div className="flex gap-3 mt-4 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="create-group-form"
                                disabled={isPending}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30 flex justify-center items-center disabled:opacity-50"
                            >
                                {isPending ? "Création..." : "Créer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
