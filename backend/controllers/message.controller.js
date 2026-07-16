import fs from "fs";
import path from "path";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

const messageTypeFromMime = (mimetype) => {
	const mimeType = mimetype.split(";")[0];
	if (mimeType.startsWith("image/")) return "image";
	if (mimeType.startsWith("video/")) return "video";
	if (mimeType.startsWith("audio/")) return "audio";
	return "text";
};

const removeUploadedFile = (fileUrl) => {
	if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
	const filePath = path.join(path.resolve(), "uploads", path.basename(fileUrl));
	fs.unlink(filePath, () => {}); // best-effort; ignore missing files
};

export const sendMessage = async (req, res) => {
	try {
		const { message = "" } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		const files = req.files || [];

		const isFriend = (req.user.friends || []).some((f) => f.toString() === receiverId);
		if (!isFriend) {
			// multer already stored any uploads — don't leave orphans behind
			files.forEach((f) => removeUploadedFile(`/uploads/${f.filename}`));
			return res.status(403).json({ error: "You can only message your friends" });
		}
		let messageType = "text";
		let fileUrl = "";
		let fileUrls = [];
		let waveform = [];
		let duration = 0;

		if (files.length === 1) {
			messageType = messageTypeFromMime(files[0].mimetype);
			fileUrl = `/uploads/${files[0].filename}`;
		} else if (files.length > 1) {
			// albums are images-only, enforced on the client and re-checked here
			if (files.some((f) => messageTypeFromMime(f.mimetype) !== "image")) {
				files.forEach((f) => removeUploadedFile(`/uploads/${f.filename}`));
				return res.status(400).json({ error: "Only photos can be sent as an album" });
			}
			messageType = "image";
			fileUrls = files.map((f) => `/uploads/${f.filename}`);
			fileUrl = fileUrls[0];
		}

		if (messageType === "audio") {
			try {
				const parsed = JSON.parse(req.body.waveform || "[]");
				if (Array.isArray(parsed)) {
					waveform = parsed.slice(0, 100).map((n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0))));
				}
			} catch {
				waveform = [];
			}
			duration = Math.max(0, Math.round(Number(req.body.duration) || 0));
		}

		if (!message && !fileUrl) {
			return res.status(400).json({ error: "Message cannot be empty" });
		}

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
			messageType,
			fileUrl,
			fileUrls,
			waveform,
			duration,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			// io.to(<socket_id>).emit() used to send events to specific client
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		// opening the conversation marks their messages as read; tell the
		// sender so their double-checks light up live
		const updated = await Message.updateMany(
			{ senderId: userToChatId, receiverId: senderId, read: false },
			{ $set: { read: true } }
		);
		if (updated.modifiedCount > 0) {
			const otherSocketId = getReceiverSocketId(userToChatId);
			if (otherSocketId) {
				io.to(otherSocketId).emit("messagesRead", { readerId: senderId.toString() });
			}
		}

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// marks everything from :id to me as read (called when a message arrives
// while the conversation is already open on screen)
export const markMessagesRead = async (req, res) => {
	try {
		const { id: otherUserId } = req.params;
		const myId = req.user._id;

		const updated = await Message.updateMany(
			{ senderId: otherUserId, receiverId: myId, read: false },
			{ $set: { read: true } }
		);
		if (updated.modifiedCount > 0) {
			const otherSocketId = getReceiverSocketId(otherUserId);
			if (otherSocketId) {
				io.to(otherSocketId).emit("messagesRead", { readerId: myId.toString() });
			}
		}

		res.status(200).json({ read: updated.modifiedCount });
	} catch (error) {
		console.log("Error in markMessagesRead controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteMessage = async (req, res) => {
	try {
		const { messageId } = req.params;
		const userId = req.user._id;

		const message = await Message.findById(messageId);
		if (!message) return res.status(404).json({ error: "Message not found" });

		if (message.senderId.toString() !== userId.toString()) {
			return res.status(403).json({ error: "You can only delete your own messages" });
		}

		const urls = message.fileUrls?.length ? message.fileUrls : [message.fileUrl];
		urls.forEach(removeUploadedFile);

		await Promise.all([
			Message.deleteOne({ _id: messageId }),
			Conversation.updateOne(
				{ participants: { $all: [message.senderId, message.receiverId] } },
				{ $pull: { messages: message._id } }
			),
		]);

		const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageDeleted", { messageId });
		}

		res.status(200).json({ messageId });
	} catch (error) {
		console.log("Error in deleteMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteConversation = async (req, res) => {
	try {
		const { id: otherUserId } = req.params;
		const userId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [userId, otherUserId] },
		}).populate("messages");

		if (!conversation) return res.status(200).json({ deleted: 0 });

		for (const msg of conversation.messages) {
			const urls = msg.fileUrls?.length ? msg.fileUrls : [msg.fileUrl];
			urls.forEach(removeUploadedFile);
		}

		const deleted = conversation.messages.length;
		await Promise.all([
			Message.deleteMany({ _id: { $in: conversation.messages.map((m) => m._id) } }),
			Conversation.deleteOne({ _id: conversation._id }),
		]);

		const receiverSocketId = getReceiverSocketId(otherUserId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("conversationDeleted", { peerId: userId.toString() });
		}

		res.status(200).json({ deleted });
	} catch (error) {
		console.log("Error in deleteConversation controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
