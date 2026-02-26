"use server";

import { query } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function submitDailyAnswer(formData: FormData) {
    try {
        const session = await requireAuth();
        const userId = session.userId as number;

        // Retrieve the form data correctly
        const questionIdRaw = formData.get("questionId");
        const selectedOptionRaw = formData.get("selectedOption");

        // Check if these values exist before converting them
        if (!questionIdRaw || !selectedOptionRaw) {
            return { error: "Veuillez sélectionner une option." };
        }

        const questionId = Number(questionIdRaw);
        const selectedOptionId = Number(selectedOptionRaw);

        // 1. Get the text of the selected option to save it and post it in groups
        const questionResult: any = await query("SELECT option_1, option_2, option_3, option_4 FROM daily_questions WHERE id = ?", [questionId]);
        if (!questionResult || questionResult.length === 0) {
            return { error: "Question introuvable." };
        }
        const q = questionResult[0];

        let answerText = "";
        if (selectedOptionId === 1) answerText = q.option_1;
        if (selectedOptionId === 2) answerText = q.option_2;
        if (selectedOptionId === 3) answerText = q.option_3;
        if (selectedOptionId === 4) answerText = q.option_4;

        // 2. Insérer ou mettre à jour la réponse du joueur
        const insertResult: any = await query(
            `INSERT INTO user_answers (user_id, question_id, selected_option, answer_text) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE selected_option = ?, answer_text = ?`,
            [userId, questionId, selectedOptionId, answerText, selectedOptionId, answerText]
        );

        const answerId = insertResult.insertId || await query("SELECT id FROM user_answers WHERE user_id = ? AND question_id = ?", [userId, questionId]).then((res: any) => res[0].id);

        const userBefore: any = await query("SELECT strike_count FROM users WHERE id = ?", [userId]);
        const oldStrike = userBefore[0]?.strike_count || 0;

        // 3. Mettre à jour le strike count de l'utilisateur
        // On se base sur la date d'apparition prévue de la question (scheduled_date)
        // et non plus sur l'heure exacte du serveur pour éviter les bugs avec le roulement à midi.
        await query(`
            UPDATE users 
            JOIN daily_questions dq ON dq.id = ?
            SET 
                users.strike_count = CASE 
                    WHEN users.last_answered_date = DATE_SUB(dq.scheduled_date, INTERVAL 1 DAY) THEN users.strike_count + 1
                    WHEN users.last_answered_date = dq.scheduled_date THEN users.strike_count
                    ELSE 1 
                END,
                users.max_strike_count = GREATEST(users.max_strike_count, CASE 
                    WHEN users.last_answered_date = DATE_SUB(dq.scheduled_date, INTERVAL 1 DAY) THEN users.strike_count + 1
                    WHEN users.last_answered_date = dq.scheduled_date THEN users.strike_count
                    ELSE 1 
                END),
                users.last_answered_date = dq.scheduled_date 
            WHERE users.id = ?
        `, [questionId, userId]);

        const userAfter: any = await query("SELECT strike_count FROM users WHERE id = ?", [userId]);
        const newStrike = userAfter[0]?.strike_count || 0;
        const gainedStrike = newStrike > oldStrike || newStrike === 1; // Animation if incremented OR if restored to 1

        // 4. Publier automatiquement ce choix dans tous les groupes de l'utilisateur
        const userGroups: any = await query("SELECT group_id FROM group_members WHERE user_id = ?", [userId]);

        for (const group of userGroups) {
            await query(
                "INSERT INTO group_messages (group_id, user_id, message_text, message_type, related_answer_id) VALUES (?, ?, ?, 'daily_answer', ?)",
                [group.group_id, userId, `A voté : "${answerText}"`, answerId]
            );
        }

        revalidatePath("/");

        return { success: true, gainedStrike };

    } catch (error: any) {
        console.error("Erreur d'insertion de réponse :", error);
        return { error: "Une erreur serveur est survenue." };
    }
}
