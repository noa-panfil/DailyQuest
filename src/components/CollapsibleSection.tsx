"use client";

import { useState } from "react";

export default function CollapsibleSection({
    title,
    count,
    badgeColor,
    children,
    defaultOpen = true
}: {
    title: string;
    count?: number;
    badgeColor?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <section className="flex flex-col gap-3 mt-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between px-1 w-full text-left group"
            >
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    {title}
                    {count !== undefined && badgeColor && (
                        <span className={`ml-2 text-white px-2 py-0.5 rounded-full text-xs ${badgeColor}`}>
                            {count}
                        </span>
                    )}
                </h3>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div className={`flex flex-col gap-2 transition-all duration-300 overflow-hidden ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
                {children}
            </div>
        </section>
    );
}
