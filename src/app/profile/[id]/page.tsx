import Link from "next/link";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { notFound } from "next/navigation";
import AddFriendButton from "@/components/AddFriendButton";
import RemoveFriendButton from "@/components/RemoveFriendButton";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import ProfileTracker from "@/components/ProfileTracker";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await requireAuth();
    const currentUserId = session.userId as number;
    const { id } = await params;
    const profileId = parseInt(id);

    const currentUserRes: any = await query("SELECT username, profile_picture FROM users WHERE id = ?", [currentUserId]);
    const currentUsername = currentUserRes[0]?.username || "DQ";
    const currentUserPic = currentUserRes[0]?.profile_picture ? currentUserRes[0].profile_picture.toString('base64') : null;

    if (isNaN(profileId)) {
        notFound();
    }

    // 1. Fetch User Info
    const userRes: any = await query("SELECT id, username, profile_picture, strike_count, max_strike_count, privacy_friends, privacy_answers FROM users WHERE id = ?", [profileId]);
    if (userRes.length === 0) {
        notFound();
    }
    const profileUser = userRes[0];
    const profilePicBase64 = profileUser.profile_picture ? profileUser.profile_picture.toString('base64') : null;

    const isOwnProfile = currentUserId === profileId;

    // 2. Fetch Friendship Status
    let friendshipStatus = null;
    let friendshipId = null;
    if (!isOwnProfile) {
        const fsRes: any = await query(`
            SELECT id, status FROM friendships 
            WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)
        `, [currentUserId, profileId, profileId, currentUserId]);
        if (fsRes.length > 0) {
            friendshipStatus = fsRes[0].status; // 'pending' | 'accepted'
            friendshipId = fsRes[0].id; // The ID of the friendship row
        }
    }

    const isFriends = friendshipStatus === 'accepted';

    // 3. Stats
    const friendsCountRes: any = await query(`
        SELECT COUNT(*) as count FROM friendships 
        WHERE (user_id_1 = ? OR user_id_2 = ?) AND status = 'accepted'
    `, [profileId, profileId]);
    const friendsCount = friendsCountRes[0].count;

    const answersCountRes: any = await query(`
        SELECT COUNT(*) as count FROM user_answers WHERE user_id = ?
    `, [profileId]);
    const answersCount = answersCountRes[0].count;

    const privacyFriends = profileUser.privacy_friends || 'friends';
    const privacyAnswers = profileUser.privacy_answers || 'friends';

    const canViewFriends = isOwnProfile || privacyFriends === 'public' || (privacyFriends === 'friends' && isFriends);
    const canViewAnswers = isOwnProfile || privacyAnswers === 'public' || (privacyAnswers === 'friends' && isFriends);

    // 4. Fetch based on privacy settings
    let profileFriends: any[] = [];
    let recentAnswers: any[] = [];
    let compatibilityPercentage: number | null = null;
    let commonAnswersCount = 0;

    const privacyCompatibility = profileUser.privacy_compatibility || 'public';
    const canViewCompatibility = !isOwnProfile && (privacyCompatibility === 'public' || (privacyCompatibility === 'friends' && isFriends));

    if (canViewCompatibility) {
        const compRes: any = await query(`
            SELECT 
                SUM(CASE WHEN ua1.selected_option = ua2.selected_option THEN 1 ELSE 0 END) as matching_answers,
                COUNT(*) as total_common
            FROM user_answers ua1
            JOIN user_answers ua2 ON ua1.question_id = ua2.question_id
            WHERE ua1.user_id = ? AND ua2.user_id = ?
        `, [currentUserId, profileId]);

        if (compRes.length > 0 && compRes[0].total_common > 0) {
            commonAnswersCount = compRes[0].total_common;
            compatibilityPercentage = Math.round((compRes[0].matching_answers / commonAnswersCount) * 100);
        }
    }

    if (canViewFriends) {
        profileFriends = (await query(`
            SELECT u.id, u.username, 
                (SELECT status FROM friendships f2 WHERE (f2.user_id_1 = ? AND f2.user_id_2 = u.id) OR (f2.user_id_1 = u.id AND f2.user_id_2 = ?)) as my_friendship_status
            FROM friendships f 
            JOIN users u ON u.id = CASE WHEN f.user_id_1 = ? THEN f.user_id_2 ELSE f.user_id_1 END
            WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND f.status = 'accepted' AND u.id != ?
        `, [currentUserId, currentUserId, profileId, profileId, profileId, profileId])) as any[];
    }

    if (canViewAnswers) {
        recentAnswers = (await query(`
            SELECT ua.id, dq.question_text as question_text, dq.option_1, dq.option_2, dq.option_3, dq.option_4, ua.selected_option, ua.created_at
            FROM user_answers ua
            JOIN daily_questions dq ON ua.question_id = dq.id
            WHERE ua.user_id = ?
            ORDER BY ua.created_at DESC
            LIMIT 15
        `, [profileId])) as any[];
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans pb-24">
            <header className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Profil
                </h1>
                <BackButton fallbackUrl="/friends" />
            </header>

            {!isOwnProfile && <ProfileTracker user={{ id: profileId, username: profileUser.username }} />}

            <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto p-4 gap-6">

                {/* En-tête du profil */}
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center mt-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />

                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-950 shadow-lg flex items-center justify-center text-4xl font-bold text-slate-300 uppercase mb-4 z-10 overflow-hidden">
                        {profilePicBase64 ? (
                            <img src={`data:image/webp;base64,${profilePicBase64}`} className="w-full h-full object-cover" alt={profileUser.username} />
                        ) : (
                            profileUser.username.slice(0, 2)
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-white z-10">@{profileUser.username}</h2>

                    <div className="grid grid-cols-2 gap-4 mt-6 z-10 w-full">
                        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center border border-slate-700/50">
                            <span className="text-3xl font-black text-indigo-400">{friendsCount}</span>
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Amis</span>
                        </div>
                        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center border border-slate-700/50">
                            <span className="text-3xl font-black text-emerald-400">{answersCount}</span>
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Réponses</span>
                        </div>

                        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center border border-slate-700/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full blur-xl translate-x-4 -translate-y-4"></div>
                            <span className="text-3xl font-black text-orange-400 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.87a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd" />
                                </svg>
                                {profileUser.strike_count || 0}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 text-center">Série actuelle</span>
                        </div>

                        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center border border-amber-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl translate-x-4 -translate-y-4"></div>
                            <span className="text-3xl font-black text-amber-500 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                                {profileUser.max_strike_count || 0}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 text-center">Record absolu</span>
                        </div>
                    </div>

                    {/* Jauge de Compatibilité */}
                    {canViewCompatibility && (
                        <div className="w-full mt-6 bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex flex-col gap-2 z-10">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                    Compatibilité
                                </span>
                                {compatibilityPercentage !== null ? (
                                    <span className="text-lg font-black text-white">{compatibilityPercentage}%</span>
                                ) : (
                                    <span className="text-xs text-slate-500 font-medium">Pas assez de données</span>
                                )}
                            </div>

                            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700/50">
                                {compatibilityPercentage !== null ? (
                                    <div
                                        className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${compatibilityPercentage}%` }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800/50" />
                                )}
                            </div>

                            {compatibilityPercentage !== null && (
                                <p className="text-[10px] text-slate-500 text-center mt-1">
                                    Basé sur {commonAnswersCount} réponse{commonAnswersCount > 1 ? 's' : ''} en commun
                                </p>
                            )}
                        </div>
                    )}

                    {/* Bouton d'action */}
                    {!isOwnProfile && (
                        <div className="mt-6 w-full flex justify-center z-10">
                            {friendshipStatus === 'accepted' && friendshipId && (
                                <div className="group relative">
                                    <span className="px-6 py-3 rounded-xl bg-emerald-950/50 border border-emerald-900 text-emerald-400 text-sm font-bold flex items-center gap-2 group-hover:hidden">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Vous êtes amis
                                    </span>
                                    <div className="hidden group-hover:block transition-all w-full min-w-[150px]">
                                        <RemoveFriendButton friendshipId={friendshipId} friendName={profileUser.username} />
                                    </div>
                                </div>
                            )}
                            {friendshipStatus === 'pending' && (
                                <span className="px-6 py-3 rounded-xl bg-orange-950/50 border border-orange-900 text-orange-400 text-sm font-bold flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    Demande en attente
                                </span>
                            )}
                            {!friendshipStatus && (
                                <div className="w-full flex justify-center">
                                    <AddFriendButton targetId={profileId} buttonText={`Ajouter ${profileUser.username}`} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Conditional Sections based on privacy */}

                {canViewFriends && (
                    <>
                        <div className="h-px bg-slate-800 w-full mt-2" />

                        {/* Ses amis */}
                        <section className="flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
                                {isOwnProfile ? "Tes amis" : "Ses amis"}
                                <span className="ml-2 bg-indigo-600/50 text-indigo-200 px-2 py-0.5 rounded-full text-xs">{profileFriends.length}</span>
                            </h3>
                            <div className="flex flex-col gap-2">
                                {profileFriends.filter((f: any) => f.id !== currentUserId).length === 0 ? (
                                    <p className="text-sm text-slate-500 italic px-2">Aucun autre ami pour le moment.</p>
                                ) : (
                                    profileFriends.filter((f: any) => f.id !== currentUserId).map((f: any) => (
                                        <div key={f.id} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
                                            <Link href={`/profile/${f.id}`} className="flex items-center gap-3 group">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm uppercase">
                                                    {f.username.slice(0, 2)}
                                                </div>
                                                <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{f.username}</span>
                                            </Link>

                                            <div>
                                                {f.my_friendship_status === 'accepted' && (
                                                    <span className="px-3 py-1.5 bg-emerald-950/50 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-900 uppercase">Amis</span>
                                                )}
                                                {f.my_friendship_status === 'pending' && (
                                                    <span className="px-3 py-1.5 bg-orange-950/50 text-orange-400 text-xs font-bold rounded-lg border border-orange-900 uppercase">En attente</span>
                                                )}
                                                {!f.my_friendship_status && (
                                                    <AddFriendButton targetId={f.id} />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}

                {canViewAnswers && (
                    <>
                        <div className="h-px bg-slate-800 w-full" />

                        {/* Activié: Dernières réponses */}
                        <section className="flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
                                {isOwnProfile ? "Tes dernières réponses" : "Ses dernières réponses"}
                                <span className="ml-2 bg-emerald-600/50 text-emerald-200 px-2 py-0.5 rounded-full text-xs">{recentAnswers.length}</span>
                            </h3>
                            <div className="flex flex-col gap-3">
                                {recentAnswers.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic px-2">Aucune réponse pour le moment.</p>
                                ) : (
                                    recentAnswers.map(ans => {
                                        let choiceText = "Inconnu";
                                        if (ans.selected_option === 1) choiceText = ans.option_1;
                                        else if (ans.selected_option === 2) choiceText = ans.option_2;
                                        else if (ans.selected_option === 3) choiceText = ans.option_3;
                                        else if (ans.selected_option === 4) choiceText = ans.option_4;

                                        return (
                                            <div key={ans.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 shadow-lg">
                                                <p className="text-sm text-slate-300 font-semibold leading-relaxed">{ans.question_text}</p>
                                                <div className="bg-indigo-950/30 border border-indigo-900/50 px-4 py-2 rounded-xl w-fit flex items-center gap-2">
                                                    <span className="text-sm font-bold text-indigo-400">@{profileUser.username}</span>
                                                    <span className="text-xs text-slate-500 font-medium">a répondu</span>
                                                    <span className="text-sm font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded uppercase">{choiceText}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    </>
                )}

                {!canViewFriends && !canViewAnswers && !isOwnProfile && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center gap-4 mt-8 shadow-inner">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 border-2 border-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-300">Profil Privé</h3>
                        <p className="text-sm text-slate-500">
                            Ce compte est privé ou tu n'as pas l'autorisation de voir ces informations.
                        </p>
                    </div>
                )}
            </main>

            <BottomNav username={currentUsername} profilePicture={currentUserPic} />
        </div>
    );
}
