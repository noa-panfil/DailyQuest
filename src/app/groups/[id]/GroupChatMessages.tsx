"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";
import ReplyButton from "./ReplyButton";
import { getGroupMessages, markGroupAsRead } from "./actions";

export default function GroupChatMessages({
    groupId,
    initialMessages,
    currentUserId,
    currentUsername
}: {
    groupId: number,
    initialMessages: any[],
    currentUserId: number,
    currentUsername: string
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { data, mutate } = useSWR(`group-messages-${groupId}`, () => getGroupMessages(groupId), {
        refreshInterval: 3000, // Refresh every 3 seconds
        fallbackData: { messages: initialMessages, readStatus: [] },
        revalidateOnFocus: true
    });

    const messages = data?.messages || initialMessages;
    const readStatus = data?.readStatus || [];

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Mark as read when messages change
    useEffect(() => {
        if (messages.length > 0) {
            markGroupAsRead(groupId);
        }
    }, [messages, groupId]);

    useEffect(() => {
        // Listen for a custom event from the input to trigger a manual refresh
        const handleRefresh = () => mutate();
        window.addEventListener("refreshMessages", handleRefresh);
        return () => window.removeEventListener("refreshMessages", handleRefresh);
    }, [mutate]);

    return (
        <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 w-full max-w-2xl mx-auto flex flex-col gap-4 pb-24 scroll-smooth">
            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <span className="text-2xl">👋</span>
                    </div>
                    Soyez le premier à envoyer un message !
                </div>
            ) : (
                messages.map((msg: any, index: number) => {
                    const isMe = msg.user_id === currentUserId;
                    const isDailyAnswer = msg.message_type === 'daily_answer';
                    const isSystem = msg.message_type === 'system';

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <div className="bg-slate-900/50 border border-slate-800 px-4 py-1.5 rounded-full text-[11px] font-bold text-slate-500 uppercase tracking-widest shadow-inner">
                                    {msg.message_text}
                                </div>
                            </div>
                        );
                    }

                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const showAvatar = !isMe && (!prevMsg || prevMsg.user_id !== msg.user_id);

                    return (
                        <div key={msg.id}>
                            <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} group`}>
                                {!isMe && (
                                    <div className="w-8 shrink-0">
                                        {showAvatar && (
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-[10px] font-bold uppercase text-slate-300 overflow-hidden">
                                                {msg.profile_picture ? (
                                                    <img src={`data:image/webp;base64,${msg.profile_picture}`} className="w-full h-full object-cover" alt={msg.username} />
                                                ) : (
                                                    msg.username.slice(0, 2)
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                                    {!isMe && showAvatar && (
                                        <span className="text-[10px] font-bold text-slate-500 pl-1">{msg.username}</span>
                                    )}

                                    <div className={`relative ${isDailyAnswer ? 'bg-indigo-900/40 border border-indigo-700/50 text-indigo-100 shadow-lg shadow-indigo-900/20' : (isMe ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-200 border border-slate-700')} px-4 py-2.5 rounded-2xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'} text-sm leading-relaxed`}>
                                        {msg.reply_to_message_id && (
                                            <div className="bg-slate-900/40 border-l-2 border-indigo-400 p-1.5 rounded-md text-[10px] mb-2 saturate-50 opacity-80">
                                                <span className="font-bold text-indigo-300 block leading-none">{msg.replied_username}</span>
                                                <span className="block truncate max-w-[200px] mt-0.5">{msg.replied_text}</span>
                                            </div>
                                        )}
                                        {isDailyAnswer && (
                                            <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-bold text-indigo-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                </svg>
                                                Quête du jour
                                            </div>
                                        )}
                                        {msg.message_text.split(new RegExp(`(@${currentUsername}\\b)`, 'gi')).map((part: string, i: number) =>
                                            part.toLowerCase() === `@${currentUsername.toLowerCase()}` ?
                                                <span key={i} className="bg-amber-500/30 text-amber-200 font-bold px-1 rounded-sm border border-amber-500/50">{part}</span> :
                                                part
                                        )}
                                    </div>
                                    <span className="text-[9px] font-semibold text-slate-600 px-1">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex flex-col justify-end pb-1 px-1">
                                    <ReplyButton msgId={msg.id} username={msg.username} text={msg.message_text} />
                                </div>
                            </div>

                            {/* Seen bubbles */}
                            {readStatus.filter((rs: any) => rs.message_id === msg.id && rs.user_id !== currentUserId).length > 0 && (
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start ml-10'} mt-[2px] mb-2 gap-0.5`}>
                                    {readStatus.filter((rs: any) => rs.message_id === msg.id && rs.user_id !== currentUserId).map((rs: any) => (
                                        <div key={rs.user_id} className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-[7px] font-bold uppercase text-slate-400 group-hover:scale-110 transition-transform overflow-hidden shadow-sm" title={`Vu par ${rs.username}`}>
                                            {rs.profile_picture ? (
                                                <img src={`data:image/webp;base64,${rs.profile_picture}`} className="w-full h-full object-cover" alt={rs.username} />
                                            ) : (
                                                rs.username.slice(0, 2)
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </main >
    );
}
