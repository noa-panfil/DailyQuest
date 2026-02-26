"use server";

import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

export async function addMemberToGroup(formData: FormData) {
    try {
        const session = await requireAuth();
        const currentUserId = session.userId as number;

        const groupId = parseInt(formData.get("groupId") as string);
        const userIdToAdd = parseInt(formData.get("userId") as string);

        if (isNaN(groupId) || isNaN(userIdToAdd)) {
            return { error: "Données invalides." };
        }

        // 1. Verify that the current user is admin/creator of the group
        const groupRes: any = await query("SELECT created_by FROM discussion_groups WHERE id = ?", [groupId]);
        if (groupRes.length === 0 || groupRes[0].created_by !== currentUserId) {
            return { error: "Seul le créateur du groupe peut ajouter des membres." };
        }

        // 2. Add the user
        await query("INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)", [groupId, userIdToAdd]);

        // 3. Post system message
        const currentUsrRes: any = await query("SELECT username FROM users WHERE id = ?", [currentUserId]);
        const addedUsrRes: any = await query("SELECT username FROM users WHERE id = ?", [userIdToAdd]);

        if (currentUsrRes.length > 0 && addedUsrRes.length > 0) {
            const msg = `${currentUsrRes[0].username} a ajouté ${addedUsrRes[0].username} à la discussion.`;
            await query(
                "INSERT INTO group_messages (group_id, user_id, message_text, message_type) VALUES (?, ?, ?, 'system')",
                [groupId, currentUserId, msg]
            );
        }

        revalidatePath(`/groups/${groupId}`);
        revalidatePath("/groups");
        return { success: true };

    } catch (e: any) {
        return { error: "Erreur lors de l'ajout du membre." };
    }
}

export async function postMessage(formData: FormData) {
    try {
        const session = await requireAuth();
        const currentUserId = session.userId as number;

        const groupId = parseInt(formData.get("groupId") as string);
        const messageText = formData.get("messageText") as string;
        const replyToIdRaw = formData.get("replyToMessageId");
        const replyToId = replyToIdRaw ? parseInt(replyToIdRaw as string) : null;

        if (isNaN(groupId) || !messageText || messageText.trim() === "") {
            return { error: "Message invalide." };
        }

        // Verify member status
        const isMember: any = await query("SELECT * FROM group_members WHERE group_id = ? AND user_id = ?", [groupId, currentUserId]);
        if (isMember.length === 0) {
            return { error: "Non autorisé" };
        }

        // Insert message
        await query(
            "INSERT INTO group_messages (group_id, user_id, message_text, message_type, reply_to_message_id) VALUES (?, ?, ?, 'standard', ?)",
            [groupId, currentUserId, messageText.trim(), replyToId]
        );

        revalidatePath(`/groups/${groupId}`);
        revalidatePath("/groups");
        return { success: true };

    } catch (e: any) {
        return { error: "Erreur lors de l'envoi." };
    }
}

export async function updateGroupSettings(formData: FormData) {
    try {
        const session = await requireAuth();
        const currentUserId = session.userId as number;

        const groupId = parseInt(formData.get("groupId") as string);
        const name = formData.get("name") as string;
        const picture = formData.get("picture") as File | null;

        if (isNaN(groupId) || !name || name.trim() === "") {
            return { error: "Nom invalide." };
        }

        // Verify admin status
        const groupRes: any = await query("SELECT created_by FROM discussion_groups WHERE id = ?", [groupId]);
        if (groupRes.length === 0 || groupRes[0].created_by !== currentUserId) {
            return { error: "Non autorisé." };
        }

        let compressedBuffer = null;
        if (picture && picture.size > 0) {
            try {
                const bytes = await picture.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Compress image
                compressedBuffer = await sharp(buffer)
                    .resize(200, 200, {
                        fit: sharp.fit.cover,
                        position: sharp.strategy.entropy
                    })
                    .webp({ quality: 80 })
                    .toBuffer();
            } catch (err) {
                console.error("Erreur de compression photo", err);
            }
        }

        if (compressedBuffer) {
            await query("UPDATE discussion_groups SET name = ?, profile_picture = ? WHERE id = ?", [name.trim(), compressedBuffer, groupId]);
        } else {
            await query("UPDATE discussion_groups SET name = ? WHERE id = ?", [name.trim(), groupId]);
        }

        revalidatePath(`/groups/${groupId}`);
        revalidatePath("/groups");
        return { success: true };

    } catch (e: any) {
        return { error: "Erreur lors de la modification." };
    }
}

