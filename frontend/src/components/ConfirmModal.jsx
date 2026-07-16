import { motion } from "framer-motion";

// Mount animations only — AnimatePresence exit animations are unreliable under
// React 18 StrictMode, and a stuck invisible overlay would block every click.
const ConfirmModal = ({ open, title, description, confirmLabel = "Delete", onConfirm, onCancel, loading }) => {
	if (!open) return null;

	return (
		<motion.div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			onClick={onCancel}
		>
			<motion.div
				className='bg-gray-800 rounded-2xl p-6 mx-4 w-full max-w-sm shadow-xl'
				initial={{ opacity: 0, scale: 0.9, y: 12 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ type: "spring", stiffness: 400, damping: 30 }}
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className='text-white text-lg font-semibold'>{title}</h3>
				<p className='text-gray-400 text-sm mt-1'>{description}</p>
				<div className='flex justify-end gap-2 mt-5'>
					<motion.button
						whileTap={{ scale: 0.95 }}
						className='px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700'
						onClick={onCancel}
					>
						Cancel
					</motion.button>
					<motion.button
						whileTap={{ scale: 0.95 }}
						className='px-4 py-2 rounded-lg text-sm bg-red-500 hover:bg-red-600 text-white disabled:opacity-60'
						onClick={onConfirm}
						disabled={loading}
					>
						{loading ? <span className='loading loading-spinner loading-xs'></span> : confirmLabel}
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ConfirmModal;
