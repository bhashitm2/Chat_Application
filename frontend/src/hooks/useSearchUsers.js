import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// debounced global user search with per-result friendship status
const useSearchUsers = (query) => {
	const [results, setResults] = useState([]);
	const [searching, setSearching] = useState(false);
	const timerRef = useRef(null);

	useEffect(() => {
		clearTimeout(timerRef.current);
		const q = query.trim();
		if (q.length < 2) {
			setResults([]);
			setSearching(false);
			return;
		}
		setSearching(true);
		timerRef.current = setTimeout(async () => {
			try {
				const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
				const data = await res.json();
				if (data.error) throw new Error(data.error);
				setResults(data);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setSearching(false);
			}
		}, 300);

		return () => clearTimeout(timerRef.current);
	}, [query]);

	// let the UI flip a row's status locally (e.g. none -> outgoing after Add)
	const updateStatus = (userId, status) => {
		setResults((prev) => prev.map((u) => (u._id === userId ? { ...u, status } : u)));
	};

	return { results, searching, updateStatus };
};

export default useSearchUsers;
