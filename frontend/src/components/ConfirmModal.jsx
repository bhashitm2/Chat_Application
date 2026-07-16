import { motion } from "framer-motion";

// Mount animations only — AnimatePresence exit animations are unreliable under
// React 18 StrictMode, and a stuck invisible overlay would block every click.
const ConfirmModal = ({ open, title, description, confirmLabel = "Delete", onConfirm, onCancel, loading }) => {
	if (!open) return null;

	return (
		<motion.div
			className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px]'
			style={{ background: "var(--overlay)" }}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			onClick={onCancel}
		>
			<motion.div
				className='bg-panel rounded-card p-6 mx-4 w-full max-w-sm shadow-frame border border-line'
				initial={{ opacity: 0, scale: 0.9, y: 12 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ type: "spring", stiffness: 400, damping: 30 }}
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className='text-ink text-lg font-extrabold tracking-tight'>{title}</h3>
				<p className='text-ink-dim text-sm mt-1.5'>{description}</p>
				<div className='flex justify-end gap-2 mt-5'>
					<motion.button
						whileTap={{ scale: 0.95 }}
						className='px-4 py-2 rounded-pill text-sm font-semibold text-ink-dim hover:bg-surface theme-fade'
						onClick={onCancel}
					>
						Cancel
					</motion.button>
					<motion.button
						whileTap={{ scale: 0.95 }}
						className='px-4 py-2 rounded-pill text-sm font-bold bg-red-500 hover:bg-red-600 text-white disabled:opacity-60'
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
