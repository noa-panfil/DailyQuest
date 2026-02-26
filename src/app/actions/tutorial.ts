"use server";

import { query } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function finishTutorial() {
    const session = await requireAuth();
    if (!session || !session.userId) return { error: "Non autorisé" };

    try {
        await query("UPDATE users SET has_completed_tutorial = TRUE WHERE id = ?", [session.userId]);
        return { success: true };
    } catch (e) {
        console.error("Error setting tutorial complete", e);
        return { error: "Erreur serveur" };
    }
}
