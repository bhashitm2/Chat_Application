import { useRef, useState } from "react";
import { BsSend, BsPaperclip, BsMic, BsTrash, BsX } from "react-icons/bs";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useSendMessage from "../../hooks/useSendMessage";
import useVoiceRecorder from "../../hooks/useVoiceRecorder";

const MAX_PHOTOS = 3;

const formatDuration = (seconds) => {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
};

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const [selectedFiles, setSelectedFiles] = useState([]); // [{ file, previewUrl }]
	const fileInputRef = useRef(null);

	const { loading, sendMessage } = useSendMessage();
	const { isRecording, duration, levels, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();

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
		if (!message && selectedFiles.length === 0) return;
		await sendMessage({ message, files: selectedFiles.map(({ file }) => file) });
		setMessage("");
		clearFiles();
	};

	const handleStopAndSendRecording = async () => {
		const result = await stopRecording();
		if (result) {
			await sendMessage({ files: [result.file], waveform: result.waveform, duration: result.duration });
		}
	};

	return (
		<form className='px-4 my-3' onSubmit={handleSubmit}>
			{/* attachment previews (mount animation only — exit animations are unreliable with StrictMode) */}
			{selectedFiles.length > 0 && !isRecording && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					className='overflow-hidden'
				>
					<div className='mb-2 p-2 rounded-xl bg-gray-700 border border-gray-600 flex items-center gap-2'>
						{selectedFiles.map(({ file, previewUrl }) => (
							<motion.div
								key={previewUrl}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								className='relative'
							>
									{file.type.startsWith("image/") ? (
										<img src={previewUrl} alt='preview' className='h-16 w-16 object-cover rounded-lg' />
									) : (
										<video src={previewUrl} className='h-16 w-24 object-cover rounded-lg' />
									)}
									<button
										type='button'
										onClick={() => removeFile(previewUrl)}
										className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 text-gray-300 hover:text-white flex items-center justify-center'
										title='Remove'
									>
										<BsX size={14} />
									</button>
								</motion.div>
							))}
							<span className='text-xs text-gray-400 ms-auto me-1'>
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
					className='w-full flex items-center gap-3 border text-sm rounded-full px-4 py-2.5 bg-gray-700 border-gray-600 text-white'
				>
					<span className='w-3 h-3 shrink-0 rounded-full bg-red-500 recording-pulse'></span>
					<span className='shrink-0 tabular-nums'>{formatDuration(duration)}</span>
					<div className='flex items-center gap-[2px] h-7 flex-1 overflow-hidden'>
						{levels.map((level, i) => (
							<div
								key={i}
								className='w-[3px] rounded-full bg-sky-400 transition-[height] duration-100 ease-out'
								style={{ height: `${Math.max(8, level)}%` }}
							/>
						))}
					</div>
					<motion.button
						type='button'
						whileTap={{ scale: 0.85 }}
						onClick={cancelRecording}
						className='shrink-0 text-red-400 hover:text-red-300'
						title='Discard'
					>
						<BsTrash size={18} />
					</motion.button>
					<motion.button
						type='button'
						whileTap={{ scale: 0.85 }}
						onClick={handleStopAndSendRecording}
						className='shrink-0 text-sky-400 hover:text-sky-300'
						title='Send voice note'
						disabled={loading}
					>
						{loading ? <div className='loading loading-spinner loading-sm'></div> : <BsSend size={18} />}
					</motion.button>
				</motion.div>
			) : (
				<div className='w-full relative flex items-center'>
					<input
						type='file'
						ref={fileInputRef}
						className='hidden'
						accept='image/*,video/*'
						multiple
						onChange={handleFileChange}
					/>
					<motion.button
						type='button'
						whileTap={{ scale: 0.85 }}
						onClick={() => fileInputRef.current?.click()}
						className='absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400 hover:text-white transition-colors'
						title={`Attach up to ${MAX_PHOTOS} photos or a video`}
					>
						<BsPaperclip size={18} />
					</motion.button>
					<input
						type='text'
						className='border text-sm rounded-full block w-full p-2.5 ps-10 pe-16 bg-gray-700 border-gray-600 text-white transition-shadow focus:shadow-lg focus:outline-none focus:border-gray-500'
						placeholder='Send a message'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<motion.button
						type='button'
						whileTap={{ scale: 0.85 }}
						onClick={startRecording}
						className='absolute inset-y-0 end-8 flex items-center pe-1 text-gray-400 hover:text-white transition-colors'
						title='Record a voice note'
					>
						<BsMic size={18} />
					</motion.button>
					<motion.button
						type='submit'
						whileTap={{ scale: 0.85 }}
						className='absolute inset-y-0 end-0 flex items-center pe-3 text-gray-300 hover:text-white transition-colors'
						title='Send'
					>
						{loading ? <div className='loading loading-spinner loading-sm'></div> : <BsSend />}
					</motion.button>
				</div>
			)}
		</form>
	);
};
export default MessageInput;