export async function getGroupMessages(groupId: number) {
    try {
        const session = await requireAuth();
        const currentUserId = session.userId as number;

        // Verify member status
        const isMemberRes: any = await query("SELECT * FROM group_members WHERE group_id = ? AND user_id = ?", [groupId, currentUserId]);
        if (isMemberRes.length === 0) {
            throw new Error("Non autorisé");
        }

        // Fetch Messages
        const messagesRaw: any[] = (await query(`
            SELECT gm.id, gm.message_text, gm.message_type, gm.created_at, u.username, u.id as user_id, gm.related_answer_id,
                   gm.reply_to_message_id, u.profile_picture,
                   u_replied.username as replied_username,
                   gm_replied.message_text as replied_text
            FROM group_messages gm
            JOIN users u ON gm.user_id = u.id
            LEFT JOIN group_messages gm_replied ON gm.reply_to_message_id = gm_replied.id
            LEFT JOIN users u_replied ON gm_replied.user_id = u_replied.id
            WHERE gm.group_id = ?
            ORDER BY gm.created_at ASC
        `, [groupId])) as any[];

        const messages = messagesRaw.map(msg => ({
            ...msg,
            profile_picture: msg.profile_picture ? msg.profile_picture.toString('base64') : null
        }));

        // Fetch Read Status: For each message, find users who have it as their last_read_message_id
        const readStatusRaw: any[] = (await query(`
            SELECT gm.last_read_message_id as message_id, u.username, u.id as user_id, u.profile_picture
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = ? AND gm.last_read_message_id IS NOT NULL
        `, [groupId])) as any[];

        const readStatus = readStatusRaw.map(rs => ({
            ...rs,
            profile_picture: rs.profile_picture ? rs.profile_picture.toString('base64') : null
        }));

        return { messages, readStatus };
    } catch (e) {
        return { error: "Erreur lors de la récupération des messages" };
    }
}

export async function markGroupAsRead(groupId: number) {
    try {
        const session = await requireAuth();
        const currentUserId = session.userId as number;

        // Get the latest message ID for this group
        const latestMsgRes: any = await query("SELECT id FROM group_messages WHERE group_id = ? ORDER BY id DESC LIMIT 1", [groupId]);

        if (latestMsgRes.length > 0) {
            const latestId = latestMsgRes[0].id;
            await query("UPDATE group_members SET last_read_message_id = ? WHERE group_id = ? AND user_id = ?", [latestId, groupId, currentUserId]);
        }

        return { success: true };
    } catch (e) {
        return { error: "Erreur lors du marquage comme lu" };
    }
}

