import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useUpdateProfile = () => {
	const [loading, setLoading] = useState(false);
	const { authUser, setAuthUser } = useAuthContext();

	// keep context + localStorage in sync so the new photo shows immediately
	const persist = (profilePic) => {
		const merged = { ...authUser, profilePic };
		setAuthUser(merged);
		localStorage.setItem("chat-user", JSON.stringify(merged));
	};

	const updatePhoto = async (file) => {
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append("profilePic", file);
			const res = await fetch("/api/users/profile", { method: "PUT", body: formData });
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			persist(data.profilePic);
			toast.success("Profile photo updated");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const removePhoto = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/users/profile/photo", { method: "DELETE" });
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			persist("");
			toast.success("Profile photo removed");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { loading, updatePhoto, removePhoto };
};

export default useUpdateProfile;
