import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
	getUsersForSidebar,
	searchUsers,
	updateProfilePic,
	removeProfilePic,
} from "../controllers/user.controller.js";
import upload from "../utils/upload.js";

const router = express.Router();

const uploadAvatar = (req, res, next) => {
	upload.single("profilePic")(req, res, (err) => {
		if (err) {
			const message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 50MB)" : err.message;
			return res.status(400).json({ error: message });
		}
		next();
	});
};

router.get("/", protectRoute, getUsersForSidebar);
router.get("/search", protectRoute, searchUsers);
router.put("/profile", protectRoute, uploadAvatar, updateProfilePic);
router.delete("/profile/photo", protectRoute, removeProfilePic);

export default router;
