"use client";

import { useState } from "react";
import { submitDailyAnswer } from "@/app/actions";
import confetti from "canvas-confetti";

export default function SubmitQuestForm({ question }: { question: any }) {
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<{ error?: string; success?: boolean }>({});
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const options = [
        { id: 1, text: question.option_1 },
        { id: 2, text: question.option_2 },
        { id: 3, text: question.option_3 },
        { id: 4, text: question.option_4 },
    ].filter(opt => opt.text !== null && opt.text !== "");

    async function handleAction(formData: FormData) {
        if (selectedOption === null) {
            setMessage({ error: "Choisis une réponse !" });
            return;
        }

        setIsPending(true);
        setMessage({});

        // Add the selected option to formData before submitting
        formData.append("selectedOption", selectedOption.toString());

        const result = await submitDailyAnswer(formData);

        if (result.error) {
            setMessage({ error: result.error });
        } else if (result.success) {
            setMessage({ success: true });

            if (result.gainedStrike) {
                // Animation de confettis pour la nouvelle strike !
                const duration = 1000;
                const end = Date.now() + duration;

                const frame = () => {
                    confetti({
                        particleCount: 5,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#818cf8', '#34d399', '#fbbf24'] // indigo, emerald, amber
                    });
                    confetti({
                        particleCount: 5,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#818cf8', '#34d399', '#fbbf24']
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                };

                // Petit effet "pop" immédiat
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#818cf8', '#34d399', '#fbbf24'],
                    zIndex: 9999
                });

                frame();
            }
        }

        setIsPending(false);
    }

    if (message.success) return null; // already rendered in parent if success usually, but hiding here just in case

    return (
        <form action={handleAction} className="flex flex-col gap-3 z-10 w-full relative mt-2">
            <input type="hidden" name="questionId" value={question.id} />

            <div className="flex flex-col gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedOption(opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedOption === opt.id
                            ? "bg-indigo-600 border-indigo-500 shadow-md"
                            : "bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300"
                            } text-sm font-medium`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedOption === opt.id ? "border-white" : "border-slate-500"}`}>
                                {selectedOption === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            {opt.text}
                        </div>
                    </button>
                ))}
            </div>

            {message.error && (
                <p className="text-red-400 text-xs font-semibold px-2">{message.error}</p>
            )}

            <button
                type="submit"
                disabled={isPending || selectedOption === null}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
                {isPending ? "Validation..." : "Valider mon choix"}
            </button>
        </form>
    );
}
