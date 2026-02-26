import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import BackButton from "@/components/BackButton";
import GroupChatInput from "./GroupChatInput";
import GroupMembersModal from "./GroupMembersModal";
import GroupSettingsModal from "./GroupSettingsModal";
import GroupChatMessages from "./GroupChatMessages";

export default async function GroupChatPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await requireAuth();
    const currentUserId = session.userId as number;
    const { id } = await params;
    const groupId = parseInt(id);

    if (isNaN(groupId)) {
        notFound();
    }

    // 1. Verify user is in group
    const isMemberRes: any = await query("SELECT * FROM group_members WHERE group_id = ? AND user_id = ?", [groupId, currentUserId]);
    if (isMemberRes.length === 0) {
        redirect("/groups");
    }

    // 1b. Fetch current user info for mentions
    const currentUserRes: any = await query("SELECT username FROM users WHERE id = ?", [currentUserId]);
    const currentUsername = currentUserRes.length > 0 ? currentUserRes[0].username : "";

    // 2. Fetch Group Info
    const groupRes: any = await query("SELECT id, name, created_by, profile_picture FROM discussion_groups WHERE id = ?", [groupId]);
    const groupInfo = groupRes[0];

    // 3. Fetch Group Members
    const members: any[] = (await query(`
        SELECT u.id, u.username
        FROM group_members gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = ?
        ORDER BY u.username ASC
    `, [groupId])) as any[];

    // 4. Fetch the user's friends to invite
    const friends: any[] = (await query(`
        SELECT u.id, u.username
        FROM friendships f
        JOIN users u ON (f.user_id_1 = u.id OR f.user_id_2 = u.id)
        WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND f.status = 'accepted' AND u.id != ?
    `, [currentUserId, currentUserId, currentUserId])) as any[];

    // Available friends to invite (friends who are not already in the group)
    const availableFriendsToInvite = friends.filter(friend => !members.find(m => m.id === friend.id));

    // 5. Fetch Messages
    const messagesRaw: any[] = (await query(`
        SELECT gm.id, gm.message_text, gm.message_type, gm.created_at, u.username, u.id as user_id, gm.related_answer_id,
               gm.reply_to_message_id, u.profile_picture,
               u_replied.username as replied_username,
               gm_replied.message_text as replied_text
        FROM group_messages gm
        JOIN users u ON gm.user_id = u.id
        LEFT JOIN group_messages gm_replied ON gm.reply_to_message_id = gm_replied.id
        LEFT JOIN users u_replied ON gm_replied.user_id = u_replied.id
        WHERE gm.group_id = ?
        ORDER BY gm.created_at ASC
    `, [groupId])) as any[];

    const messages = messagesRaw.map(msg => ({
        ...msg,
        profile_picture: msg.profile_picture ? msg.profile_picture.toString('base64') : null
    }));

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
            <header className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20 shadow-md">
                <div className="flex items-center gap-3">
                    <BackButton fallbackUrl="/groups" />
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {groupInfo.profile_picture ? (
                                <img src={`data:image/webp;base64,${groupInfo.profile_picture.toString('base64')}`} alt={groupInfo.name} className="w-full h-full object-cover" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-100 truncate max-w-[150px] sm:max-w-[200px] leading-tight">
                                {groupInfo.name}
                            </h1>
                            <span className="text-xs text-slate-500 font-semibold">{members.length} membres</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <GroupMembersModal
                        groupId={groupId}
                        groupName={groupInfo.name}
                        members={members}
                        availableFriends={availableFriendsToInvite}
                        isAdmin={groupInfo.created_by === currentUserId}
                        currentUserId={currentUserId}
                    />
                    <GroupSettingsModal
                        groupId={groupId}
                        currentName={groupInfo.name}
                        currentPicture={groupInfo.profile_picture ? `data:image/webp;base64,${groupInfo.profile_picture.toString('base64')}` : null}
                        isAdmin={groupInfo.created_by === currentUserId}
                    />
                </div>
            </header>

            <GroupChatMessages
                groupId={groupId}
                initialMessages={messages}
                currentUserId={currentUserId}
                currentUsername={currentUsername}
            />

            <GroupChatInput groupId={groupId} members={members.map(m => ({ id: m.id, username: m.username }))} />
        </div>
    );
}
