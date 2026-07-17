import { BsMicFill, BsCheck2All } from "react-icons/bs";
import { useSocketContext } from "../../context/SocketContext";
import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../zustand/useConversation";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";
import { extractListTime } from "../../utils/extractTime";
import EmojiText from "../EmojiText";

const formatDuration = (seconds = 0) => {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
};

const Preview = ({ conversation, fromMe, isSelected }) => {
	const last = conversation.lastMessage;
	const subColor = isSelected ? "text-white/90" : "text-ink-dim";

	if (!last) return <EmojiText className={`text-[13px] ${subColor} truncate`}>Say hi 👋</EmojiText>;

	if (last.messageType === "audio") {
		return (
			<span className={`flex items-center gap-1.5 text-[13px] ${subColor} min-w-0`}>
				<BsMicFill size={12} className='shrink-0' />
				<span className='truncate'>Voice message · {formatDuration(last.duration)}</span>
			</span>
		);
	}

	const label =
		last.messageType === "image"
			? `📷 Photo${last.message ? ` · ${last.message}` : ""}`
			: last.messageType === "video"
			? `🎬 Video${last.message ? ` · ${last.message}` : ""}`
			: last.messageType === "gif"
			? "GIF"
			: last.message;

	return (
		<span className={`flex items-center gap-1 text-[13px] ${subColor} min-w-0`}>
			{fromMe && (
				<BsCheck2All size={14} className={`shrink-0 ${isSelected ? "text-white" : "text-accent"}`} />
			)}
			<EmojiText className='truncate'>{label}</EmojiText>
		</span>
	);
};

const Conversation = ({ conversation }) => {
	const { selectedConversation, setSelectedConversation, typingUsers } = useConversation();
	const { authUser } = useAuthContext();
	const { onlineUsers } = useSocketContext();

	const isSelected = selectedConversation?._id === conversation._id;
	const isOnline = onlineUsers.includes(conversation._id);
	const isTyping = !!typingUsers[conversation._id];
	const fromMe = conversation.lastMessage?.senderId === authUser._id;
	const unread = conversation.unreadCount || 0;

	return (
		<div
			className={`flex items-center gap-[11px] p-2.5 rounded-row cursor-pointer transition-transform duration-150 ${
				isSelected ? "bg-grad shadow-row-active" : "hover:translate-x-[2px] hover:bg-surface theme-fade"
			}`}
			onClick={() => setSelectedConversation(conversation)}
		>
			<div className='relative flex-none'>
				<img
					src={resolveAvatar(conversation.profilePic)}
					onError={onAvatarError}
					alt={conversation.fullName}
					className='w-[52px] h-[52px] rounded-full object-cover'
				/>
				{isOnline && (
					<span
						className='absolute right-[1px] bottom-[1px] w-[13px] h-[13px] rounded-full bg-online'
						style={{ border: `2.5px solid ${isSelected ? "#ffffff" : "var(--panel)"}` }}
					></span>
				)}
			</div>

			<div className='flex-1 min-w-0'>
				<div className='flex items-center justify-between gap-2'>
					<EmojiText className={`font-bold text-[14.5px] truncate ${isSelected ? "text-white" : "text-ink"}`}>
						{conversation.fullName}
					</EmojiText>
					<span className={`text-[11.5px] flex-none ${isSelected ? "text-white/85" : "text-ink-faint"}`}>
						{extractListTime(conversation.lastMessage?.createdAt)}
					</span>
				</div>
				<div className='flex items-center justify-between gap-2 mt-[3px]'>
					{isTyping ? (
						<span className={`text-[13px] italic ${isSelected ? "text-white/90" : "text-accent"}`}>typing…</span>
					) : (
						<Preview conversation={conversation} fromMe={fromMe} isSelected={isSelected} />
					)}
					{unread > 0 && (
						<span
							className={`min-w-[19px] h-[19px] px-[5px] rounded-[10px] text-[11px] font-extrabold text-white flex items-center justify-center flex-none ${
								isSelected ? "bg-white/25" : "bg-grad"
							}`}
						>
							{unread}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
export default Conversation;
