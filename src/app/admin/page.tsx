import { query } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminForm from "@/components/AdminForm";
import DeleteQuestionForm from "@/components/DeleteQuestionForm";
import BackButton from "@/components/BackButton";

export default async function AdminPanel() {
    const session = await requireAuth();
    const userId = session.userId as number;

    const userResult: any = await query("SELECT is_admin FROM users WHERE id = ?", [userId]);
    const user = userResult[0];

    if (!user || !user.is_admin) {
        redirect("/");
    }

    // Fetch all existing questions
    const questions: any = await query("SELECT id, question_text, option_1, option_2, option_3, option_4, is_active FROM daily_questions ORDER BY created_at DESC");

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
            <header className="flex justify-between items-center p-4 border-b border-indigo-900 bg-slate-900 sticky top-0 z-20">
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Panel Admin HQ
                </h1>
                <BackButton fallbackUrl="/" />
            </header>

            <main className="max-w-md mx-auto p-4 gap-6 flex flex-col mt-4">
                <section className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                    <h2 className="text-xl font-bold mb-4 z-10 relative flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Banque de Quêtes
                    </h2>
                    <AdminForm />
                </section>

                <section className="flex flex-col gap-3 mt-4">
                    <h3 className="text-lg font-bold px-1 flex justify-between items-center text-slate-200">
                        Questions disponibles
                        <span className="bg-indigo-600 px-2 py-0.5 rounded-md text-xs">{questions.length} au total</span>
                    </h3>

                    <div className="flex flex-col gap-3">
                        {questions.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-4 bg-slate-900 rounded-xl">Aucune question dans la banque.</p>
                        ) : (
                            questions.map((q: any) => (
                                <div key={q.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3 shadow hover:bg-slate-800/80 transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex flex-col flex-1 gap-2">
                                            <span className="font-semibold text-slate-100 text-sm leading-snug">{q.question_text}</span>

                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {[q.option_1, q.option_2, q.option_3, q.option_4].map((opt, i) =>
                                                    opt ? (
                                                        <span key={i} className="text-[10px] bg-slate-800 px-2 py-1 rounded-md text-slate-300 border border-slate-700">
                                                            {opt}
                                                        </span>
                                                    ) : null
                                                )}
                                            </div>
                                        </div>
                                        <DeleteQuestionForm questionId={q.id} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
