import { useRef } from "react";
import { motion } from "framer-motion";
import { IoClose, IoCameraOutline, IoTrashOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import useUpdateProfile from "../hooks/useUpdateProfile";
import { resolveAvatar, onAvatarError } from "../utils/avatar";

// Mount-only animation (no exit) — consistent with the app's StrictMode-safe pattern.
const ProfileModal = ({ open, onClose }) => {
	const { authUser } = useAuthContext();
	const { loading, updatePhoto, removePhoto } = useUpdateProfile();
	const fileInputRef = useRef(null);

	if (!open) return null;

	// only an uploaded photo counts (matches resolveAvatar) — a legacy avatar-service
	// URL still shows the default silhouette, so don't offer to "remove" it
	const hasPhoto = !!(authUser.profilePic && authUser.profilePic.startsWith("/uploads/"));

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
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			onClick={onClose}
		>
			<motion.div
				className='bg-gray-800 rounded-2xl p-6 mx-4 w-full max-w-sm shadow-xl'
				initial={{ opacity: 0, scale: 0.9, y: 12 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ type: "spring", stiffness: 400, damping: 30 }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className='flex items-center justify-between mb-5'>
					<h3 className='text-white text-lg font-semibold'>Profile</h3>
					<button onClick={onClose} className='text-gray-400 hover:text-white' title='Close'>
						<IoClose size={22} />
					</button>
				</div>

				<div className='flex flex-col items-center gap-4'>
					<div className='relative'>
						<img
							src={resolveAvatar(authUser.profilePic)}
							onError={onAvatarError}
							alt={authUser.fullName}
							className='w-32 h-32 rounded-full object-cover border-2 border-gray-600'
						/>
						{loading && (
							<div className='absolute inset-0 rounded-full bg-black/50 flex items-center justify-center'>
								<span className='loading loading-spinner text-white'></span>
							</div>
						)}
					</div>

					<div className='text-center'>
						<p className='text-white text-lg font-semibold'>{authUser.fullName}</p>
						<p className='text-gray-400 text-sm'>@{authUser.username}</p>
					</div>

					<input
						type='file'
						ref={fileInputRef}
						className='hidden'
						accept='image/*'
						onChange={handleFile}
					/>

					<div className='flex flex-col w-full gap-2 mt-1'>
						<motion.button
							whileTap={{ scale: 0.97 }}
							onClick={() => fileInputRef.current?.click()}
							disabled={loading}
							className='flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium disabled:opacity-60'
						>
							<IoCameraOutline size={18} />
							{hasPhoto ? "Change Photo" : "Add Photo"}
						</motion.button>
						{hasPhoto && (
							<motion.button
								whileTap={{ scale: 0.97 }}
								onClick={removePhoto}
								disabled={loading}
								className='flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-700 hover:bg-red-500/80 text-gray-200 text-sm font-medium disabled:opacity-60'
							>
								<IoTrashOutline size={18} />
								Remove Photo
							</motion.button>
						)}
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ProfileModal;
