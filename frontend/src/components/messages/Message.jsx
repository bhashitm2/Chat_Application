import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BsTrash, BsReply, BsEmojiSmile } from "react-icons/bs";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import useDeleteMessage from "../../hooks/useDeleteMessage";
import useReactToMessage from "../../hooks/useReactToMessage";
import ConfirmModal from "../ConfirmModal";
import VoiceNotePlayer from "./VoiceNotePlayer";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";
import { messageSnippet } from "../../utils/messageSnippet";
import EmojiText from "../EmojiText";

const QUICK_REACTIONS = ["❤️", "👍", "👎", "😂", "😮", "😢", "🔥"];

// read receipts (design: two 1.8px stroke polylines, 16×11)
const Checks = ({ read }) => (
	<svg width='16' height='11' viewBox='0 0 16 12' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
		<path d='M1 6.2 4.4 9.6 9.9 2.5' />
		{read && <path d='M6 9.2 6.7 9.9 12.4 2.4' />}
	</svg>
);

// emoji-only messages (max 3 glyphs) render jumbo with no bubble
const isJumboEmoji = (text) => {
	if (!text) return false;
	const trimmed = text.trim();
	if (!trimmed || trimmed.length > 16) return false;
	const stripped = trimmed.replace(/\p{Extended_Pictographic}|\p{Emoji_Modifier}|\u{FE0F}|\u{200D}|\u{20E3}|\s/gu, "");
	if (stripped) return false;
	try {
		return [...new Intl.Segmenter().segment(trimmed)].length <= 3;
	} catch {
		return trimmed.length <= 6;
	}
};

const AlbumGrid = ({ urls }) => {
	if (urls.length === 2) {
		return (
			<div className='grid grid-cols-2 gap-[3px] w-[260px]'>
				{urls.map((url) => (
					<a key={url} href={url} target='_blank' rel='noreferrer'>
						<img src={url} alt='sent media' className='w-full h-[130px] rounded-[10px] object-cover' />
					</a>
				))}
			</div>
		);
	}
	// 3 photos: one large on the left, two stacked on the right (Telegram style)
	return (
		<div className='grid grid-cols-2 grid-rows-2 gap-[3px] w-[260px] h-[172px]'>
			<a href={urls[0]} target='_blank' rel='noreferrer' className='row-span-2'>
				<img src={urls[0]} alt='sent media' className='w-full h-full rounded-[10px] object-cover' />
			</a>
			{urls.slice(1).map((url) => (
				<a key={url} href={url} target='_blank' rel='noreferrer' className='min-h-0'>
					<img src={url} alt='sent media' className='w-full h-full rounded-[10px] object-cover' />
				</a>
			))}
		</div>
	);
};

const TimeStamp = ({ fromMe, message, formattedTime, onMedia = false }) => (
	<span
		className={`inline-flex items-center gap-[3px] float-right ms-2.5 mt-1.5 -mb-0.5 text-[11px] leading-none ${
			onMedia ? "" : fromMe ? "text-time-out" : "text-time-in"
		}`}
	>
		{formattedTime}
		{fromMe && (
			<span className='text-white flex'>
				<Checks read={!!message.read} />
			</span>
		)}
	</span>
);

// quoted message shown at the top of a reply bubble; click scrolls to the original
const QuotedMessage = ({ replyTo, fromMe, peerName, myId }) => {
	if (!replyTo) return null;
	const name = replyTo.senderId === myId ? "You" : peerName;

	const jumpToOriginal = () => {
		const el = document.getElementById(`msg-${replyTo._id}`);
		if (!el) return;
		el.scrollIntoView({ behavior: "smooth", block: "center" });
		el.classList.remove("msg-flash");
		void el.offsetWidth; // restart the animation if it already ran
		el.classList.add("msg-flash");
	};

	return (
		<button
			type='button'
			onClick={jumpToOriginal}
			className={`block w-full min-w-[140px] text-left mb-1 px-2.5 py-1.5 rounded-[9px] border-s-[3px] ${
				fromMe ? "bg-white/15 border-white/70" : "bg-surface border-accent theme-fade"
			}`}
		>
			<span className={`block text-[12px] font-bold ${fromMe ? "text-white" : "text-accent"}`}>{name}</span>
			<EmojiText className={`block text-[12.5px] truncate ${fromMe ? "text-white/85" : "text-ink-dim"}`}>
				{messageSnippet(replyTo)}
			</EmojiText>
		</button>
	);
};

