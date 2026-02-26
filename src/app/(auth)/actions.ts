"use server";

import { query } from "@/lib/db";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Remplis tous les champs !" };
    }

    try {
        const users: any = await query("SELECT id, password_hash FROM users WHERE email = ? LIMIT 1", [email]);
        if (users.length === 0) {
            return { error: "Email ou mot de passe incorrect." };
        }

        const match = await bcrypt.compare(password, users[0].password_hash);
        if (!match) {
            return { error: "Email ou mot de passe incorrect." };
        }

        // Créer la session avec l'ID utilisateur
        await createSession(users[0].id);

    } catch (err) {
        console.error(err);
        return { error: "Erreur lors de la connexion." };
    }

    // Effectuer la redirection APRÈS le try/catch pour éviter qu'il soit bloqué
    redirect("/");
}

export async function registerAction(prevState: any, formData: FormData) {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!username || !email || !password || !confirmPassword) {
        return { error: "Remplis tous les champs !" };
    }

    if (password !== confirmPassword) {
        return { error: "Les mots de passe ne correspondent pas !" };
    }

    if (password.length < 6) {
        return { error: "Le mot de passe doit faire au moins 6 caractères." };
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUsers: any = await query(
            "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
            [email, username]
        );

        if (existingUsers.length > 0) {
            return { error: "Cet email ou ce pseudo est déjà utilisé." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result: any = await query(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        await createSession(result.insertId);

    } catch (err) {
        console.error(err);
        return { error: "Erreur lors de l'inscription." };
    }

    // Effectuer la redirection APRÈS le block try/catch
    redirect("/");
}
