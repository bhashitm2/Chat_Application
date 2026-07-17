// Proxy for the Tenor v2 API so the key stays server-side.
// Get a free key at https://developers.google.com/tenor and put it in .env
// as TENOR_API_KEY — until then the endpoint reports itself unconfigured.
const TENOR_BASE = "https://tenor.googleapis.com/v2";

export const searchGifs = async (req, res) => {
	try {
		const key = process.env.TENOR_API_KEY;
		if (!key) {
			return res.status(503).json({ error: "GIFs are not set up yet (missing TENOR_API_KEY)" });
		}

		const q = (req.query.q || "").toString().slice(0, 100).trim();
		const params = `key=${key}&limit=24&media_filter=tinygif,gif&contentfilter=medium`;
		const url = q
			? `${TENOR_BASE}/search?${params}&q=${encodeURIComponent(q)}`
			: `${TENOR_BASE}/featured?${params}`;

		const response = await fetch(url);
		if (!response.ok) {
			return res.status(502).json({ error: "GIF search failed" });
		}
		const data = await response.json();

		const gifs = (data.results || [])
			.map((g) => ({
				id: g.id,
				preview: g.media_formats?.tinygif?.url,
				url: g.media_formats?.gif?.url || g.media_formats?.tinygif?.url,
			}))
			.filter((g) => g.preview && g.url);

		res.status(200).json(gifs);
	} catch (error) {
		console.log("Error in searchGifs controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
