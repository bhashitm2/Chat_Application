import fs from "fs";
import path from "path";
import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import Message from "../models/message.model.js";

const PUBLIC_FIELDS = "fullName username profilePic";

const removeUploadedFile = (fileUrl) => {
	if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
	const filePath = path.join(path.resolve(), "uploads", path.basename(fileUrl));
	fs.unlink(filePath, () => {}); // best-effort; ignore missing files
};

// sidebar shows only the logged-in user's friends, enriched with the last
// message preview + unread count and sorted by most recent activity
export const getUsersForSidebar = async (req, res) => {
	try {
		const myId = req.user._id;
		const me = await User.findById(myId).populate("friends", PUBLIC_FIELDS);
		const friends = me?.friends || [];

		const enriched = await Promise.all(
			friends.map(async (friend) => {
				const [last, unreadCount] = await Promise.all([
					Message.findOne({
						$or: [
							{ senderId: myId, receiverId: friend._id },
							{ senderId: friend._id, receiverId: myId },
						],
					})
						.sort({ createdAt: -1 })
						.select("message messageType senderId createdAt duration"),
					Message.countDocuments({ senderId: friend._id, receiverId: myId, read: false }),
				]);

				return {
					...friend.toObject(),
					lastMessage: last
						? {
								message: last.message,
								messageType: last.messageType,
								senderId: last.senderId,
								createdAt: last.createdAt,
								duration: last.duration,
						  }
						: null,
					unreadCount,
				};
			})
		);

		enriched.sort((a, b) => {
			const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
			const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
			return tb - ta;
		});

		res.status(200).json(enriched);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchUsers = async (req, res) => {
	try {
		const { q = "" } = req.query;
		const me = req.user;

		const query = q.trim();
		if (query.length < 2) return res.status(200).json([]);

		const regex = new RegExp(escapeRegex(query), "i");
		const users = await User.find({
			_id: { $ne: me._id },
			$or: [{ username: regex }, { fullName: regex }],
		})
			.select(PUBLIC_FIELDS)
			.limit(10);

		const friendIds = new Set((me.friends || []).map((f) => f.toString()));
		const userIds = users.map((u) => u._id);
		const requests = await FriendRequest.find({
			$or: [
				{ sender: me._id, receiver: { $in: userIds } },
				{ sender: { $in: userIds }, receiver: me._id },
			],
		});

		const outgoing = new Set(
			requests.filter((r) => r.sender.toString() === me._id.toString()).map((r) => r.receiver.toString())
		);
		const incoming = new Map(
			requests
				.filter((r) => r.receiver.toString() === me._id.toString())
				.map((r) => [r.sender.toString(), r._id.toString()])
		);

		const results = users.map((u) => {
			const id = u._id.toString();
			let status = "none";
			let requestId = null;
			if (friendIds.has(id)) status = "friend";
			else if (outgoing.has(id)) status = "outgoing";
			else if (incoming.has(id)) {
				status = "incoming";
				requestId = incoming.get(id);
			}
			return {
				_id: u._id,
				fullName: u.fullName,
				username: u.username,
				profilePic: u.profilePic,
				status,
				requestId,
			};
		});

		res.status(200).json(results);
	} catch (error) {
		console.error("Error in searchUsers: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const updateProfilePic = async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: "No image uploaded" });

		const mimeType = req.file.mimetype.split(";")[0];
		if (!mimeType.startsWith("image/")) {
			removeUploadedFile(`/uploads/${req.file.filename}`);
			return res.status(400).json({ error: "Only image files are allowed" });
		}

		const user = await User.findById(req.user._id);
		if (!user) {
			removeUploadedFile(`/uploads/${req.file.filename}`);
			return res.status(404).json({ error: "User not found" });
		}

		// drop the previous locally-stored photo so uploads/ doesn't accumulate orphans
		removeUploadedFile(user.profilePic);

		user.profilePic = `/uploads/${req.file.filename}`;
		await user.save();

		res.status(200).json({ profilePic: user.profilePic });
	} catch (error) {
		console.error("Error in updateProfilePic: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const removeProfilePic = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) return res.status(404).json({ error: "User not found" });

		removeUploadedFile(user.profilePic);
		user.profilePic = "";
		await user.save();

		res.status(200).json({ profilePic: "" });
	} catch (error) {
		console.error("Error in removeProfilePic: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
