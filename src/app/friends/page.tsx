import Link from "next/link";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import CollapsibleSection from "@/components/CollapsibleSection";
import RemoveFriendButton from "@/components/RemoveFriendButton";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";
import { acceptFriendRequest, rejectOrRemoveFriend } from "@/app/friends/actions";

export default async function FriendsPage() {
    const session = await requireAuth();
    const userId = session.userId as number;

    const userRes: any = await query("SELECT username, profile_picture FROM users WHERE id = ?", [userId]);
    const username = userRes[0]?.username || "DQ";
    const userProfilePic = userRes[0]?.profile_picture ? userRes[0].profile_picture.toString('base64') : null;

    // Fetch received pending requests
    const pendingRequestsRaw: any = await query(`
        SELECT f.id, u.username, u.id as user_id, u.profile_picture
        FROM friendships f
        JOIN users u ON f.user_id_1 = u.id
        WHERE f.user_id_2 = ? AND f.status = 'pending'
    `, [userId]);

    const pendingRequests = pendingRequestsRaw.map((req: any) => ({
        ...req,
        profile_picture: req.profile_picture ? req.profile_picture.toString('base64') : null
    }));

    // Fetch sent pending requests (to display "Demandes envoyées" section)
    const sentRequestsRaw: any = await query(`
        SELECT f.id, u.username, u.id as user_id, u.profile_picture
        FROM friendships f
        JOIN users u ON f.user_id_2 = u.id
        WHERE f.user_id_1 = ? AND f.status = 'pending'
    `, [userId]);

    const sentRequests = sentRequestsRaw.map((req: any) => ({
        ...req,
        profile_picture: req.profile_picture ? req.profile_picture.toString('base64') : null
    }));

    // Fetch current friends (accepted) where user is either id_1 or id_2
    const friendsListRaw: any = await query(`
        SELECT f.id as friendship_id, u.id, u.username, u.profile_picture
        FROM friendships f
        JOIN users u ON (f.user_id_1 = u.id OR f.user_id_2 = u.id)
        WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND f.status = 'accepted' AND u.id != ?
    `, [userId, userId, userId]);

    const friendsList = friendsListRaw.map((fr: any) => ({
        ...fr,
        profile_picture: fr.profile_picture ? fr.profile_picture.toString('base64') : null
    }));

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans pb-24">
            <header className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Amis
                </h1>
                <BackButton fallbackUrl="/" />
            </header>

            <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto p-4 gap-6">

                {/* Section Demandes Envoyées */}
                <CollapsibleSection title="Demandes envoyées" count={sentRequests.length} badgeColor="bg-orange-500/50 text-orange-200" defaultOpen={false}>
                    {sentRequests.length === 0 ? (
                        <p className="text-slate-500 text-sm italic px-2 py-4">Aucune demande en attente.</p>
                    ) : (
                        sentRequests.map((req: any) => (
                            <div key={req.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-sm uppercase overflow-hidden">
                                        {req.profile_picture ? (
                                            <img src={`data:image/webp;base64,${req.profile_picture}`} className="w-full h-full object-cover" alt={req.username} />
                                        ) : (
                                            req.username.slice(0, 2)
                                        )}
                                    </div>
                                    <span className="font-semibold text-slate-200">{req.username}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <form action={rejectOrRemoveFriend}>
                                        <input type="hidden" name="friendshipId" value={req.id} />
                                        <button type="submit" title="Annuler" className="bg-orange-950/30 text-orange-500 hover:bg-orange-900/50 border border-orange-900/50 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors">
                                            Annuler
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </CollapsibleSection>

                {/* Section Demandes Reçues */}
                <CollapsibleSection title="Demandes reçues" count={pendingRequests.length} badgeColor="bg-red-500 text-white" defaultOpen={pendingRequests.length > 0}>
                    {pendingRequests.length === 0 ? (
                        <p className="text-slate-500 text-sm italic px-2 py-4">Superstar, mais aucune nouvelle demande pour l'instant !</p>
                    ) : (
                        pendingRequests.map((req: any) => (
                            <div key={req.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-sm uppercase overflow-hidden">
                                        {req.profile_picture ? (
                                            <img src={`data:image/webp;base64,${req.profile_picture}`} className="w-full h-full object-cover" alt={req.username} />
                                        ) : (
                                            req.username.slice(0, 2)
                                        )}
                                    </div>
                                    <span className="font-semibold text-slate-200">{req.username}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <form action={acceptFriendRequest}>
                                        <input type="hidden" name="friendshipId" value={req.id} />
                                        <button type="submit" className="p-2 bg-emerald-950/50 hover:bg-emerald-900/80 text-emerald-400 rounded-xl transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </form>
                                    <form action={rejectOrRemoveFriend}>
                                        <input type="hidden" name="friendshipId" value={req.id} />
                                        <button type="submit" className="p-2 bg-red-950/50 hover:bg-red-900/80 text-red-400 rounded-xl transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </CollapsibleSection>

                {/* Section Mes Amis */}
                <CollapsibleSection title="Mes amis" count={friendsList.length} badgeColor="bg-indigo-600 text-white" defaultOpen={true}>
                    {friendsList.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-6">Tu n'as pas encore d'amis ajoutés. Utilise la recherche !</p>
                    ) : (
                        friendsList.map((friend: any) => (
                            <div key={friend.friendship_id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group">
                                <Link href={`/profile/${friend.id}`} className="flex items-center gap-3 group-hover:opacity-80 transition-opacity">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-sm text-indigo-300 overflow-hidden">
                                        {friend.profile_picture ? (
                                            <img src={`data:image/webp;base64,${friend.profile_picture}`} className="w-full h-full object-cover" alt={friend.username} />
                                        ) : (
                                            friend.username.slice(0, 2)
                                        )}
                                    </div>
                                    <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{friend.username}</span>
                                </Link>
                                <RemoveFriendButton friendshipId={friend.friendship_id} friendName={friend.username} />
                            </div>
                        ))
                    )}
                </CollapsibleSection>
            </main>

            {/* Navigation App Mobile */}
            <BottomNav username={username} profilePicture={userProfilePic} />
        </div>
    );
}
