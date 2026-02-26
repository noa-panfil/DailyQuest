import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";
import BottomNav from "@/components/BottomNav";
import FriendSearch from "@/components/FriendSearch";

export default async function SearchPage() {
    const session = await requireAuth();
    const userId = session.userId as number;
    const userRes: any = await query("SELECT username, profile_picture FROM users WHERE id = ?", [userId]);
    const username = userRes[0]?.username || "DQ";
    const userProfilePic = userRes[0]?.profile_picture ? userRes[0].profile_picture.toString('base64') : null;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans pb-24">
            <header className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Recherche
                </h1>
            </header>

            <main className="flex-1 flex flex-col p-4 w-full max-w-md mx-auto gap-4 mt-2">
                <p className="text-sm text-slate-400 font-semibold">Trouve de nouveaux amis avec qui comparer tes réponses !</p>
                <FriendSearch />
            </main>

            <BottomNav username={username} profilePicture={userProfilePic} />
        </div>
    );
}
