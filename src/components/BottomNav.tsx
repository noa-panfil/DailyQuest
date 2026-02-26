"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav({ username, profilePicture }: { username: string, profilePicture?: string | null }) {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pt-3 pb-3 px-8 flex justify-between items-center z-20">
            <Link href="/friends" className={`flex flex-col items-center gap-1.5 ${pathname.startsWith('/friends') ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'} transition-colors`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.startsWith('/friends') ? 2.5 : 2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className={`text-[10px] ${pathname.startsWith('/friends') ? 'font-bold' : 'font-semibold'} tracking-wide`}>Amis</span>
            </Link>

            <Link href="/groups" className={`flex flex-col items-center gap-1.5 ${pathname.startsWith('/groups') ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'} transition-colors`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.startsWith('/groups') ? 2.5 : 2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span className={`text-[10px] ${pathname.startsWith('/groups') ? 'font-bold' : 'font-semibold'} tracking-wide`}>Groupes</span>
            </Link>

            <Link href="/" className={`flex flex-col items-center gap-1.5 ${pathname === '/' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'} transition-colors`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === '/' ? 2.5 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className={`text-[10px] ${pathname === '/' ? 'font-bold' : 'font-semibold'} tracking-wide`}>Accueil</span>
            </Link>

            <Link href="/search" className={`flex flex-col items-center gap-1.5 ${pathname.startsWith('/search') ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'} transition-colors`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.startsWith('/search') ? 2.5 : 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className={`text-[10px] ${pathname.startsWith('/search') ? 'font-bold' : 'font-semibold'} tracking-wide`}>Chercher</span>
            </Link>

            <Link href="/account" className={`flex flex-col items-center gap-1.5 ${pathname.startsWith('/account') ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'} transition-colors`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] uppercase border-2 overflow-hidden ${pathname.startsWith('/account') ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                    {profilePicture ? (
                        <img src={`data:image/webp;base64,${profilePicture}`} className="w-full h-full object-cover" alt={username} />
                    ) : (
                        username.slice(0, 2)
                    )}
                </div>
                <span className={`text-[10px] ${pathname.startsWith('/account') ? 'font-bold' : 'font-semibold'} tracking-wide`}>Compte</span>
            </Link>
        </nav>
    );
}
