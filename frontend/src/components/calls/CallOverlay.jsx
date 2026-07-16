import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
	IoCall,
	IoClose,
	IoMic,
	IoMicOff,
	IoVideocam,
	IoVideocamOff,
} from "react-icons/io5";
import { useCallContext } from "../../context/CallContext";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";

const formatDuration = (seconds) => {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
};

const VideoPlayer = ({ stream, muted = false, className }) => {
	const videoRef = useRef(null);

	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
		}
	}, [stream]);

	return <video ref={videoRef} autoPlay playsInline muted={muted} className={className} />;
};

const AudioPlayer = ({ stream }) => {
	const audioRef = useRef(null);

	useEffect(() => {
		if (audioRef.current && stream) {
			audioRef.current.srcObject = stream;
		}
	}, [stream]);

	return <audio ref={audioRef} autoPlay />;
};

const CallOverlay = () => {
	const {
		call,
		localStream,
		remoteStream,
		isMuted,
		isCameraOff,
		acceptCall,
		rejectCall,
		endCall,
		toggleMute,
		toggleCamera,
	} = useCallContext();

	const [duration, setDuration] = useState(0);
	const connected = call?.status === "connected";

	useEffect(() => {
		if (!connected) {
			setDuration(0);
			return;
		}
		const interval = setInterval(() => setDuration((d) => d + 1), 1000);
		return () => clearInterval(interval);
	}, [connected]);

	if (!call) return null;

	const { status, callType, peer } = call;
	const isVideoCall = callType === "video";

	// ---- Incoming call popup ----
	if (status === "incoming") {
		return (
			<motion.div
				className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
			>
				<motion.div
					className='bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl mx-4'
					initial={{ opacity: 0, scale: 0.8, y: 24 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ type: "spring", stiffness: 350, damping: 24 }}
				>
					<motion.img
						src={resolveAvatar(peer.profilePic)}
						onError={onAvatarError}
						alt={peer.fullName}
						className='w-24 h-24 rounded-full object-cover'
						animate={{ scale: [1, 1.06, 1] }}
						transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
					/>
					<div className='text-center'>
						<p className='text-white text-xl font-semibold'>{peer.fullName}</p>
						<p className='text-gray-400 mt-1'>Incoming {isVideoCall ? "video" : "voice"} call...</p>
					</div>
					<div className='flex gap-8 mt-2'>
						<motion.button
							whileTap={{ scale: 0.88 }}
							onClick={rejectCall}
							className='w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white'
							title='Decline'
						>
							<IoClose size={26} />
						</motion.button>
						<motion.button
							whileTap={{ scale: 0.88 }}
							onClick={acceptCall}
							className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white animate-pulse'
							title='Accept'
						>
							{isVideoCall ? <IoVideocam size={24} /> : <IoCall size={24} />}
						</motion.button>
					</div>
				</motion.div>
			</motion.div>
		);
	}

	// ---- Outgoing / connecting / connected call screen ----
	const statusText =
		status === "outgoing" ? "Ringing..." : status === "connecting" ? "Connecting..." : formatDuration(duration);

	return (
		<motion.div
			className='fixed inset-0 z-50 bg-gray-900 flex flex-col'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.25 }}
		>
			{/* Media area */}
			<div className='relative flex-1 flex items-center justify-center overflow-hidden'>
				{isVideoCall && remoteStream ? (
					<VideoPlayer stream={remoteStream} className='absolute inset-0 w-full h-full object-contain' />
				) : (
					<div className='flex flex-col items-center gap-4'>
						<img src={resolveAvatar(peer.profilePic)} onError={onAvatarError} alt={peer.fullName} className='w-28 h-28 rounded-full object-cover' />
						<p className='text-white text-2xl font-semibold'>{peer.fullName}</p>
						<p className='text-gray-400'>{statusText}</p>
					</div>
				)}

				{/* audio for voice calls (and fallback audio for video calls) */}
				{!isVideoCall && remoteStream && <AudioPlayer stream={remoteStream} />}

				{/* Local preview for video calls */}
				{isVideoCall && localStream && (
					<div className='absolute bottom-4 right-4 w-32 md:w-44 aspect-video rounded-lg overflow-hidden border border-gray-600 shadow-lg bg-black'>
						<VideoPlayer stream={localStream} muted className='w-full h-full object-cover' />
					</div>
				)}

				{/* Header info when video is showing */}
				{isVideoCall && remoteStream && (
					<div className='absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-1.5'>
						<p className='text-white font-semibold'>{peer.fullName}</p>
						<p className='text-gray-300 text-sm'>{statusText}</p>
					</div>
				)}
			</div>

			{/* Controls */}
			<motion.div
				className='py-6 flex items-center justify-center gap-6 bg-gray-900'
				initial={{ opacity: 0, y: 32 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 26 }}
			>
				<motion.button
					whileTap={{ scale: 0.88 }}
					onClick={toggleMute}
					className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-colors ${
						isMuted ? "bg-white/90 !text-gray-900" : "bg-gray-700 hover:bg-gray-600"
					}`}
					title={isMuted ? "Unmute" : "Mute"}
				>
					{isMuted ? <IoMicOff size={24} /> : <IoMic size={24} />}
				</motion.button>

				{isVideoCall && (
					<motion.button
						whileTap={{ scale: 0.88 }}
						onClick={toggleCamera}
						className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-colors ${
							isCameraOff ? "bg-white/90 !text-gray-900" : "bg-gray-700 hover:bg-gray-600"
						}`}
						title={isCameraOff ? "Turn camera on" : "Turn camera off"}
					>
						{isCameraOff ? <IoVideocamOff size={24} /> : <IoVideocam size={24} />}
					</motion.button>
				)}

				<motion.button
					whileTap={{ scale: 0.88 }}
					onClick={endCall}
					className='w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white rotate-[135deg]'
					title='End call'
				>
					<IoCall size={24} />
				</motion.button>
			</motion.div>
		</motion.div>
	);
};

export default CallOverlay;
