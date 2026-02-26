import Link from "next/link";
import SubmitQuestForm from "@/components/SubmitQuestForm";
import HeaderProfile from "@/components/HeaderProfile";
import BottomNav from "@/components/BottomNav";
import HomeGroupsList from "@/components/HomeGroupsList";
import NextQuestionCountdown from "@/components/NextQuestionCountdown";
import LostStrikePopup from "@/components/LostStrikePopup";
import TutorialOverlay from "@/components/TutorialOverlay";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export default async function Home() {
  const session = await requireAuth();
  const userId = session.userId as number;

  const userResult: any = await query('SELECT username, strike_count, is_admin, profile_picture, last_answered_date, has_completed_tutorial FROM users WHERE id = ?', [userId]);
  const user = userResult[0];

  const userProfilePic = user?.profile_picture ? user.profile_picture.toString('base64') : null;

  // 1. Récupérer la question active (avec vérification de la période actuelle : de midi à midi)
  const activeQuestionResult: any = await query(`
    SELECT *, (scheduled_date = DATE(DATE_SUB(NOW(), INTERVAL 12 HOUR))) as is_current_period 
    FROM daily_questions 
    WHERE is_active = TRUE LIMIT 1
  `);
  let todayQuestion = activeQuestionResult.length > 0 ? activeQuestionResult[0] : null;

  // 2. Si la question active a expiré (changement à midi)
  if (todayQuestion && !todayQuestion.is_current_period) {
    // Désactiver l'ancienne question
    await query("UPDATE daily_questions SET is_active = FALSE WHERE id = ?", [todayQuestion.id]);
    todayQuestion = null; // On force le script à en piocher une nouvelle ci-dessous
  }

  // 3. Si aucune question active (ou si on vient de désactiver l'ancienne), on en tire une au hasard et on l'active
  if (!todayQuestion) {
    const rqResult: any = await query('SELECT * FROM daily_questions WHERE is_active = FALSE ORDER BY RAND() LIMIT 1');
    if (rqResult.length > 0) {
      todayQuestion = rqResult[0];
      await query("UPDATE daily_questions SET is_active = TRUE, scheduled_date = DATE(DATE_SUB(NOW(), INTERVAL 12 HOUR)) WHERE id = ?", [todayQuestion.id]);
    }
  }

  // 4. Vérifier si l'utilisateur a perdu sa série de réponses (strikes)
  let lostStrike = false;
  if (todayQuestion && user.strike_count > 0 && user.last_answered_date) {
    const checkLost: any = await query(`
        SELECT 1 
        FROM users 
        WHERE id = ? 
        AND strike_count > 0 
        AND last_answered_date < DATE_SUB(?, INTERVAL 1 DAY)
    `, [userId, todayQuestion.scheduled_date]);

    if (checkLost.length > 0) {
      lostStrike = true;
      await query("UPDATE users SET strike_count = 0 WHERE id = ?", [userId]);
      user.strike_count = 0; // Mise à jour de la variable locale pour l'affichage de l'entête
    }
  }

  // 3. Vérifier si l'utilisateur a déjà répondu aujourd'hui
  let hasAnswered = false;
  let userAnswerText: string | null = null;
  let voteStats: any[] = [];
  let totalVotes = 0;

  if (todayQuestion) {
    const answerStatus: any = await query("SELECT answer_text, selected_option FROM user_answers WHERE user_id = ? AND question_id = ?", [userId, todayQuestion.id]);
    if (answerStatus.length > 0) {
      hasAnswered = true;
      userAnswerText = answerStatus[0].answer_text;

      // Calculer les statistiques si l'utilisateur a répondu
      const statsResult: any = await query(`
        SELECT selected_option, COUNT(*) as count 
        FROM user_answers 
        WHERE question_id = ? 
        GROUP BY selected_option
      `, [todayQuestion.id]);

      const statsMap: Record<number, number> = {};
      for (const row of statsResult) {
        totalVotes += row.count;
        statsMap[row.selected_option] = row.count;
      }

      voteStats = [
        { id: 1, optionText: todayQuestion.option_1, count: statsMap[1] || 0, percent: totalVotes > 0 ? Math.round(((statsMap[1] || 0) / totalVotes) * 100) : 0 },
        { id: 2, optionText: todayQuestion.option_2, count: statsMap[2] || 0, percent: totalVotes > 0 ? Math.round(((statsMap[2] || 0) / totalVotes) * 100) : 0 }
      ];
      if (todayQuestion.option_3) {
        voteStats.push({ id: 3, optionText: todayQuestion.option_3, count: statsMap[3] || 0, percent: totalVotes > 0 ? Math.round(((statsMap[3] || 0) / totalVotes) * 100) : 0 });
      }
      if (todayQuestion.option_4) {
        voteStats.push({ id: 4, optionText: todayQuestion.option_4, count: statsMap[4] || 0, percent: totalVotes > 0 ? Math.round(((statsMap[4] || 0) / totalVotes) * 100) : 0 });
      }
    }
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
      {!user?.has_completed_tutorial && <TutorialOverlay username={user?.username || "Joueur"} />}
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

      {lostStrike && <LostStrikePopup />}

      <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto p-4 gap-6 pb-24">

        <section className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl shadow-indigo-900/20 mt-4 flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />

          <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold tracking-wide uppercase">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Question du jour</span>
          </div>

          <h2 className="text-xl font-extrabold leading-tight mt-1 z-10 text-white">
            {todayQuestion?.question_text || "La banque de questions est vide pour le moment !"}
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
            <div className="bg-slate-800/80 border border-slate-700/50 p-5 rounded-2xl flex flex-col gap-4 z-10 mt-2 shadow-inner">
              <div className="flex items-center justify-between mb-1">
                <p className="text-emerald-400 font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Statistiques du Jour
                </p>
                <span className="text-xs text-slate-500 font-semibold">{totalVotes} vote{totalVotes > 1 ? 's' : ''} au total</span>
              </div>

              <div className="flex flex-col gap-4">
                {voteStats.sort((a, b) => b.count - a.count).map((stat, idx) => {
                  const isUserChoice = stat.optionText === userAnswerText;
                  // Determine color based on rank (1st, 2nd, etc) or user choice
                  let barColor = 'bg-slate-700';
                  if (idx === 0) barColor = 'bg-slate-600'; // Highest vote gets slightly lighter default
                  if (isUserChoice) barColor = 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20';

                  return (
                    <div key={idx} className="relative flex flex-col gap-1.5 group">
                      <div className="flex justify-between items-end px-1.5 z-10 relative">
                        <span className={`text-sm font-bold ${isUserChoice ? 'text-indigo-200' : 'text-slate-300'} flex items-center gap-2 transition-colors`}>
                          {stat.optionText}
                        </span>

                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-black ${isUserChoice ? 'text-indigo-100' : 'text-slate-400'}`}>{stat.percent}%</span>
                        </div>
                      </div>
                      <div className="w-full h-8 bg-slate-900/80 rounded-xl overflow-hidden border border-slate-700/50 relative shadow-inner">
                        <div
                          className={`h-full rounded-xl transition-all duration-[1500ms] ease-out ${barColor}`}
                          style={{ width: `${stat.percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {todayQuestion && (
            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm z-10 mt-2">
              <span className="text-sm text-slate-400 font-medium flex items-center gap-2 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prochaine question dans
              </span>
              <NextQuestionCountdown hasAnswered={hasAnswered} />
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
