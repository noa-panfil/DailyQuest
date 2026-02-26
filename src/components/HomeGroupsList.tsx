"use client";

import useSWR from "swr";
import Link from "next/link";
import { getUserGroups } from "@/app/groups/[id]/actions";

export default function HomeGroupsList({
    initialGroups,
    initialUsername
}: {
    initialGroups: any[],
    initialUsername: string
}) {
    const { data } = useSWR('user-groups-home', () => getUserGroups(), {
        refreshInterval: 5000,
        fallbackData: { groups: initialGroups, username: initialUsername, profilePicture: null },
        revalidateOnFocus: true
    });

    const groups = data?.groups || initialGroups;

    return (
        <div className="flex flex-col gap-3">
            {groups.length === 0 ? (
                <div className="text-slate-500 text-sm text-center py-6">Tu ne fais encore partie d'aucun groupe de discussion. Crées-en un ou rejoins tes amis !</div>
            ) : (
                groups.slice(0, 5).map((group: any) => {
                    let previewText = "Pas encore de message.";
                    if (group.unread_count > 0) {
                        previewText = `${group.unread_count} nouveau${group.unread_count > 1 ? 'x' : ''} message${group.unread_count > 1 ? 's' : ''}`;
                    } else if (group.last_message) {
                        previewText = `${group.last_author}: ${group.last_message}`;
                    }

                    return (
                        <Link href={`/groups/${group.id}`} key={group.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors group">
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-14 h-14 min-w-14 bg-slate-800 border border-slate-700/50 rounded-2xl flex items-center justify-center shadow-inner relative group-hover:scale-105 transition-transform overflow-hidden font-bold text-slate-500 uppercase tracking-tighter shadow-indigo-900/10">
                                    {group.profile_picture ? (
                                        <img src={`data:image/webp;base64,${group.profile_picture}`} alt={group.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {group.name.slice(0, 2)}
                                        </div>
                                    )}

                                    {group.unread_ping_count > 0 && (
                                        <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse z-10 shadow-lg">
                                            <span className="text-[10px] font-bold text-white leading-none">{group.unread_ping_count > 9 ? '9+' : group.unread_ping_count}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center w-full mb-0.5">
                                        <span className="font-bold text-slate-100 truncate">{group.name}</span>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded-md border border-slate-700/50 ml-2 whitespace-nowrap flex items-center gap-1">
                                            {group.member_count}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`text-sm truncate w-full ${group.unread_count > 0 ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                                            {previewText}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })
            )}
        </div>
    );
}
