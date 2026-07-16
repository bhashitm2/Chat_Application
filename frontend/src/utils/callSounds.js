// Synthesized call sounds via Web Audio API — no audio assets needed.
// Each factory returns { start, stop }; start() resumes the AudioContext
// (required by autoplay policies) and loops the pattern until stop().

let audioCtx = null;
const getCtx = () => {
	if (!audioCtx) {
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	}
	return audioCtx;
};

const createLoopingSound = (playPattern, intervalMs) => {
	let timer = null;
	let activeNodes = [];

	const start = () => {
		if (timer) return;
		const ctx = getCtx();
		ctx.resume().catch(() => {});
		const tick = () => {
			activeNodes = playPattern(ctx) || [];
		};
		tick();
		timer = setInterval(tick, intervalMs);
	};

	const stop = () => {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		activeNodes.forEach((node) => {
			try {
				node.stop();
			} catch {
				/* already stopped */
			}
		});
		activeNodes = [];
	};

	return { start, stop };
};

const playTone = (ctx, { freq, start, duration, volume = 0.25, type = "sine" }) => {
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = type;
	osc.frequency.value = freq;
	osc.connect(gain);
	gain.connect(ctx.destination);

	const t = ctx.currentTime + start;
	gain.gain.setValueAtTime(0, t);
	gain.gain.linearRampToValueAtTime(volume, t + 0.02);
	gain.gain.setValueAtTime(volume, t + duration - 0.05);
	gain.gain.linearRampToValueAtTime(0, t + duration);

	osc.start(t);
	osc.stop(t + duration);
	return osc;
};

// Callee side: a pleasant two-tone chime, repeating every 2s.
export const createRingtone = () =>
	createLoopingSound(
		(ctx) => [
			playTone(ctx, { freq: 660, start: 0, duration: 0.35, volume: 0.3 }),
			playTone(ctx, { freq: 880, start: 0.4, duration: 0.45, volume: 0.3 }),
			playTone(ctx, { freq: 660, start: 1.0, duration: 0.35, volume: 0.22 }),
			playTone(ctx, { freq: 880, start: 1.4, duration: 0.45, volume: 0.22 }),
		],
		2000
	);

// Caller side: classic ringback — 1s dual-tone ring, 3s silence.
export const createRingback = () =>
	createLoopingSound(
		(ctx) => [
			playTone(ctx, { freq: 440, start: 0, duration: 1.0, volume: 0.12 }),
			playTone(ctx, { freq: 480, start: 0, duration: 1.0, volume: 0.12 }),
		],
		4000
	);
