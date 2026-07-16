import { useState } from "react";
import { BsTrash } from "react-icons/bs";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import useDeleteMessage from "../../hooks/useDeleteMessage";
import ConfirmModal from "../ConfirmModal";
import VoiceNotePlayer from "./VoiceNotePlayer";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";

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

const Message = ({ message, lastOfGroup = true }) => {
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	const { deleteMessage, deleting } = useDeleteMessage();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const fromMe = message.senderId === authUser._id;
	const formattedTime = extractTime(message.createdAt);
	const shakeClass = message.shouldShake ? "shake" : "";
	const messageType = message.messageType || "text";
	const isAlbum = messageType === "image" && (message.fileUrls?.length || 0) > 1;
	const isMedia = messageType === "image" || messageType === "video";
	const jumbo = messageType === "text" && isJumboEmoji(message.message);

	const deleteButton = fromMe && (
		<button
			type='button'
			onClick={() => setConfirmOpen(true)}
			className='self-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-ink-faint hover:text-red-400 me-2'
			title='Delete message'
		>
			<BsTrash size={14} />
		</button>
	);

	const bubbleContent = (
		<>
			{isAlbum && <AlbumGrid urls={message.fileUrls} />}
			{!isAlbum && messageType === "image" && (
				<a href={message.fileUrl} target='_blank' rel='noreferrer'>
					<img src={message.fileUrl} alt='sent media' className='max-w-[260px] max-h-64 rounded-[10px] object-cover' />
				</a>
			)}
			{messageType === "video" && (
				<video src={message.fileUrl} controls className='max-w-[260px] max-h-64 rounded-[10px]' />
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
					{message.message}
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

	// ---- outgoing ----
	if (fromMe) {
		return (
			<div className='flex justify-end group'>
				{deleteButton}
				{jumbo ? (
					<div className={`text-[44px] leading-none ${shakeClass}`}>{message.message.trim()}</div>
				) : (
					<div
						className={`max-w-[76%] rounded-bubble bg-grad text-out-text shadow-bubble-out ${shakeClass} ${
							isMedia ? "p-1" : "px-3 py-2"
						}`}
					>
						{bubbleContent}
					</div>
				)}

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
			{jumbo ? (
				<div className={`text-[44px] leading-none ${shakeClass}`}>{message.message.trim()}</div>
			) : (
				<div
					className={`max-w-[78%] rounded-bubble bg-in-bubble text-in-text shadow-bubble theme-fade ${shakeClass} ${
						isMedia ? "p-1" : "px-3 py-2"
					}`}
				>
					{bubbleContent}
				</div>
			)}
		</div>
	);
};
export default Message;
