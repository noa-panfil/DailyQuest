"use client";

import { sendFriendRequest } from "@/app/friends/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddFriendButton({ targetId, buttonText = "Ajouter" }: { targetId: number, buttonText?: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleAdd = async () => {
        setIsPending(true);
        const formData = new FormData();
        formData.append("targetId", targetId.toString());
        await sendFriendRequest(formData);
        router.refresh();
        // Keep it pending indefinitely until the page finishes refreshing, avoiding visual flicker.
    };

    return (
        <button
            onClick={handleAdd}
            disabled={isPending}
            className="bg-slate-800 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-slate-700 hover:border-indigo-500 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
        >
            {isPending ? (
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
            )}
            {buttonText}
        </button>
    );
}
