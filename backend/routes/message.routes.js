import express from "express";
import {
	getMessages,
	sendMessage,
	deleteMessage,
	deleteConversation,
	markMessagesRead,
	reactToMessage,
} from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import upload from "../utils/upload.js";

const router = express.Router();

const uploadFiles = (req, res, next) => {
	upload.array("files", 3)(req, res, (err) => {
		if (err) {
			let message = err.message;
			if (err.code === "LIMIT_FILE_SIZE") message = "File is too large (max 50MB)";
			if (err.code === "LIMIT_UNEXPECTED_FILE") message = "You can send at most 3 photos at a time";
			return res.status(400).json({ error: message });
		}
		next();
	});
};

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, uploadFiles, sendMessage);
router.post("/read/:id", protectRoute, markMessagesRead);
router.post("/react/:messageId", protectRoute, reactToMessage);
// "/conversation/:id" must be registered before "/:messageId"
router.delete("/conversation/:id", protectRoute, deleteConversation);
router.delete("/:messageId", protectRoute, deleteMessage);

export default router;
