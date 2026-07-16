/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			// all colors resolve through the CSS variables in index.css, so the
			// light/dark toggle flips the entire palette with one class
			colors: {
				accent: "var(--accent)",
				accent2: "var(--accent-2)",
				panel: "var(--panel)",
				surface: "var(--surface)",
				line: "var(--line)",
				ink: "var(--ink)",
				"ink-dim": "var(--ink-dim)",
				"ink-faint": "var(--ink-faint)",
				"icon-dim": "var(--icon-dim)",
				"in-bubble": "var(--in-bubble)",
				"in-text": "var(--in-text)",
				"out-text": "var(--out-text)",
				"time-in": "var(--time-in)",
				"time-out": "var(--time-out)",
				online: "var(--online)",
				"unread-muted": "var(--unread-muted)",
				"sep-text": "var(--sep-text)",
				"emoji-panel": "var(--emoji-panel)",
				"emoji-border": "var(--emoji-border)",
			},
			fontFamily: {
				sans: ["Figtree", "system-ui", "sans-serif"],
			},
			borderRadius: {
				bubble: "20px",
				row: "14px",
				pill: "13px",
				composer: "23px",
				card: "18px",
			},
			transitionTimingFunction: {
				spring: "cubic-bezier(.34,1.56,.64,1)",
			},
		},
	},
	// eslint-disable-next-line no-undef
	plugins: [require("daisyui")],
	daisyui: {
		themes: false,
		logs: false,
	},
};