// Telegram-style quick reaction row, anchored above the bubble
const QuickReactions = ({ fromMe, onPick, onClose }) => {
	const ref = useRef(null);

	useEffect(() => {
		const onDown = (e) => {
			if (ref.current && !ref.current.contains(e.target)) onClose();
		};
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [onClose]);

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, scale: 0.8, y: 6 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 500, damping: 28 }}
			style={{ transformOrigin: fromMe ? "bottom right" : "bottom left" }}
			className={`absolute bottom-full mb-1.5 ${fromMe ? "right-0" : "left-0"} z-20 flex items-center gap-0.5 px-1.5 py-1 rounded-full bg-panel border border-line shadow-frame`}
		>
			{QUICK_REACTIONS.map((emoji) => (
				<motion.button
					key={emoji}
					type='button'
					whileHover={{ scale: 1.3, y: -2 }}
					whileTap={{ scale: 0.9 }}
					transition={{ type: "spring", stiffness: 500, damping: 18 }}
					onClick={() => onPick(emoji)}
					className='w-7 h-7 rounded-full flex items-center justify-center text-lg hover:bg-surface'
					title='React'
				>
					<EmojiText>{emoji}</EmojiText>
				</motion.button>
			))}
		</motion.div>
	);
};

// grouped reaction pills under the bubble; clicking toggles your own reaction
const ReactionChips = ({ reactions, myId, fromMe, onToggle }) => {
	if (!reactions?.length) return null;

	const groups = [];
	for (const r of reactions) {
		let group = groups.find((g) => g.emoji === r.emoji);
		if (!group) {
			group = { emoji: r.emoji, count: 0, mine: false };
			groups.push(group);
		}
		group.count += 1;
		if (r.userId === myId) group.mine = true;
	}

	return (
		<div className={`flex flex-wrap gap-1 mt-1 ${fromMe ? "justify-end" : ""}`}>
			{groups.map((group) => (
				<motion.button
					key={group.emoji}
					type='button'
					initial={{ scale: 0.6 }}
					animate={{ scale: 1 }}
					whileTap={{ scale: 0.85 }}
					transition={{ type: "spring", stiffness: 500, damping: 22 }}
					onClick={() => onToggle(group.emoji)}
					className={`flex items-center gap-1 h-[22px] px-2 rounded-full text-[12px] font-bold border theme-fade ${
						group.mine ? "bg-grad text-white border-transparent shadow-row-active" : "bg-panel text-ink-dim border-line"
					}`}
					title={group.mine ? "Remove reaction" : "React the same"}
				>
					<EmojiText className='leading-none text-[13px]'>{group.emoji}</EmojiText>
					{group.count > 1 && <span>{group.count}</span>}
				</motion.button>
			))}
		</div>
	);
};

const HoverAction = ({ title, danger = false, onClick, children }) => (
	<button
		type='button'
		onClick={onClick}
		className={`text-ink-faint transition-colors ${danger ? "hover:text-red-400" : "hover:text-accent"}`}
		title={title}
	>
		{children}
	</button>
);

