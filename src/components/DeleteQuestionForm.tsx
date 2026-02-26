"use client";

import { useActionState, useEffect } from "react";
import { deleteDailyQuestion } from "@/app/admin/actions";

export default function DeleteQuestionForm({ questionId }: { questionId: number }) {
    const [state, formAction, isPending] = useActionState(deleteDailyQuestion, null);

    return (
        <form action={formAction}>
            <input type="hidden" name="questionId" value={questionId} />
            <button
                type="submit"
                disabled={isPending}
                className="p-2 bg-red-950/40 text-red-500 rounded-lg hover:bg-red-900/60 hover:text-red-400 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                title="Supprimer cette question"
            >
                {isPending ? (
                    <span className="w-5 h-5 block animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                )}
            </button>
        </form>
    );
}
