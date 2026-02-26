"use server";

import { query } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function addDailyQuestion(formData: FormData) {
    const session = await requireAuth();
    const userId = session.userId as number;

    try {
        const userResult: any = await query("SELECT is_admin FROM users WHERE id = ?", [userId]);
        if (!userResult || userResult.length === 0 || !userResult[0].is_admin) {
            return { error: "Accès refusé. Tu n'es pas administrateur." };
        }

        const questionText = formData.get("questionText") as string;
        const option1 = formData.get("option1") as string;
        const option2 = formData.get("option2") as string;
        const option3 = formData.get("option3") as string;
        const option4 = formData.get("option4") as string;

        if (!questionText || !option1 || !option2) {
            return { error: "Veuillez remplir la question et au moins 2 options." };
        }

        await query(
            "INSERT INTO daily_questions (question_text, option_1, option_2, option_3, option_4) VALUES (?, ?, ?, ?, ?)",
            [questionText, option1, option2, option3 || null, option4 || null]
        );

        revalidatePath("/admin");
        return { success: true };

    } catch (error: any) {
        console.error("Erreur lors de l'ajout de la question :", error);
        return { error: "Erreur serveur lors de la création de la question." };
    }
}

export async function deleteDailyQuestion(formData: FormData) {
    const session = await requireAuth();
    const userId = session.userId as number;
    const questionId = Number(formData.get("questionId"));

    try {
        const userResult: any = await query("SELECT is_admin FROM users WHERE id = ?", [userId]);
        if (!userResult || userResult.length === 0 || !userResult[0].is_admin) {
            return { error: "Accès refusé." };
        }

        await query("DELETE FROM daily_questions WHERE id = ?", [questionId]);
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        return { error: "Erreur lors de la suppression." };
    }
}
