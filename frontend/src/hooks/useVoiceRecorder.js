import { useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";

const LIVE_BARS = 32; // bars shown in the live visual
const WAVEFORM_SAMPLES = 40; // samples stored with the message

const getSupportedMimeType = () => {
	if (typeof MediaRecorder === "undefined") return null;
	if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
	if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4"; // Safari
	if (MediaRecorder.isTypeSupported("audio/ogg")) return "audio/ogg";
	return "";
};

const downsample = (history) => {
	if (history.length === 0) return [];
	const out = [];
	const bucket = history.length / WAVEFORM_SAMPLES;
	for (let i = 0; i < WAVEFORM_SAMPLES; i++) {
		const start = Math.floor(i * bucket);
		const end = Math.max(start + 1, Math.floor((i + 1) * bucket));
		let peak = 0;
		for (let j = start; j < end && j < history.length; j++) {
			peak = Math.max(peak, history[j]);
		}
		out.push(Math.round(peak));
	}
	return out;
};

const useVoiceRecorder = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [duration, setDuration] = useState(0);
	// rolling window of recent volume levels (0-100) that drives the live bars
	const [levels, setLevels] = useState(Array(LIVE_BARS).fill(0));

	const mediaRecorderRef = useRef(null);
	const chunksRef = useRef([]);
	const streamRef = useRef(null);
	const timerRef = useRef(null);
	const meterRef = useRef(null);
	const audioCtxRef = useRef(null);
	const historyRef = useRef([]);
	const durationRef = useRef(0);
	const discardedRef = useRef(false);

	const cleanup = useCallback(() => {
		clearInterval(timerRef.current);
		clearInterval(meterRef.current);
		streamRef.current?.getTracks().forEach((track) => track.stop());
		streamRef.current = null;
		audioCtxRef.current?.close().catch(() => {});
		audioCtxRef.current = null;
		mediaRecorderRef.current = null;
		chunksRef.current = [];
		historyRef.current = [];
		setIsRecording(false);
		setDuration(0);
		setLevels(Array(LIVE_BARS).fill(0));
	}, []);

	const startRecording = useCallback(async () => {
		const mimeType = getSupportedMimeType();
		if (mimeType === null) {
			toast.error("Voice recording is not supported in this browser");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;
			discardedRef.current = false;
			chunksRef.current = [];
			historyRef.current = [];
			durationRef.current = 0;

			const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
			mediaRecorderRef.current = recorder;
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunksRef.current.push(e.data);
			};
			recorder.start();

			// live volume meter via Web Audio analyser
			const AudioCtx = window.AudioContext || window.webkitAudioContext;
			const audioCtx = new AudioCtx();
			audioCtxRef.current = audioCtx;
			const source = audioCtx.createMediaStreamSource(stream);
			const analyser = audioCtx.createAnalyser();
			analyser.fftSize = 256;
			source.connect(analyser);
			const data = new Uint8Array(analyser.frequencyBinCount);

			meterRef.current = setInterval(() => {
				analyser.getByteFrequencyData(data);
				let sum = 0;
				for (let i = 0; i < data.length; i++) sum += data[i];
				const level = Math.min(100, Math.round((sum / data.length / 255) * 100 * 2.2));
				historyRef.current.push(level);
				setLevels((prev) => [...prev.slice(1), level]);
			}, 100);

			setIsRecording(true);
			setDuration(0);
			timerRef.current = setInterval(() => {
				durationRef.current += 1;
				setDuration(durationRef.current);
			}, 1000);
		} catch (error) {
			toast.error("Microphone access denied");
			cleanup();
		}
	}, [cleanup]);

	// resolves with { file, waveform, duration } (or null when cancelled / nothing recorded)
	const stopRecording = useCallback(() => {
		return new Promise((resolve) => {
			const recorder = mediaRecorderRef.current;
			if (!recorder || recorder.state === "inactive") {
				cleanup();
				resolve(null);
				return;
			}
			const waveform = downsample(historyRef.current);
			const recordedDuration = durationRef.current;
			recorder.onstop = () => {
				let result = null;
				if (!discardedRef.current && chunksRef.current.length > 0) {
					const mimeType = recorder.mimeType || "audio/webm";
					const ext = mimeType.split("/")[1]?.split(";")[0] || "webm";
					const blob = new Blob(chunksRef.current, { type: mimeType });
					const file = new File([blob], `voice-note-${Date.now()}.${ext}`, { type: mimeType });
					result = { file, waveform, duration: recordedDuration };
				}
				cleanup();
				resolve(result);
			};
			recorder.stop();
		});
	}, [cleanup]);

	const cancelRecording = useCallback(() => {
		discardedRef.current = true;
		const recorder = mediaRecorderRef.current;
		if (recorder && recorder.state !== "inactive") {
			recorder.onstop = () => cleanup();
			recorder.stop();
		} else {
			cleanup();
		}
	}, [cleanup]);

	return { isRecording, duration, levels, startRecording, stopRecording, cancelRecording };
};

export default useVoiceRecorder;
