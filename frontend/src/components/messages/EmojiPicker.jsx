import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { IoSearchSharp } from "react-icons/io5";
import { EMOJI_CATEGORIES, getRecentEmojis, addRecentEmoji } from "../../utils/emojiData";

// Anchored panel above the composer's emoji button (design: 340×300, radius 18,
// footer category strip with a reserved "GIFs & stickers soon" slot).
const EmojiPicker = ({ onPick, onClose }) => {
	const [category, setCategory] = useState("smileys");
	const [query, setQuery] = useState("");
	const [recents, setRecents] = useState(getRecentEmojis);
	const panelRef = useRef(null);

	// close on outside click / Escape
	useEffect(() => {
		const onDown = (e) => {
			if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
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

	const shown = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (q) {
			return EMOJI_CATEGORIES.flatMap((cat) => cat.emojis).filter(([, name]) => name.includes(q));
		}
		if (category === "recent") return recents.map((e) => [e, ""]);
		return EMOJI_CATEGORIES.find((c) => c.id === category)?.emojis ?? [];
	}, [query, category, recents]);

	const pick = (emoji) => {
		addRecentEmoji(emoji);
		setRecents(getRecentEmojis());
		onPick(emoji);
	};

	return (
		<motion.div
			ref={panelRef}
			initial={{ opacity: 0, scale: 0.9, y: 8 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 480, damping: 30 }}
			style={{ transformOrigin: "bottom left", background: "var(--emoji-panel)", borderColor: "var(--emoji-border)" }}
			className='absolute left-0 bottom-full mb-3 w-[340px] h-[300px] rounded-card border shadow-frame z-30 flex flex-col overflow-hidden'
		>
			{/* search */}
			<div className='px-3 py-2.5 border-b border-line'>
				<div className='flex items-center gap-2 h-[34px] px-3 rounded-[10px] bg-surface text-ink-faint'>
					<IoSearchSharp size={15} className='flex-none' />
					<input
						type='text'
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder='Search emoji'
						className='flex-1 min-w-0 bg-transparent text-[13px] text-ink placeholder:text-ink-faint focus:outline-none'
					/>
				</div>
			</div>

			{/* grid */}
			<div className='flex-1 overflow-y-auto chat-scroll p-2 grid grid-cols-8 gap-[2px] content-start'>
				{shown.map(([emoji, name], i) => (
					<motion.button
						key={`${emoji}-${i}`}
						type='button'
						whileHover={{ scale: 1.25 }}
						whileTap={{ scale: 0.9 }}
						transition={{ type: "spring", stiffness: 500, damping: 20 }}
						onClick={() => pick(emoji)}
						className='aspect-square rounded-[9px] text-xl flex items-center justify-center hover:bg-surface'
						title={name}
					>
						{emoji}
					</motion.button>
				))}
				{shown.length === 0 && (
					<p className='col-span-8 text-center text-[13px] text-ink-faint mt-8'>
						{query ? "No emoji found" : "Pick a few emoji and they'll show up here"}
					</p>
				)}
			</div>

			{/* category strip + future GIFs/stickers slot */}
			<div className='px-2.5 py-2 border-t border-line flex items-center gap-1'>
				<button
					type='button'
					onClick={() => {
						setQuery("");
						setCategory("recent");
					}}
					className={`w-7 h-7 rounded-lg text-base flex items-center justify-center ${
						category === "recent" && !query ? "bg-surface" : "opacity-75 hover:opacity-100"
					}`}
					title='Recently used'
				>
					🕐
				</button>
				{EMOJI_CATEGORIES.map((cat) => (
					<button
						key={cat.id}
						type='button'
						onClick={() => {
							setQuery("");
							setCategory(cat.id);
						}}
						className={`w-7 h-7 rounded-lg text-base flex items-center justify-center ${
							category === cat.id && !query ? "bg-surface" : "opacity-75 hover:opacity-100"
						}`}
						title={cat.label}
					>
						{cat.icon}
					</button>
				))}
				<span className='ms-auto text-[10.5px] font-semibold text-ink-faint whitespace-nowrap'>
					GIFs & stickers soon
				</span>
			</div>
		</motion.div>
	);
};

export default EmojiPicker;
