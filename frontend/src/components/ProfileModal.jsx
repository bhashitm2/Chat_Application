import { useRef } from "react";
import { motion } from "framer-motion";
import { IoClose, IoCameraOutline, IoTrashOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";
import useUpdateProfile from "../hooks/useUpdateProfile";
import { resolveAvatar, onAvatarError } from "../utils/avatar";

// Own-profile card (design: gradient header, 88px ringed avatar, action tiles).
// Mount-only animation — consistent with the app's StrictMode-safe pattern.
const ProfileModal = ({ open, onClose }) => {
	const { authUser } = useAuthContext();
	const { onlineUsers } = useSocketContext();
	const { loading, updatePhoto, removePhoto } = useUpdateProfile();
	const fileInputRef = useRef(null);

	if (!open) return null;

	// only an uploaded photo counts (matches resolveAvatar) — a legacy avatar-service
	// URL still shows the default silhouette, so don't offer to "remove" it
	const hasPhoto = !!(authUser.profilePic && authUser.profilePic.startsWith("/uploads/"));
	const isOnline = onlineUsers.includes(authUser._id);

	const handleFile = async (e) => {
		const file = e.target.files?.[0];
		if (fileInputRef.current) fileInputRef.current.value = "";
		if (!file) return;
		if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
		if (file.size > 50 * 1024 * 1024) return toast.error("Image is too large (max 50MB)");
		await updatePhoto(file);
	};

	return (
		<motion.div
			className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px]'
			style={{ background: "var(--overlay)" }}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			onClick={onClose}
		>
			<motion.div
				className='w-[340px] rounded-[20px] bg-panel overflow-hidden shadow-frame'
				initial={{ opacity: 0, scale: 0.9, y: 14 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ type: "spring", stiffness: 400, damping: 28 }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* gradient header */}
				<div className='relative px-[22px] pt-[26px] pb-5 flex flex-col items-center gap-2.5' style={{ background: "var(--grad)" }}>
					<button
						onClick={onClose}
						className='absolute top-3.5 right-3.5 w-[30px] h-[30px] rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors'
						title='Close'
					>
						<IoClose size={16} />
					</button>
					<div className='relative'>
						<img
							src={resolveAvatar(authUser.profilePic)}
							onError={onAvatarError}
							alt={authUser.fullName}
							className='w-[88px] h-[88px] rounded-full object-cover'
							style={{ border: "3px solid rgba(255,255,255,.5)" }}
						/>
						{isOnline && (
							<span
								className='absolute right-1 bottom-1 w-[18px] h-[18px] rounded-full bg-online'
								style={{ border: "3px solid #fff" }}
							></span>
						)}
						{loading && (
							<div className='absolute inset-0 rounded-full bg-black/50 flex items-center justify-center'>
								<span className='loading loading-spinner text-white'></span>
							</div>
						)}
					</div>
					<div className='text-center text-white'>
						<div className='text-[19px] font-extrabold'>{authUser.fullName}</div>
						<div className='text-[13px] opacity-90'>online</div>
					</div>
				</div>

				{/* body */}
				<div className='px-[18px] py-4 flex flex-col gap-3.5'>
					<input type='file' ref={fileInputRef} className='hidden' accept='image/*' onChange={handleFile} />

					<div className='flex gap-2.5'>
						<button
							onClick={() => fileInputRef.current?.click()}
							disabled={loading}
							className='flex-1 p-2.5 rounded-xl bg-surface text-accent flex flex-col items-center gap-1.5 hover:scale-[1.03] transition-transform disabled:opacity-60 theme-fade'
						>
							<IoCameraOutline size={19} />
							<span className='text-[11.5px] font-bold'>{hasPhoto ? "Change Photo" : "Add Photo"}</span>
						</button>
						{hasPhoto && (
							<button
								onClick={removePhoto}
								disabled={loading}
								className='flex-1 p-2.5 rounded-xl bg-surface text-red-400 flex flex-col items-center gap-1.5 hover:scale-[1.03] transition-transform disabled:opacity-60 theme-fade'
							>
								<IoTrashOutline size={19} />
								<span className='text-[11.5px] font-bold'>Remove Photo</span>
							</button>
						)}
					</div>

					<div className='flex flex-col gap-3 pt-0.5'>
						<div>
							<div className='text-[11px] font-bold text-accent uppercase tracking-wider'>Username</div>
							<div className='text-sm text-ink mt-0.5'>@{authUser.username}</div>
						</div>
						<div className='h-px bg-line'></div>
						<div>
							<div className='text-[11px] font-bold text-accent uppercase tracking-wider'>Full name</div>
							<div className='text-sm text-ink mt-0.5'>{authUser.fullName}</div>
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ProfileModal;