const Message = ({ message, lastOfGroup = true }) => {
	const { authUser } = useAuthContext();
	const { selectedConversation, setReplyingTo } = useConversation();
	const { deleteMessage, deleting } = useDeleteMessage();
	const { reactToMessage } = useReactToMessage();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [reactOpen, setReactOpen] = useState(false);

	const fromMe = message.senderId === authUser._id;
	const formattedTime = extractTime(message.createdAt);
	const shakeClass = message.shouldShake ? "shake" : "";
	const messageType = message.messageType || "text";
	const isAlbum = messageType === "image" && (message.fileUrls?.length || 0) > 1;
	const isMedia = messageType === "image" || messageType === "video" || messageType === "gif";
	const jumbo = messageType === "text" && !message.replyTo && isJumboEmoji(message.message);

	const pickReaction = (emoji) => {
		reactToMessage(message._id, emoji);
		setReactOpen(false);
	};

	const hoverActions = (
		<div
			className={`self-center flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
				fromMe ? "me-2.5" : "ms-2.5"
			}`}
		>
			{fromMe && (
				<HoverAction title='Delete message' danger onClick={() => setConfirmOpen(true)}>
					<BsTrash size={14} />
				</HoverAction>
			)}
			<HoverAction title='React' onClick={() => setReactOpen((o) => !o)}>
				<BsEmojiSmile size={14} />
			</HoverAction>
			<HoverAction title='Reply' onClick={() => setReplyingTo(message)}>
				<BsReply size={17} />
			</HoverAction>
		</div>
	);

	const bubbleContent = (
		<>
			<QuotedMessage replyTo={message.replyTo} fromMe={fromMe} peerName={selectedConversation?.fullName} myId={authUser._id} />
			{isAlbum && <AlbumGrid urls={message.fileUrls} />}
			{!isAlbum && messageType === "image" && (
				<a href={message.fileUrl} target='_blank' rel='noreferrer'>
					<img src={message.fileUrl} alt='sent media' className='max-w-[260px] max-h-64 rounded-[10px] object-cover' />
				</a>
			)}
			{messageType === "video" && (
				<video src={message.fileUrl} controls className='max-w-[260px] max-h-64 rounded-[10px]' />
			)}
			{messageType === "gif" && (
				<img src={message.fileUrl} alt='GIF' className='max-w-[240px] max-h-64 rounded-[10px] object-cover' />
			)}
			{messageType === "audio" && (
				<VoiceNotePlayer
					src={message.fileUrl}
					waveform={message.waveform || []}
					duration={message.duration || 0}
					variant={fromMe ? "out" : "in"}
				/>
			)}
			{message.message && (
				<p className={`text-[14.5px] leading-[1.4] ${isMedia ? "px-1 pt-1.5 pb-0.5" : ""}`}>
					<EmojiText>{message.message}</EmojiText>
					<TimeStamp fromMe={fromMe} message={message} formattedTime={formattedTime} />
				</p>
			)}
			{!message.message && (
				<div className={`${isMedia ? "px-1" : ""} leading-none`}>
					<TimeStamp fromMe={fromMe} message={message} formattedTime={formattedTime} />
				</div>
			)}
		</>
	);

	const reactionChips = (
		<ReactionChips reactions={message.reactions} myId={authUser._id} fromMe={fromMe} onToggle={pickReaction} />
	);

	// ---- outgoing ----
	if (fromMe) {
		return (
			<div className='flex justify-end group'>
				{hoverActions}
				<div className='relative flex flex-col items-end max-w-[76%]'>
					{reactOpen && <QuickReactions fromMe onPick={pickReaction} onClose={() => setReactOpen(false)} />}
					{jumbo ? (
						<EmojiText as='div' className={`text-[44px] leading-none ${shakeClass}`}>
							{message.message.trim()}
						</EmojiText>
					) : (
						<div
							className={`rounded-bubble bg-grad text-out-text shadow-bubble-out ${shakeClass} ${
								isMedia ? "p-1" : "px-3 py-2"
							}`}
						>
							{bubbleContent}
						</div>
					)}
					{reactionChips}
				</div>

				<ConfirmModal
					open={confirmOpen}
					title='Delete message?'
					description='This message will be deleted for both you and the recipient.'
					loading={deleting}
					onCancel={() => setConfirmOpen(false)}
					onConfirm={async () => {
						await deleteMessage(message._id);
						setConfirmOpen(false);
					}}
				/>
			</div>
		);
	}

	// ---- incoming ----
	return (
		<div className='flex items-end gap-[9px] group'>
			{lastOfGroup ? (
				<img
					src={resolveAvatar(selectedConversation?.profilePic)}
					onError={onAvatarError}
					alt='avatar'
					className='w-8 h-8 rounded-full object-cover flex-none'
				/>
			) : (
				<div className='w-8 flex-none'></div>
			)}
			<div className='relative flex flex-col items-start max-w-[78%]'>
				{reactOpen && <QuickReactions fromMe={false} onPick={pickReaction} onClose={() => setReactOpen(false)} />}
				{jumbo ? (
					<EmojiText as='div' className={`text-[44px] leading-none ${shakeClass}`}>
						{message.message.trim()}
					</EmojiText>
				) : (
					<div
						className={`rounded-bubble bg-in-bubble text-in-text shadow-bubble theme-fade ${shakeClass} ${
							isMedia ? "p-1" : "px-3 py-2"
						}`}
					>
						{bubbleContent}
					</div>
				)}
				{reactionChips}
			</div>
			{hoverActions}
		</div>
	);
};
export default Message;
