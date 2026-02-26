import Link from "next/link";
import SubmitQuestForm from "@/components/SubmitQuestForm";
import HeaderProfile from "@/components/HeaderProfile";
import BottomNav from "@/components/BottomNav";
import HomeGroupsList from "@/components/HomeGroupsList";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export default async function Home() {
  const session = await requireAuth();
  const userId = session.userId as number;

  const userResult: any = await query('SELECT username, strike_count, is_admin, profile_picture FROM users WHERE id = ?', [userId]);
  const user = userResult[0];

  const userProfilePic = user?.profile_picture ? user.profile_picture.toString('base64') : null;

  // 1. Récupérer la question active
  const activeQuestionResult: any = await query('SELECT * FROM daily_questions WHERE is_active = TRUE LIMIT 1');
  let todayQuestion = activeQuestionResult.length > 0 ? activeQuestionResult[0] : null;

  // 2. Si aucune question active, on en tire une au hasard et on l'active
  if (!todayQuestion) {
    const rqResult: any = await query('SELECT * FROM daily_questions WHERE is_active = FALSE ORDER BY RAND() LIMIT 1');
    if (rqResult.length > 0) {
      todayQuestion = rqResult[0];
      await query("UPDATE daily_questions SET is_active = TRUE, scheduled_date = CURDATE() WHERE id = ?", [todayQuestion.id]);
    }
  }

  // 3. Vérifier si l'utilisateur a déjà répondu aujourd'hui
  let hasAnswered = false;
  if (todayQuestion) {
    const answerStatus: any = await query("SELECT id FROM user_answers WHERE user_id = ? AND question_id = ?", [userId, todayQuestion.id]);
    hasAnswered = answerStatus.length > 0;
  }

  const groupsData: any[] = await query(`
    SELECT dg.id, dg.name, dg.profile_picture,
      (SELECT COUNT(*) FROM group_members WHERE group_id = dg.id) as member_count,
      (SELECT u.username FROM group_messages gm_msg JOIN users u ON gm_msg.user_id = u.id WHERE gm_msg.group_id = dg.id ORDER BY gm_msg.created_at DESC LIMIT 1) as last_author,
      (SELECT message_text FROM group_messages gm3 WHERE gm3.group_id = dg.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM group_messages gm4 WHERE gm4.group_id = dg.id ORDER BY created_at DESC LIMIT 1) as last_message_date,
      (SELECT COUNT(*) FROM group_messages gm5 WHERE gm5.group_id = dg.id AND (gm.last_read_message_id IS NULL OR gm5.id > gm.last_read_message_id) AND gm5.user_id != ?) as unread_count,
      (SELECT COUNT(*) FROM group_messages gm6 WHERE gm6.group_id = dg.id AND (gm.last_read_message_id IS NULL OR gm6.id > gm.last_read_message_id) AND gm6.user_id != ? AND gm6.message_text LIKE CONCAT('%@', ?, '%')) as unread_ping_count
    FROM group_members gm
    JOIN discussion_groups dg ON gm.group_id = dg.id
    WHERE gm.user_id = ?
    ORDER BY last_message_date DESC, dg.created_at DESC
  `, [userId, userId, user?.username || "DQ", userId]) as any[];

  const initialGroups = groupsData.map(g => ({
    ...g,
    profile_picture: g.profile_picture ? g.profile_picture.toString('base64') : null
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          DailyQuest
        </h1>
        <HeaderProfile
          userId={userId}
          username={user?.username || "DQ"}
          strikeCount={user?.strike_count || 0}
          isAdmin={user?.is_admin}
          profilePicture={userProfilePic}
        />
      </header>

      <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto p-4 gap-6 pb-24">

        <section className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl shadow-indigo-900/20 mt-4 flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />

          <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold tracking-wide uppercase">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Quête du jour</span>
          </div>

          <h2 className="text-xl font-extrabold leading-tight mt-1 z-10 text-white">
            {todayQuestion?.question_text || "La banque de quêtes est vide pour le moment !"}
          </h2>

          {todayQuestion && !hasAnswered && (
            <>
              <p className="text-slate-400 text-sm leading-relaxed mb-1 z-10">
                Choisis une réponse pour la partager dans tes groupes de discussion.
              </p>
              <SubmitQuestForm question={todayQuestion} />
            </>
          )}

          {todayQuestion && hasAnswered && (
            <div className="bg-emerald-950/40 border border-emerald-900/50 p-4 rounded-xl text-center z-10 mt-2">
              <p className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Quête accomplie !
              </p>
              <p className="text-slate-400 text-sm mt-2">Ta réponse a été envoyée. Retrouve tes amis dans les groupes de discussion pour en débattre !</p>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 mt-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-lg font-bold text-slate-100">Tes groupes</h3>
            <Link href="/groups" className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors">
              Voir tout
            </Link>
          </div>

          <HomeGroupsList initialGroups={initialGroups} initialUsername={user?.username || "DQ"} />
        </section>

      </main>

      <BottomNav username={user?.username || "DQ"} profilePicture={userProfilePic} />
    </div>
  );
}
