"use client";

export default function ReplyButton({ msgId, username, text }: { msgId: number, username: string, text: string }) {
    return (
        <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('replyToMessage', { detail: { id: msgId, username, text } }))}
            className="text-slate-500 hover:text-indigo-400 transition-colors p-1.5 rounded-full hover:bg-slate-800 opacity-60 hover:opacity-100"
            title="Répondre"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
        </button>
    );
}
