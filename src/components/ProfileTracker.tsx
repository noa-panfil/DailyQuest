"use client";

import { useEffect } from "react";

export default function ProfileTracker({ user }: { user: { id: number, username: string } }) {
    useEffect(() => {
        try {
            const saved = localStorage.getItem("recentProfiles");
            const recentProfiles = saved ? JSON.parse(saved) : [];

            // Remove if already exists and add to the top
            const newProfiles = [user, ...recentProfiles.filter((p: any) => p.id !== user.id)].slice(0, 5);

            localStorage.setItem("recentProfiles", JSON.stringify(newProfiles));
        } catch (e) {
            console.error("Failed to save profile history", e);
        }
    }, [user]);

    return null;
}
