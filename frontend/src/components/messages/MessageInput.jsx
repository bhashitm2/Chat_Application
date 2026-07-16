import { useRef, useState } from "react";
import { BsTrash, BsX, BsEmojiSmile, BsPaperclip, BsMic } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useSendMessage from "../../hooks/useSendMessage";
import useVoiceRecorder from "../../hooks/useVoiceRecorder";
import { useTypingEmitter } from "../../hooks/useTyping";
import EmojiPicker from "./EmojiPicker";

const MAX_PHOTOS = 3;

const formatDuration = (seconds) => {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
};

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const [selectedFiles, setSelectedFiles] = useState([]); // [{ file, previewUrl }]
	const [emojiOpen, setEmojiOpen] = useState(false);
	const fileInputRef = useRef(null);
	const textInputRef = useRef(null);

	const { loading, sendMessage } = useSendMessage();
	const { isRecording, duration, levels, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
	const { notifyTyping, stopTyping } = useTypingEmitter();

	const hasContent = message.trim().length > 0 || selectedFiles.length > 0;

	const clearFiles = () => {
		selectedFiles.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
		setSelectedFiles([]);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const removeFile = (previewUrl) => {
		// side effects stay outside the state updater (StrictMode double-invokes it)
		URL.revokeObjectURL(previewUrl);
		setSelectedFiles((prev) => prev.filter((f) => f.previewUrl !== previewUrl));
	};

	const handleFileChange = (e) => {
		const picked = Array.from(e.target.files || []);
		if (picked.length === 0) return;

		const invalid = picked.find((f) => !f.type.startsWith("image/") && !f.type.startsWith("video/"));
		if (invalid) {
			toast.error("Only images and videos can be attached");
			return;
		}
		const tooBig = picked.find((f) => f.size > 50 * 1024 * 1024);
		if (tooBig) {
			toast.error("File is too large (max 50MB)");
			return;
		}

		const hasVideo = picked.some((f) => f.type.startsWith("video/"));
		if (hasVideo && picked.length > 1) {
			toast.error("Videos can only be sent one at a time");
			return;
		}

		const existing = selectedFiles.length;
		if (hasVideo && existing > 0) {
			toast.error("Videos can only be sent one at a time");
			return;
		}
		if (existing > 0 && selectedFiles.some(({ file }) => file.type.startsWith("video/"))) {
			toast.error("Videos can only be sent one at a time");
			return;
		}
		if (existing + picked.length > MAX_PHOTOS) {
			toast.error(`You can send at most ${MAX_PHOTOS} photos at a time`);
			return;
		}

		const newEntries = picked.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
		setSelectedFiles((prev) => [...prev, ...newEntries]);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!hasContent) return;
		stopTyping();
		setEmojiOpen(false);
		await sendMessage({ message: message.trim(), files: selectedFiles.map(({ file }) => file) });
		setMessage("");
		clearFiles();
	};

	const handleStopAndSendRecording = async () => {
		const result = await stopRecording();
		if (result) {
			await sendMessage({ files: [result.file], waveform: result.waveform, duration: result.duration });
		}
	};

	// insert at the caret so emoji land where the user is typing
	const insertEmoji = (emoji) => {
		const input = textInputRef.current;
		const start = input?.selectionStart ?? message.length;
		const end = input?.selectionEnd ?? message.length;
		const next = message.slice(0, start) + emoji + message.slice(end);
		setMessage(next);
		notifyTyping();
		requestAnimationFrame(() => {
			input?.focus();
			const caret = start + emoji.length;
			input?.setSelectionRange(caret, caret);
		});
	};

	return (
		<form
			className='relative px-[18px] py-3 bg-panel border-t border-line theme-fade z-10'
			onSubmit={handleSubmit}
		>
			{emojiOpen && !isRecording && <EmojiPicker onPick={insertEmoji} onClose={() => setEmojiOpen(false)} />}

			{/* attachment previews (mount animation only — exit animations are unreliable with StrictMode) */}
			{selectedFiles.length > 0 && !isRecording && (
				<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className='overflow-hidden'>
					<div className='mb-2.5 p-2 rounded-card bg-surface flex items-center gap-2 theme-fade'>
						{selectedFiles.map(({ file, previewUrl }) => (
							<motion.div
								key={previewUrl}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								className='relative'
							>
								{file.type.startsWith("image/") ? (
									<img src={previewUrl} alt='preview' className='h-16 w-16 object-cover rounded-[10px]' />
								) : (
									<video src={previewUrl} className='h-16 w-24 object-cover rounded-[10px]' />
								)}
								<button
									type='button'
									onClick={() => removeFile(previewUrl)}
									className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink text-panel flex items-center justify-center'
									title='Remove'
								>
									<BsX size={14} />
								</button>
							</motion.div>
						))}
						<span className='text-xs text-ink-faint ms-auto me-1'>
							{selectedFiles.length}/{MAX_PHOTOS}
						</span>
					</div>
				</motion.div>
			)}

			{isRecording ? (
				/* recording bar with live waveform */
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					className='w-full flex items-center gap-3 min-h-[46px] rounded-composer px-4 py-2 bg-surface text-ink theme-fade'
				>
					<span className='w-3 h-3 shrink-0 rounded-full bg-red-500 recording-pulse'></span>
					<span className='shrink-0 tabular-nums text-sm font-semibold'>{formatDuration(duration)}</span>
					<div className='flex items-center gap-[2px] h-7 flex-1 overflow-hidden'>
						{levels.map((level, i) => (
							<div
								key={i}
								className='w-[3px] rounded-[3px] bg-accent transition-[height] duration-100 ease-out'
								style={{ height: `${Math.max(8, level)}%` }}
							/>
						))}
					</div>
					<motion.button
						type='button'
						whileTap={{ scale: 0.85 }}
						onClick={cancelRecording}
						className='shrink-0 text-red-400 hover:text-red-500'
						title='Discard'
					>
						<BsTrash size={18} />
					</motion.button>
					<motion.button
						type='button'
						whileHover={{ scale: 1.08 }}
						whileTap={{ scale: 0.9 }}
						onClick={handleStopAndSendRecording}
						className='w-[38px] h-[38px] shrink-0 rounded-full bg-grad glow-send text-white flex items-center justify-center'
						title='Send voice note'
						disabled={loading}
					>
						{loading ? <span className='loading loading-spinner loading-sm'></span> : <IoSend size={16} />}
					</motion.button>
				</motion.div>
			) : (
				<div className='flex items-end gap-2.5'>
					<input type='file' ref={fileInputRef} className='hidden' accept='image/*,video/*' multiple onChange={handleFileChange} />

					{/* rounded field: emoji · text · paperclip */}
					<div className='flex-1 flex items-center gap-2 min-h-[46px] ps-3 pe-2 rounded-composer bg-surface theme-fade'>
						<motion.button
							type='button'
							whileHover={{ scale: 1.15 }}
							whileTap={{ scale: 0.9 }}
							transition={{ type: "spring", stiffness: 500, damping: 20 }}
							onClick={() => setEmojiOpen((o) => !o)}
							className={`w-7 h-7 flex-none flex items-center justify-center ${emojiOpen ? "text-accent" : "text-icon-dim"}`}
							title='Emoji'
						>
							<BsEmojiSmile size={20} />
						</motion.button>
						<input
							ref={textInputRef}
							type='text'
							className='flex-1 min-w-0 bg-transparent text-[14.5px] text-ink placeholder:text-ink-faint focus:outline-none py-2'
							placeholder='Message'
							value={message}
							onChange={(e) => {
								setMessage(e.target.value);
								notifyTyping();
							}}
						/>
						<motion.button
							type='button'
							whileHover={{ scale: 1.15, rotate: -12 }}
							whileTap={{ scale: 0.9 }}
							transition={{ type: "spring", stiffness: 500, damping: 20 }}
							onClick={() => fileInputRef.current?.click()}
							className='w-7 h-7 flex-none flex items-center justify-center text-icon-dim'
							title={`Attach up to ${MAX_PHOTOS} photos or a video`}
						>
							<BsPaperclip size={20} />
						</motion.button>
					</div>

					{/* send ↔ mic morph */}
					{hasContent ? (
						<motion.button
							key='send'
							type='submit'
							initial={{ scale: 0.6, rotate: -30 }}
							animate={{ scale: 1, rotate: 0 }}
							whileHover={{ scale: 1.08, rotate: 6 }}
							whileTap={{ scale: 0.9 }}
							transition={{ type: "spring", stiffness: 500, damping: 22 }}
							className='w-[46px] h-[46px] flex-none rounded-full bg-grad glow-send text-white flex items-center justify-center'
							title='Send'
							disabled={loading}
						>
							{loading ? <span className='loading loading-spinner loading-sm'></span> : <IoSend size={19} className='-me-0.5' />}
						</motion.button>
					) : (
						<motion.button
							key='mic'
							type='button'
							initial={{ scale: 0.6 }}
							animate={{ scale: 1 }}
							whileHover={{ scale: 1.08 }}
							whileTap={{ scale: 0.9 }}
							transition={{ type: "spring", stiffness: 500, damping: 22 }}
							onClick={startRecording}
							className='w-[46px] h-[46px] flex-none rounded-full bg-grad glow-send text-white flex items-center justify-center'
							title='Record a voice note'
						>
							<BsMic size={20} />
						</motion.button>
					)}
				</div>
			)}
		</form>
	);
};
export default MessageInput;
