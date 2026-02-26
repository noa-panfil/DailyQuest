"use client";

import { useState, useEffect } from "react";
import { postMessage } from "./actions";
import { useRouter } from "next/navigation";

export default function GroupChatInput({ groupId, members }: { groupId: number, members: { id: number, username: string }[] }) {
    const [message, setMessage] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [replyTo, setReplyTo] = useState<{ id: number; username: string; text: string } | null>(null);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [filteredMembers, setFilteredMembers] = useState<{ id: number, username: string }[]>([]);
    const router = useRouter();

    useEffect(() => {
        const handleReply = (e: any) => {
            setReplyTo(e.detail);
        };
        window.addEventListener("replyToMessage", handleReply);
        return () => window.removeEventListener("replyToMessage", handleReply);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsPending(true);
        const formData = new FormData();
        formData.append("groupId", groupId.toString());
        formData.append("messageText", message);
        if (replyTo) {
            formData.append("replyToMessageId", replyTo.id.toString());
        }

        const res = await postMessage(formData);

        if (res?.success) {
            setMessage("");
            setReplyTo(null);
            // Dispatch event to refresh messages immediately
            window.dispatchEvent(new CustomEvent("refreshMessages"));
            router.refresh(); // Still refresh for other potential server-side updates
        }

        setIsPending(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMessage(val);

        // Simple logic for @mentions: look for an '@' near the end of the current text
        const mentionMatch = val.match(/@([a-zA-Z0-9_]*)$/);

        if (mentionMatch !== null) {
            const query = mentionMatch[1].toLowerCase();
            setMentionQuery(query);
            setFilteredMembers(members.filter(m => m.username.toLowerCase().includes(query)));
        } else {
            setMentionQuery(null);
            setFilteredMembers([]);
        }
    };

    const handleMentionClick = (username: string) => {
        if (mentionQuery !== null) {
            // Replace the @query at the end with the selected username
            const newMessage = message.replace(/@([a-zA-Z0-9_]*)$/, `@${username} `);
            setMessage(newMessage);
            setMentionQuery(null);
            setFilteredMembers([]);

            // Re-focus the input here if we had a ref
        }
    };

    return (
        <div className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 p-4 pb-6 max-w-2xl mx-auto z-10 flex flex-col gap-2">

            {/* Mentions Dropdown */}
            {mentionQuery !== null && filteredMembers.length > 0 && (
                <div className="absolute bottom-full left-4 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-20 max-h-48 overflow-y-auto mb-2 min-w-[200px]">
                    {filteredMembers.map(m => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => handleMentionClick(m.username)}
                            className="w-full text-left px-4 py-3 border-b border-slate-700/50 last:border-0 hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <span className="text-sm font-semibold text-slate-200">@{m.username}</span>
                        </button>
                    ))}
                </div>
            )}

            {replyTo && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 flex items-start justify-between gap-3 mx-2 mt-[-24px] shadow-lg relative bottom-1 text-sm">
                    <div className="w-1 bg-indigo-500 rounded-full h-full absolute left-0 top-0 opacity-50"></div>
                    <div className="flex-1 min-w-0 pl-1.5">
                        <div className="font-bold text-indigo-400 text-xs flex justify-between">
                            <span>Réponse à {replyTo.username}</span>
                        </div>
                        <p className="text-slate-300 truncate text-[11px] mt-0.5 max-w-[90%]">{replyTo.text}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    placeholder="Écrire un message..."
                    className="flex-1 bg-slate-950/50 border border-slate-700 rounded-full py-3 px-5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200"
                    maxLength={500}
                />

                <button
                    type="submit"
                    disabled={isPending || !message.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 disabled:bg-slate-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
