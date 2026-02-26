"use server";

import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function searchMyFriends(formData: FormData) {
    try {
        const session = await requireAuth();
        const userId = session.userId as number;
        const q = formData.get("q") as string;

        if (!q || q.trim().length < 2) return { friends: [] };

        const searchQuery = `%${q.trim()}%`;

        const friends: any[] = (await query(`
            SELECT u.id, u.username
            FROM friendships f
            JOIN users u ON (f.user_id_1 = u.id OR f.user_id_2 = u.id)
            WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) 
              AND f.status = 'accepted' 
              AND u.id != ?
              AND u.username LIKE ?
            LIMIT 10
        `, [userId, userId, userId, searchQuery])) as any[];

        return { success: true, friends };
    } catch (e: any) {
        return { error: "Erreur lors de la recherche." };
    }
}

export async function createGroup(formData: FormData) {
    try {
        const session = await requireAuth();
        const userId = session.userId as number;
        const name = formData.get("name") as string;
        const friendIdsStr = formData.get("friendIds") as string;

        const friendIds = friendIdsStr ? JSON.parse(friendIdsStr) : [];

        if (!name || name.trim() === "") {
            return { error: "Nom de groupe invalide." };
        }

        // 1. Create the group
        const groupRes: any = await query(
            "INSERT INTO discussion_groups (name, created_by) VALUES (?, ?)",
            [name.trim(), userId]
        );
        const groupId = groupRes.insertId;

        // 2. Add the creator as a member
        await query(
            "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
            [groupId, userId]
        );

        // 3. Add selected friends
        if (Array.isArray(friendIds) && friendIds.length > 0) {
            for (const fId of friendIds) {
                await query(
                    "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
                    [groupId, fId]
                );
            }
        }

        revalidatePath("/groups");
        return { success: true, groupId };

    } catch (e: any) {
        console.error("Erreur création groupe:", e);
        return { error: "Erreur lors de la création du groupe." };
    }
}
