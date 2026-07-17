import { useEffect, useRef } from "react";
import twemoji from "@twemoji/api";

// Renders text with Telegram-style emoji artwork (Twemoji SVGs) instead of the
// OS emoji font. twemoji.parse walks TEXT nodes only, so React's own escaping
// stays intact (no XSS surface). The `key` on the element remounts it whenever
// the text changes, so React never tries to reconcile the swapped-in <img>s.
const EmojiText = ({ children, as: Tag = "span", className, ...rest }) => {
	const ref = useRef(null);

	useEffect(() => {
		if (ref.current) {
			twemoji.parse(ref.current, { folder: "svg", ext: ".svg" });
		}
	});

	const key = typeof children === "string" ? children : undefined;

	return (
		<Tag key={key} ref={ref} className={className} {...rest}>
			{children}
		</Tag>
	);
};

export default EmojiText;
