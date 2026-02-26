"use client";

import { deleteSession } from "@/lib/session";
import { logoutAction } from "@/app/friends/actions";
import { useState } from "react";
import Link from "next/link";

export default function HeaderProfile({ userId, username, strikeCount, isAdmin, profilePicture }: { userId: number, username: string, strikeCount: number, isAdmin?: boolean, profilePicture?: string | null }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex gap-4 relative">
            <div className="flex flex-col items-center justify-center bg-slate-800 rounded-lg px-2 py-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Strikes</span>
                <span className="text-orange-500 font-bold text-sm tracking-widest flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.87a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd" />
                    </svg>
                    {strikeCount || 0}
                </span>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-indigo-500 cursor-pointer overflow-hidden shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
            >
                {profilePicture ? (
                    <img src={`data:image/webp;base64,${profilePicture}`} className="w-full h-full object-cover" alt={username} />
                ) : (
                    <span className="text-xs font-semibold uppercase">{username.slice(0, 2) || "DQ"}</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-14 right-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 border-b border-slate-800 bg-slate-950/50">
                        <p className="font-bold text-sm text-slate-200">@{username}</p>
                    </div>
                    <Link href={`/profile/${userId}`} className="block w-full text-left px-4 py-3 text-sm text-slate-300 font-semibold hover:bg-slate-800 transition-colors border-b border-slate-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mon Profil
                    </Link>
                    {!!isAdmin && (
                        <Link href="/admin" className="block w-full text-left px-4 py-3 text-sm text-indigo-400 font-semibold hover:bg-slate-800 transition-colors border-b border-slate-800 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            Panel Admin
                        </Link>
                    )}
                    <form action={logoutAction}>
                        <button type="submit" className="w-full text-left px-4 py-3 text-sm text-red-500 font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Se déconnecter
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
