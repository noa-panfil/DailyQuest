"use server";

import { query } from "@/lib/db";
import { requireAuth, deleteSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logoutAction() {
    await deleteSession();
    redirect("/login");
}

export async function searchUsers(formData: FormData) {
    const session = await requireAuth();
    const userId = session.userId as number;
    const searchString = formData.get("q") as string;

    if (!searchString || searchString.length < 2) {
        return { error: "Recherche trop courte." };
    }

    try {
        const users: any = await query(`
            SELECT 
                u.id, 
                u.username, 
                u.profile_picture,
                f.status as friendship_status
            FROM users u
            LEFT JOIN friendships f ON (f.user_id_1 = ? AND f.user_id_2 = u.id) OR (f.user_id_1 = u.id AND f.user_id_2 = ?)
            WHERE u.username LIKE ? AND u.id != ?
            LIMIT 10
        `, [userId, userId, `%${searchString}%`, userId]);

        return { success: true, users };
    } catch (e) {
        return { error: "Erreur de recherche." };
    }
}

export async function sendFriendRequest(formData: FormData) {
    const session = await requireAuth();
    const userId = session.userId as number;
    const targetId = Number(formData.get("targetId"));

    try {
        await query(
            "INSERT INTO friendships (user_id_1, user_id_2, status) VALUES (?, ?, 'pending')",
            [userId, targetId]
        );
        revalidatePath("/friends");
        return { success: true };
    } catch (e: any) {
        if (e.code === 'ER_DUP_ENTRY') {
            return { error: "Demande déjà envoyée." };
        }
        return { error: "Erreur lors de l'envoi." };
    }
}

export async function acceptFriendRequest(formData: FormData) {
    const session = await requireAuth();
    const userId = session.userId as number;
    const friendshipId = Number(formData.get("friendshipId"));

    try {
        await query("UPDATE friendships SET status = 'accepted' WHERE id = ? AND user_id_2 = ?", [friendshipId, userId]);
        revalidatePath("/friends");
    } catch (e) {
        console.error(e);
    }
}

export async function rejectOrRemoveFriend(formData: FormData) {
    const session = await requireAuth();
    const userId = session.userId as number;
    const friendshipId = Number(formData.get("friendshipId"));

    try {
        await query("DELETE FROM friendships WHERE id = ? AND (user_id_1 = ? OR user_id_2 = ?)", [friendshipId, userId, userId]);
        revalidatePath("/friends");
    } catch (e) {
        console.error(e);
    }
}