export async function getUserGroups() {
    try {
        const session = await requireAuth();
        const userId = session.userId as number;

        const userRes: any = await query("SELECT username, profile_picture FROM users WHERE id = ?", [userId]);
        const username = userRes[0]?.username || "DQ";
        const userProfilePicture = userRes[0]?.profile_picture ? userRes[0].profile_picture.toString('base64') : null;

        const groups: any[] = (await query(`
            SELECT dg.id, dg.name, dg.profile_picture,
                   (SELECT COUNT(*) FROM group_members WHERE group_id = dg.id) as member_count,
                   (SELECT message_text FROM group_messages WHERE group_id = dg.id ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM group_messages WHERE group_id = dg.id ORDER BY created_at DESC LIMIT 1) as last_message_date,
                   (SELECT u.username FROM group_messages gm JOIN users u ON gm.user_id = u.id WHERE gm.group_id = dg.id ORDER BY gm.created_at DESC LIMIT 1) as last_author,
                   (SELECT COUNT(*) FROM group_messages gm2 WHERE gm2.group_id = dg.id AND (gm.last_read_message_id IS NULL OR gm2.id > gm.last_read_message_id) AND gm2.user_id != ?) as unread_count,
                   (SELECT COUNT(*) FROM group_messages gm3 WHERE gm3.group_id = dg.id AND (gm.last_read_message_id IS NULL OR gm3.id > gm.last_read_message_id) AND gm3.user_id != ? AND gm3.message_text LIKE CONCAT('%@', ?, '%')) as unread_ping_count
            FROM discussion_groups dg
            JOIN group_members gm ON dg.id = gm.group_id
            WHERE gm.user_id = ?
            ORDER BY last_message_date DESC, dg.created_at DESC
        `, [userId, userId, username, userId])) as any[];

        // Convert Buffers to strings to avoid "Only plain objects can be passed to Client Components" error
        const serializedGroups = groups.map(g => ({
            ...g,
            profile_picture: g.profile_picture ? g.profile_picture.toString('base64') : null
        }));

        return { groups: serializedGroups, username, profilePicture: userProfilePicture };
    } catch (e) {
        return { error: "Erreur lors de la récupération des groupes" };
    }
}

export async function leaveGroup(groupId: number) {
    try {
        const session = await requireAuth();
        const currentUserId = session.userId as number;

        // Fetch username
        const userRes: any = await query("SELECT username FROM users WHERE id = ?", [currentUserId]);
        if (userRes.length === 0) throw new Error("Utilisateur non trouvé");
        const username = userRes[0].username;

        // Verify if creator
        const groupRes: any = await query("SELECT created_by FROM discussion_groups WHERE id = ?", [groupId]);
        if (groupRes.length > 0 && groupRes[0].created_by === currentUserId) {
            return { error: "Le créateur ne peut pas quitter le groupe. Supprimez le groupe ou transférez les droits (non encore supporté)." };
        }

        // Remove from members
        await query("DELETE FROM group_members WHERE group_id = ? AND user_id = ?", [groupId, currentUserId]);

        // Post system message
        await query(
            "INSERT INTO group_messages (group_id, user_id, message_text, message_type) VALUES (?, ?, ?, 'system')",
            [groupId, currentUserId, `${username} a quitté la discussion.`]
        );

        revalidatePath("/groups");
        revalidatePath(`/groups/${groupId}`);
        return { success: true };
    } catch (e) {
        return { error: "Erreur lors de la sortie du groupe." };
    }
}

export async function kickMember(groupId: number, userIdToKick: number) {
    try {
        const session = await requireAuth();
        const currentUserId = session.userId as number;

        // Verify admin
        const groupRes: any = await query("SELECT created_by FROM discussion_groups WHERE id = ?", [groupId]);
        if (groupRes.length === 0 || groupRes[0].created_by !== currentUserId) {
            return { error: "Non autorisé" };
        }

        // Fetch usernames
        const adminRes: any = await query("SELECT username FROM users WHERE id = ?", [currentUserId]);
        const targetRes: any = await query("SELECT username FROM users WHERE id = ?", [userIdToKick]);

        if (adminRes.length === 0 || targetRes.length === 0) throw new Error("Utilisateur non trouvé");

        const adminName = adminRes[0].username;
        const targetName = targetRes[0].username;

        // Remove from members
        await query("DELETE FROM group_members WHERE group_id = ? AND user_id = ?", [groupId, userIdToKick]);

        // Post system message
        await query(
            "INSERT INTO group_messages (group_id, user_id, message_text, message_type) VALUES (?, ?, ?, 'system')",
            [groupId, currentUserId, `${targetName} a été retiré de la discussion par ${adminName}.`]
        );

        revalidatePath(`/groups/${groupId}`);
        return { success: true };
    } catch (e) {
        return { error: "Erreur lors de l'exclusion du membre." };
    }
}
