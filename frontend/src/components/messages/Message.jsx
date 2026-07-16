import { useState } from "react";
import { BsTrash } from "react-icons/bs";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import useDeleteMessage from "../../hooks/useDeleteMessage";
import ConfirmModal from "../ConfirmModal";
import VoiceNotePlayer from "./VoiceNotePlayer";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";

const AlbumGrid = ({ urls }) => {
	if (urls.length === 2) {
		return (
			<div className='grid grid-cols-2 gap-1 max-w-[260px]'>
				{urls.map((url) => (
					<a key={url} href={url} target='_blank' rel='noreferrer'>
						<img src={url} alt='sent media' className='w-full h-32 rounded-lg object-cover' />
					</a>
				))}
			</div>
		);
	}
	// 3 photos: one large on the left, two stacked on the right (Telegram style)
	return (
		<div className='grid grid-cols-2 grid-rows-2 gap-1 max-w-[260px]'>
			<a href={urls[0]} target='_blank' rel='noreferrer' className='row-span-2'>
				<img src={urls[0]} alt='sent media' className='w-full h-full min-h-[10rem] rounded-lg object-cover' />
			</a>
			{urls.slice(1).map((url) => (
				<a key={url} href={url} target='_blank' rel='noreferrer'>
					<img src={url} alt='sent media' className='w-full h-[4.85rem] rounded-lg object-cover' />
				</a>
			))}
		</div>
	);
};

const Message = ({ message }) => {
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	const { deleteMessage, deleting } = useDeleteMessage();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const fromMe = message.senderId === authUser._id;
	const formattedTime = extractTime(message.createdAt);
	const chatClassName = fromMe ? "chat-end" : "chat-start";
	const profilePic = fromMe ? authUser.profilePic : selectedConversation?.profilePic;
	const bubbleBgColor = fromMe ? "bg-blue-500" : "";

	const shakeClass = message.shouldShake ? "shake" : "";
	const messageType = message.messageType || "text";
	const isAlbum = messageType === "image" && (message.fileUrls?.length || 0) > 1;

	return (
		<div className={`chat ${chatClassName} group`}>
			<div className='chat-image avatar'>
				<div className='w-10 rounded-full'>
					<img alt='Tailwind CSS chat bubble component' src={resolveAvatar(profilePic)} onError={onAvatarError} />
				</div>
			</div>
			<div className='relative flex items-center gap-2'>
				{fromMe && (
					<button
						type='button'
						onClick={() => setConfirmOpen(true)}
						className='opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-gray-400 hover:text-red-400 order-first'
						title='Delete message'
					>
						<BsTrash size={14} />
					</button>
				)}
				<div className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} pb-2`}>
					{isAlbum && <AlbumGrid urls={message.fileUrls} />}
					{!isAlbum && messageType === "image" && (
						<a href={message.fileUrl} target='_blank' rel='noreferrer'>
							<img src={message.fileUrl} alt='sent media' className='max-w-[220px] max-h-64 rounded-lg object-cover' />
						</a>
					)}
					{messageType === "video" && (
						<video src={message.fileUrl} controls className='max-w-[260px] max-h-64 rounded-lg' />
					)}
					{messageType === "audio" && (
						<VoiceNotePlayer src={message.fileUrl} waveform={message.waveform || []} duration={message.duration || 0} />
					)}
					{message.message && <p className={messageType !== "text" ? "mt-1" : ""}>{message.message}</p>}
				</div>
			</div>
			<div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>{formattedTime}</div>

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
};
export default Message;
