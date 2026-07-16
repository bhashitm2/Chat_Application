import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useSocketContext } from "./SocketContext";
import { useAuthContext } from "./AuthContext";
import { createRingtone, createRingback } from "../utils/callSounds";

const CallContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCallContext = () => {
	return useContext(CallContext);
};

const ICE_SERVERS = {
	iceServers: [
		{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
	],
};

// call.status: "outgoing" (ringing) | "incoming" (ringing) | "connecting" | "connected"
export const CallContextProvider = ({ children }) => {
	const { socket } = useSocketContext();
	const { authUser } = useAuthContext();

	const [call, setCall] = useState(null);
	const [localStream, setLocalStream] = useState(null);
	const [remoteStream, setRemoteStream] = useState(null);
	const [isMuted, setIsMuted] = useState(false);
	const [isCameraOff, setIsCameraOff] = useState(false);

	const callRef = useRef(null);
	const pcRef = useRef(null);
	const localStreamRef = useRef(null);
	const pendingCandidatesRef = useRef([]);
	const ringtoneRef = useRef(null); // heard by the callee while their phone "rings"
	const ringbackRef = useRef(null); // heard by the caller while waiting for an answer

	const updateCall = useCallback((next) => {
		callRef.current = next;
		setCall(next);
	}, []);

	const stopRingtone = useCallback(() => {
		ringtoneRef.current?.stop();
		ringbackRef.current?.stop();
	}, []);

	const playRingtone = useCallback(() => {
		if (!ringtoneRef.current) ringtoneRef.current = createRingtone();
		ringtoneRef.current.start();
	}, []);

	const playRingback = useCallback(() => {
		if (!ringbackRef.current) ringbackRef.current = createRingback();
		ringbackRef.current.start();
	}, []);

	const cleanup = useCallback(() => {
		stopRingtone();
		localStreamRef.current?.getTracks().forEach((track) => track.stop());
		localStreamRef.current = null;
		if (pcRef.current) {
			pcRef.current.onicecandidate = null;
			pcRef.current.ontrack = null;
			pcRef.current.onconnectionstatechange = null;
			pcRef.current.close();
			pcRef.current = null;
		}
		pendingCandidatesRef.current = [];
		updateCall(null);
		setLocalStream(null);
		setRemoteStream(null);
		setIsMuted(false);
		setIsCameraOff(false);
	}, [stopRingtone, updateCall]);

	const getMedia = useCallback(async (callType) => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: callType === "video",
			});
			localStreamRef.current = stream;
			setLocalStream(stream);
			return stream;
		} catch (error) {
			toast.error(callType === "video" ? "Camera/microphone access denied" : "Microphone access denied");
			return null;
		}
	}, []);

	const createPeerConnection = useCallback(
		(peerId) => {
			const pc = new RTCPeerConnection(ICE_SERVERS);
			pcRef.current = pc;

			localStreamRef.current?.getTracks().forEach((track) => {
				pc.addTrack(track, localStreamRef.current);
			});

			pc.onicecandidate = (event) => {
				if (event.candidate) {
					socket?.emit("webrtc:ice-candidate", { to: peerId, candidate: event.candidate });
				}
			};

			pc.ontrack = (event) => {
				setRemoteStream(event.streams[0]);
				if (callRef.current) {
					updateCall({ ...callRef.current, status: "connected" });
				}
			};

			pc.onconnectionstatechange = () => {
				if (pc.connectionState === "failed") {
					toast.error("Call connection lost");
					cleanup();
				}
			};

			return pc;
		},
		[socket, cleanup, updateCall]
	);

	const flushPendingCandidates = useCallback(async () => {
		const pc = pcRef.current;
		if (!pc) return;
		for (const candidate of pendingCandidatesRef.current) {
			try {
				await pc.addIceCandidate(new RTCIceCandidate(candidate));
			} catch (e) {
				console.error("Error adding buffered ICE candidate:", e);
			}
		}
		pendingCandidatesRef.current = [];
	}, []);

	const startCall = useCallback(
		async (peerUser, callType) => {
			if (callRef.current) {
				toast.error("You are already in a call");
				return;
			}
			if (!socket) {
				toast.error("Not connected to the server");
				return;
			}
			const stream = await getMedia(callType);
			if (!stream) return;

			updateCall({ status: "outgoing", callType, peer: peerUser });
			playRingback();
			socket.emit("call:initiate", {
				to: peerUser._id,
				callType,
				caller: {
					_id: authUser._id,
					fullName: authUser.fullName,
					profilePic: authUser.profilePic,
				},
			});
		},
		[socket, authUser, getMedia, updateCall, playRingback]
	);

	const acceptCall = useCallback(async () => {
		const current = callRef.current;
		if (!current || current.status !== "incoming") return;
		stopRingtone();
		const stream = await getMedia(current.callType);
		if (!stream) {
			socket?.emit("call:reject", { to: current.peer._id });
			cleanup();
			return;
		}
		updateCall({ ...current, status: "connecting" });
		socket?.emit("call:accept", { to: current.peer._id });
	}, [socket, getMedia, stopRingtone, cleanup, updateCall]);

	const rejectCall = useCallback(() => {
		const current = callRef.current;
		if (current) {
			socket?.emit("call:reject", { to: current.peer._id });
		}
		cleanup();
	}, [socket, cleanup]);

	const endCall = useCallback(() => {
		const current = callRef.current;
		if (current) {
			socket?.emit("call:end", { to: current.peer._id });
		}
		cleanup();
	}, [socket, cleanup]);

	const toggleMute = useCallback(() => {
		const stream = localStreamRef.current;
		if (!stream) return;
		stream.getAudioTracks().forEach((track) => {
			track.enabled = !track.enabled;
		});
		setIsMuted((prev) => !prev);
	}, []);

	const toggleCamera = useCallback(() => {
		const stream = localStreamRef.current;
		if (!stream) return;
		stream.getVideoTracks().forEach((track) => {
			track.enabled = !track.enabled;
		});
		setIsCameraOff((prev) => !prev);
	}, []);

	useEffect(() => {
		if (!socket) return;

		const handleIncoming = ({ callType, caller }) => {
			if (callRef.current) {
				// already in a call — decline automatically
				socket.emit("call:reject", { to: caller._id });
				return;
			}
			updateCall({ status: "incoming", callType, peer: caller });
			playRingtone();
		};

		const handleAccepted = async ({ from }) => {
			const current = callRef.current;
			if (!current) return;
			stopRingtone();
			updateCall({ ...current, status: "connecting" });
			const pc = createPeerConnection(from);
			try {
				const offer = await pc.createOffer();
				await pc.setLocalDescription(offer);
				socket.emit("webrtc:offer", { to: from, offer });
			} catch (e) {
				console.error("Error creating offer:", e);
				toast.error("Failed to start the call");
				socket.emit("call:end", { to: from });
				cleanup();
			}
		};

		const handleOffer = async ({ from, offer }) => {
			const current = callRef.current;
			if (!current) return;
			const pc = createPeerConnection(from);
			try {
				await pc.setRemoteDescription(new RTCSessionDescription(offer));
				await flushPendingCandidates();
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				socket.emit("webrtc:answer", { to: from, answer });
			} catch (e) {
				console.error("Error answering call:", e);
				toast.error("Failed to connect the call");
				socket.emit("call:end", { to: from });
				cleanup();
			}
		};

		const handleAnswer = async ({ answer }) => {
			const pc = pcRef.current;
			if (!pc) return;
			try {
				await pc.setRemoteDescription(new RTCSessionDescription(answer));
				await flushPendingCandidates();
			} catch (e) {
				console.error("Error applying answer:", e);
			}
		};

		const handleIceCandidate = async ({ candidate }) => {
			const pc = pcRef.current;
			if (pc && pc.remoteDescription) {
				try {
					await pc.addIceCandidate(new RTCIceCandidate(candidate));
				} catch (e) {
					console.error("Error adding ICE candidate:", e);
				}
			} else {
				pendingCandidatesRef.current.push(candidate);
			}
		};

		const handleRejected = () => {
			toast("Call declined", { icon: "📵" });
			cleanup();
		};

		const handleUnavailable = () => {
			toast("User is offline", { icon: "📵" });
			cleanup();
		};

		const handleBusy = () => {
			toast("User is on another call", { icon: "📵" });
			cleanup();
		};

		const handleForbidden = () => {
			toast.error("You can only call your friends");
			cleanup();
		};

		const handleEnded = () => {
			if (!callRef.current) return;
			toast("Call ended", { icon: "📞" });
			cleanup();
		};

		socket.on("call:incoming", handleIncoming);
		socket.on("call:accepted", handleAccepted);
		socket.on("call:rejected", handleRejected);
		socket.on("call:unavailable", handleUnavailable);
		socket.on("call:busy", handleBusy);
		socket.on("call:forbidden", handleForbidden);
		socket.on("call:ended", handleEnded);
		socket.on("webrtc:offer", handleOffer);
		socket.on("webrtc:answer", handleAnswer);
		socket.on("webrtc:ice-candidate", handleIceCandidate);

		return () => {
			socket.off("call:incoming", handleIncoming);
			socket.off("call:accepted", handleAccepted);
			socket.off("call:rejected", handleRejected);
			socket.off("call:unavailable", handleUnavailable);
			socket.off("call:busy", handleBusy);
			socket.off("call:forbidden", handleForbidden);
			socket.off("call:ended", handleEnded);
			socket.off("webrtc:offer", handleOffer);
			socket.off("webrtc:answer", handleAnswer);
			socket.off("webrtc:ice-candidate", handleIceCandidate);
		};
	}, [socket, createPeerConnection, flushPendingCandidates, cleanup, playRingtone, stopRingtone, updateCall]);

	// end any active call when the user logs out
	useEffect(() => {
		if (!authUser && callRef.current) {
			cleanup();
		}
	}, [authUser, cleanup]);

	// safety net: dismiss a ringing call that never gets answered (e.g. the
	// caller's browser crashed and no call:end ever arrives)
	useEffect(() => {
		if (!call || (call.status !== "incoming" && call.status !== "outgoing")) return;
		const timer = setTimeout(() => {
			const current = callRef.current;
			if (current && (current.status === "incoming" || current.status === "outgoing")) {
				socket?.emit("call:end", { to: current.peer._id });
				toast("Call not answered", { icon: "📵" });
				cleanup();
			}
		}, 45000);
		return () => clearTimeout(timer);
	}, [call, socket, cleanup]);

	return (
		<CallContext.Provider
			value={{
				call,
				localStream,
				remoteStream,
				isMuted,
				isCameraOff,
				startCall,
				acceptCall,
				rejectCall,
				endCall,
				toggleMute,
				toggleCamera,
			}}
		>
			{children}
		</CallContext.Provider>
	);
};
