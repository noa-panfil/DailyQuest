"use server";

import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function changePasswordAction(formData: FormData) {
    try {
        const session = await requireAuth();
        const userId = session.userId as number;

        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;

        if (!currentPassword || !newPassword) {
            return { error: "Veuillez remplir tous les champs." };
        }
        if (newPassword.length < 6) {
            return { error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
        }

        const userRes: any = await query("SELECT password_hash FROM users WHERE id = ?", [userId]);
        if (userRes.length === 0) {
            return { error: "Utilisateur non trouvé." };
        }
        const user = userRes[0];

        const match = await bcrypt.compare(currentPassword, user.password_hash);
        if (!match) {
            return { error: "Le mot de passe actuel est incorrect." };
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, userId]);

        return { success: true, message: "Mot de passe mis à jour avec succès !" };
    } catch (e) {
        return { error: "Erreur serveur lors de la mise à jour." };
    }
}

export async function updatePrivacySettings(formData: FormData) {
    try {
        const session = await requireAuth();
        const userId = session.userId as number;

        const privacyFriends = formData.get("privacyFriends") as string;
        const privacyAnswers = formData.get("privacyAnswers") as string;

        if (!['public', 'friends', 'private'].includes(privacyFriends) || !['public', 'friends', 'private'].includes(privacyAnswers)) {
            return { error: "Valeurs de confidentialité invalides." };
        }

        await query("UPDATE users SET privacy_friends = ?, privacy_answers = ? WHERE id = ?", [privacyFriends, privacyAnswers, userId]);

        return { success: true };
    } catch (e) {
        return { error: "Erreur serveur lors de la mise à jour." };
    }
}

export async function updateProfilePicture(formData: FormData) {
    try {
        const session = await requireAuth();
        const userId = session.userId as number;

        const picture = formData.get("picture") as File;
        if (!picture) {
            return { error: "Aucune image fournie." };
        }

        const buffer = Buffer.from(await picture.arrayBuffer());
        await query("UPDATE users SET profile_picture = ? WHERE id = ?", [buffer, userId]);

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/account");
        revalidatePath("/");

        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Erreur lors de la mise à jour de la photo." };
    }
}

export async function removeProfilePicture() {
    try {
        const session = await requireAuth();
        const userId = session.userId as number;

        await query("UPDATE users SET profile_picture = NULL WHERE id = ?", [userId]);

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/account");
        revalidatePath("/");

        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Erreur lors de la suppression de la photo." };
    }
}

