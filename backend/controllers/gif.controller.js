// Proxy for the KLIPY GIF API (Tenor's successor — the Tenor API shuts down
// June 30, 2026) so the key stays server-side. Get a free key at
// https://klipy.com/developers and put it in .env as KLIPY_API_KEY — until
// then the endpoint reports itself unconfigured.
const KLIPY_BASE = "https://api.klipy.com/api/v1";

export const searchGifs = async (req, res) => {
	try {
		const key = process.env.KLIPY_API_KEY;
		if (!key) {
			return res.status(503).json({ error: "GIFs are not set up yet (missing KLIPY_API_KEY)" });
		}

		const q = (req.query.q || "").toString().slice(0, 100).trim();
		// customer_id is KLIPY's per-end-user identifier for dedupe/analytics
		const params = `per_page=24&page=1&customer_id=${req.user._id.toString()}`;
		const url = q
			? `${KLIPY_BASE}/${key}/gifs/search?${params}&q=${encodeURIComponent(q)}`
			: `${KLIPY_BASE}/${key}/gifs/trending?${params}`;

		const response = await fetch(url);
		if (!response.ok) {
			return res.status(502).json({ error: "GIF search failed" });
		}
		const payload = await response.json();

		// items: { type: "gif", slug, file: { hd|md|sm|xs: { gif|webp|mp4: { url } } } }
		// (type "ad" entries are interleaved on some plans — skip them)
		const items = payload?.data?.data || [];
		const gifs = items
			.filter((item) => item?.type === "gif" && item?.file)
			.map((item) => ({
				id: item.slug,
				preview: item.file.xs?.gif?.url || item.file.sm?.gif?.url || item.file.md?.gif?.url,
				url: item.file.md?.gif?.url || item.file.hd?.gif?.url || item.file.sm?.gif?.url,
			}))
			.filter((g) => g.preview && g.url);

		res.status(200).json(gifs);
	} catch (error) {
		console.log("Error in searchGifs controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
