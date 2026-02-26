import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import CreateGroupButton from "./CreateGroupButton";
import GroupsList from "./GroupsList";
import { getUserGroups } from "./[id]/actions";

export default async function GroupsPage() {
    const session = await requireAuth();
    const userId = session.userId as number;

    const { groups, username, profilePicture, error } = await getUserGroups();

    if (error) {
        return <div>Erreur lors du chargement des groupes.</div>;
    }

    const typedGroups = groups as any[];
    const typedUsername = username as string;
    const typedProfilePic = profilePicture as string | null;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans pb-24">
            <header className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Groupes
                </h1>
                <CreateGroupButton />
            </header>

            <main className="flex-1 flex flex-col p-4 w-full max-w-md mx-auto gap-4 mt-2">
                <GroupsList initialGroups={typedGroups} initialUsername={typedUsername} />
            </main>

            <BottomNav username={typedUsername} profilePicture={typedProfilePic} />
        </div>
    );
}
