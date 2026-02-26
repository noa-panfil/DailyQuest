import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";
import BottomNav from "@/components/BottomNav";
import CollapsibleSection from "@/components/CollapsibleSection";
import Link from "next/link";
import PasswordForm from "./PasswordForm";
import PrivacyForm from "./PrivacyForm";
import ProfilePictureEditor from "@/components/ProfilePictureEditor";

export default async function AccountPage() {
    const session = await requireAuth();
    const userId = session.userId as number;

    const userRes: any = await query("SELECT id, username, email, strike_count, max_strike_count, privacy_friends, privacy_answers, privacy_compatibility, profile_picture FROM users WHERE id = ?", [userId]);
    const user = userRes[0];

    // Convert Buffer to base64 if it exists
    const profilePicBase64 = user.profile_picture ? user.profile_picture.toString('base64') : null;

    const friendsCountRes: any = await query(`
        SELECT COUNT(*) as count FROM friendships 
        WHERE (user_id_1 = ? OR user_id_2 = ?) AND status = 'accepted'
    `, [userId, userId]);
    const friendsCount = friendsCountRes[0].count;

    const answersCountRes: any = await query(`
        SELECT COUNT(*) as count FROM user_answers WHERE user_id = ?
    `, [userId]);
    const answersCount = answersCountRes[0].count;

    const recentAnswers: any[] = (await query(`
        SELECT ua.id, dq.question_text, dq.option_1, dq.option_2, dq.option_3, dq.option_4, ua.selected_option, ua.created_at
        FROM user_answers ua
        JOIN daily_questions dq ON ua.question_id = dq.id
        WHERE ua.user_id = ?
        ORDER BY ua.created_at DESC
        LIMIT 15
    `, [userId])) as any[];

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans pb-24">
            <header className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Mon Compte
                </h1>
            </header>

            <main className="flex-1 flex flex-col p-4 w-full max-w-md mx-auto gap-6">

                {/* Profile Overview Card */}
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center mt-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                    <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full -translate-x-10 -translate-y-10" />

                    <ProfilePictureEditor
                        currentPicture={profilePicBase64}
                        username={user.username}
                    />

                    <h2 className="text-2xl font-bold text-white z-10">@{user.username}</h2>
                    <p className="text-slate-400 text-sm mt-1 mb-2 z-10">{user.email}</p>

                    <div className="grid grid-cols-2 gap-4 mt-4 z-10 w-full">
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
                                {user.strike_count || 0}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 text-center">Série</span>
                        </div>

                        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center border border-amber-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl translate-x-4 -translate-y-4"></div>
                            <span className="text-3xl font-black text-amber-500 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                                {user.max_strike_count || 0}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 text-center">Record</span>
                        </div>
                    </div>
                </div>

                {/* Recent Answers Sub-section */}
                <CollapsibleSection title="Mes dernières réponses" count={recentAnswers.length} badgeColor="bg-emerald-600/50 text-emerald-200" defaultOpen={true}>
                    <div className="flex flex-col gap-3">
                        {recentAnswers.length === 0 ? (
                            <p className="text-sm text-slate-500 italic px-2">Aucune réponse pour le moment. Réponds à la question d'aujourd'hui !</p>
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
                                            <span className="text-sm font-bold text-indigo-400">@{user.username}</span>
                                            <span className="text-xs text-slate-500 font-medium">a répondu</span>
                                            <span className="text-sm font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded uppercase">{choiceText}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CollapsibleSection>

                {/* Privacy Sub-section */}
                <h3 className="text-lg font-bold text-slate-100 mt-2 px-1">Confidentialité</h3>
                <PrivacyForm
                    initialFriendsPrivacy={user.privacy_friends}
                    initialAnswersPrivacy={user.privacy_answers}
                    initialCompatibilityPrivacy={user.privacy_compatibility || 'public'}
                />

                {/* Password Change Sub-section */}
                <h3 className="text-lg font-bold text-slate-100 mt-2 px-1">Sécurité</h3>
                <PasswordForm />

                {/* Application Sub-section */}
                <h3 className="text-lg font-bold text-slate-100 mt-2 px-1">Application</h3>
                <Link href="/download" className="bg-slate-900 hover:bg-slate-800 border border-slate-700/50 p-6 rounded-3xl shadow-xl flex items-center justify-between group transition-colors">
                    <div className="flex flex-col gap-1">
                        <span className="text-white font-bold text-base group-hover:text-indigo-400 transition-colors">Télécharger l'App</span>
                        <span className="text-sm text-slate-400">Installer DailyQuest sur l'écran d'accueil</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </Link>

            </main>

            <BottomNav username={user.username} profilePicture={profilePicBase64} />
        </div>
    );
}
