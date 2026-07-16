import { useEffect, useRef, useState } from "react";
import { IoPlay, IoPause } from "react-icons/io5";
import { motion } from "framer-motion";

const FALLBACK_BARS = Array(40).fill(45); // old voice notes without waveform data

const formatTime = (seconds) => {
	if (!Number.isFinite(seconds)) return "0:00";
	const s = Math.max(0, Math.round(seconds));
	return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
};

const VoiceNotePlayer = ({ src, waveform = [], duration = 0 }) => {
	const audioRef = useRef(null);
	const [playing, setPlaying] = useState(false);
	const [progress, setProgress] = useState(0); // 0..1
	const [totalTime, setTotalTime] = useState(duration);

	const bars = waveform.length > 0 ? waveform : FALLBACK_BARS;

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const onTime = () => {
			if (Number.isFinite(audio.duration) && audio.duration > 0) {
				setProgress(audio.currentTime / audio.duration);
				setTotalTime(audio.duration);
			} else if (totalTime > 0) {
				setProgress(Math.min(1, audio.currentTime / totalTime));
			}
		};
		const onEnded = () => {
			setPlaying(false);
			setProgress(0);
		};
		const onLoaded = () => {
			if (Number.isFinite(audio.duration) && audio.duration > 0) setTotalTime(audio.duration);
		};

		audio.addEventListener("timeupdate", onTime);
		audio.addEventListener("ended", onEnded);
		audio.addEventListener("loadedmetadata", onLoaded);
		return () => {
			audio.removeEventListener("timeupdate", onTime);
			audio.removeEventListener("ended", onEnded);
			audio.removeEventListener("loadedmetadata", onLoaded);
		};
	}, [totalTime]);

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (playing) {
			audio.pause();
			setPlaying(false);
		} else {
			audio.play().catch(() => {});
			setPlaying(true);
		}
	};

	const seek = (e) => {
		const audio = audioRef.current;
		if (!audio) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
		const total = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : totalTime;
		if (total > 0) {
			audio.currentTime = ratio * total;
			setProgress(ratio);
		}
	};

	const playedBars = Math.round(progress * bars.length);
	const remaining = totalTime > 0 ? totalTime * (1 - progress) : 0;

	return (
		<div className='flex items-center gap-2.5 min-w-[210px] py-0.5'>
			<audio ref={audioRef} src={src} preload='metadata' />
			<motion.button
				type='button'
				whileTap={{ scale: 0.88 }}
				onClick={togglePlay}
				className='w-9 h-9 shrink-0 rounded-full bg-white/25 hover:bg-white/35 flex items-center justify-center text-white'
				title={playing ? "Pause" : "Play"}
			>
				{playing ? <IoPause size={17} /> : <IoPlay size={17} className='ml-0.5' />}
			</motion.button>
			<div className='flex flex-col gap-1 flex-1'>
				<div className='flex items-end gap-[2px] h-6 cursor-pointer' onClick={seek}>
					{bars.map((level, i) => (
						<div
							key={i}
							className={`w-[3px] rounded-full transition-colors duration-150 ${
								i < playedBars ? "bg-white" : "bg-white/40"
							}`}
							style={{ height: `${Math.max(15, level)}%` }}
						/>
					))}
				</div>
				<span className='text-[11px] text-white/70 leading-none'>
					{playing || progress > 0 ? formatTime(remaining) : formatTime(totalTime)}
				</span>
			</div>
		</div>
	);
};

export default VoiceNotePlayer;
