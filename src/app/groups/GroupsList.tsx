"use client";

import useSWR from "swr";
import Link from "next/link";
import { getUserGroups } from "./[id]/actions";

export default function GroupsList({
    initialGroups,
    initialUsername
}: {
    initialGroups: any[],
    initialUsername: string
}) {
    const { data } = useSWR('user-groups', () => getUserGroups(), {
        refreshInterval: 5000, // Refresh every 5 seconds
        fallbackData: { groups: initialGroups, username: initialUsername, profilePicture: null },
        revalidateOnFocus: true
    });

    const groups = data?.groups || initialGroups;

    return (
        <div className="flex flex-col gap-3">
            {groups.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center flex flex-col items-center gap-4 mt-8 shadow-inner">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 border-2 border-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-300">Aucun groupe</h3>
                    <p className="text-sm text-slate-500">Crée un groupe pour discuter de la question avec tes amis !</p>
                </div>
            ) : (
                groups.map((group: any) => {
                    let previewText = "Pas encore de message.";
                    if (group.unread_count > 0) {
                        previewText = `${group.unread_count} nouveau${group.unread_count > 1 ? 'x' : ''} message${group.unread_count > 1 ? 's' : ''}`;
                    } else if (group.last_message) {
                        previewText = `${group.last_author}: ${group.last_message}`;
                    }

                    return (
                        <Link key={group.id} href={`/groups/${group.id}`} className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-800 transition-colors shadow-lg group">
                            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform overflow-hidden relative">
                                {group.profile_picture ? (
                                    <img src={`data:image/webp;base64,${group.profile_picture}`} alt={group.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-blue-500/10 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                    </div>
                                )}
                                {group.unread_ping_count > 0 && (
                                    <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse z-10 shadow-lg">
                                        <span className="text-[10px] font-bold text-white leading-none">{group.unread_ping_count > 9 ? '9+' : group.unread_ping_count}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-slate-200 truncate pr-2 text-md">{group.name}</h3>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{group.member_count}</span>
                                </div>
                                <p className={`text-sm truncate w-full ${group.unread_count > 0 ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                                    {previewText}
                                </p>
                            </div>
                        </Link>
                    );
                })
            )}
        </div>
    );
}
