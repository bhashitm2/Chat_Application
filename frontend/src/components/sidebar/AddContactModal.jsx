import { useState } from "react";
import toast from "react-hot-toast";
import { IoPersonAdd } from "react-icons/io5";

const AddContactModal = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [secretKey, setSecretKey] = useState("");
	const [loading, setLoading] = useState(false);

	const handleAddContact = async (e) => {
		e.preventDefault();
		if (!secretKey) return toast.error("Please enter a Secret Key");

		setLoading(true);
		try {
			const res = await fetch("/api/users/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ secretKey: secretKey.trim() }),
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			toast.success(`Connected with ${data.fullName}!`);
			setSecretKey("");
			setIsOpen(false);
			// Ideally, we should refresh the conversation list here
			window.location.reload(); 
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<button className="btn btn-circle btn-sm bg-sky-500 text-white ml-2 hover:bg-sky-600 border-none" onClick={() => setIsOpen(true)} title="Add Contact">
				<IoPersonAdd className="w-4 h-4" />
			</button>

			{isOpen && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-slate-800 p-6 rounded-lg shadow-xl w-96 border border-slate-700">
						<h3 className="text-lg font-bold text-white mb-4">Add New Contact</h3>
						<form onSubmit={handleAddContact}>
							<div className="mb-4">
								<label className="block text-gray-300 text-sm font-bold mb-2">Secret Key</label>
								<input
									type="text"
									placeholder="Enter 6-character key"
									className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-sky-500 outline-none uppercase"
									value={secretKey}
									onChange={(e) => setSecretKey(e.target.value.toUpperCase())}
									maxLength={6}
								/>
							</div>
							<div className="flex justify-end gap-2">
								<button
									type="button"
									className="btn btn-sm btn-ghost text-gray-300"
									onClick={() => setIsOpen(false)}
								>
									Cancel
								</button>
								<button className="btn btn-sm bg-sky-500 text-white border-none hover:bg-sky-600" disabled={loading}>
									{loading ? <span className="loading loading-spinner loading-xs"></span> : "Connect"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
};
export default AddContactModal;
