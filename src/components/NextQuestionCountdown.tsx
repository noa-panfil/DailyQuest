"use client";

import { useEffect, useState } from "react";

export default function NextQuestionCountdown({ hasAnswered }: { hasAnswered?: boolean }) {
    const [timeLeft, setTimeLeft] = useState({ text: "  h   m   s", hours: 24 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(now);
            target.setHours(12, 0, 0, 0);

            // Si midi est déjà passé aujourd'hui, on vise demain à midi
            if (now.getTime() >= target.getTime()) {
                target.setDate(target.getDate() + 1);
            }

            const difference = target.getTime() - now.getTime();

            if (difference > 0) {
                const totalHours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({
                    text: `${totalHours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`,
                    hours: totalHours
                });
            } else {
                setTimeLeft({ text: "00h 00m 00s", hours: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    let colorClasses = "text-indigo-400 bg-indigo-900/40 border-indigo-700/50"; // default for hasAnswered

    if (!hasAnswered) {
        colorClasses = "text-emerald-400 bg-emerald-900/50 border-emerald-700/50";
        if (timeLeft.hours <= 10 && timeLeft.hours > 3) {
            colorClasses = "text-orange-400 bg-orange-900/50 border-orange-700/50";
        } else if (timeLeft.hours <= 3) {
            colorClasses = "text-red-400 bg-red-900/50 border-red-700/50";
        }
    }

    if (!mounted) {
        return (
            <span className={`font-mono font-bold px-2 py-0.5 rounded-md border select-none opacity-0 ${colorClasses}`}>
                00h 00m 00s
            </span>
        );
    }

    return (
        <span className={`font-mono font-bold px-2 py-0.5 rounded-md border ${colorClasses}`}>
            {timeLeft.text}
        </span>
    );
}
