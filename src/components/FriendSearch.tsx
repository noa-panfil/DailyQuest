"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { searchUsers, sendFriendRequest } from "@/app/friends/actions";

export default function FriendSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [message, setMessage] = useState<{ error?: string; success?: string }>({});

    useEffect(() => {
        // Debounce de 400ms pour éviter de spammer la base de données
        const delayDebounceFn = setTimeout(async () => {
            setMessage({});
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            const formData = new FormData();
            formData.append("q", query);

            const res = await searchUsers(formData);
            if (res.error) {
                setMessage({ error: res.error });
                setResults([]);
            } else if (res.success) {
                setResults(res.users || []);
                if (res.users?.length === 0) {
                    setMessage({ error: "Aucun utilisateur trouvé." });
                }
            }
            setIsSearching(false);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    async function handleAddFriend(targetId: number) {
        setMessage({});
        const formData = new FormData();
        formData.append("targetId", targetId.toString());

        const res = await sendFriendRequest(formData);
        if (res.error) {
            setMessage({ error: res.error });
        } else if (res.success) {
            setMessage({ success: "Demande d'ami envoyée !" });
            setQuery("");
            setResults([]);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="relative flex items-center">
                <input
                    type="text"
                    placeholder="Chercher un pseudo..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isSearching && (
                    <div className="absolute right-3 w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin text-indigo-500"></div>
                )}
            </div>

            {message.error && <p className="text-red-400 text-xs font-semibold px-1">{message.error}</p>}
            {message.success && <p className="text-emerald-400 text-xs font-semibold px-1 p-2 bg-emerald-950/50 rounded-lg">{message.success}</p>}

            {results.length > 0 && (
                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col mt-2">
                    {results.map((u) => (
                        <div key={u.id} className="flex justify-between items-center p-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                            <Link href={`/profile/${u.id}`} className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                                    {u.username.slice(0, 2)}
                                </div>
                                <span className="font-semibold text-slate-200 text-sm group-hover:text-indigo-400 transition-colors">{u.username}</span>
                            </Link>

                            {u.friendship_status === 'accepted' ? (
                                <span className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-900 text-emerald-400 text-xs font-bold flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Amis
                                </span>
                            ) : u.friendship_status === 'pending' ? (
                                <span className="px-3 py-1.5 rounded-lg bg-orange-950/50 border border-orange-900 text-orange-400 text-xs font-bold flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    En attente
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleAddFriend(u.id)}
                                    className="bg-slate-800 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-slate-700 hover:border-indigo-500 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                    </svg>
                                    Ajouter
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
