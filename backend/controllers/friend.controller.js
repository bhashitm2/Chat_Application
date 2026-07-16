import mongoose from "mongoose";
import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

const PUBLIC_FIELDS = "fullName username profilePic";

const emitTo = (userId, event, payload) => {
	const socketId = getReceiverSocketId(userId.toString());
	if (socketId) io.to(socketId).emit(event, payload);
};

const makeFriends = async (userIdA, userIdB) => {
	await Promise.all([
		User.updateOne({ _id: userIdA }, { $addToSet: { friends: userIdB } }),
		User.updateOne({ _id: userIdB }, { $addToSet: { friends: userIdA } }),
		FriendRequest.deleteMany({
			$or: [
				{ sender: userIdA, receiver: userIdB },
				{ sender: userIdB, receiver: userIdA },
			],
		}),
	]);
};

export const sendFriendRequest = async (req, res) => {
	try {
		const { id: targetId } = req.params;
		const me = req.user;

		if (!mongoose.Types.ObjectId.isValid(targetId)) {
			return res.status(400).json({ error: "Invalid user" });
		}
		if (targetId === me._id.toString()) {
			return res.status(400).json({ error: "You cannot add yourself" });
		}

		const target = await User.findById(targetId).select(PUBLIC_FIELDS);
		if (!target) return res.status(404).json({ error: "User not found" });

		if (me.friends?.some((f) => f.toString() === targetId)) {
			return res.status(400).json({ error: "You are already friends" });
		}

		// mutual intent: if they already requested me, accept directly
		const incoming = await FriendRequest.findOne({ sender: targetId, receiver: me._id });
		if (incoming) {
			await makeFriends(me._id, targetId);
			emitTo(targetId, "friendRequestAccepted", {
				user: { _id: me._id, fullName: me.fullName, username: me.username, profilePic: me.profilePic },
			});
			return res.status(200).json({ status: "friend" });
		}

		const existing = await FriendRequest.findOne({ sender: me._id, receiver: targetId });
		if (existing) return res.status(400).json({ error: "Request already sent" });

		const request = await FriendRequest.create({ sender: me._id, receiver: targetId });
		emitTo(targetId, "friendRequest", {
			requestId: request._id,
			sender: { _id: me._id, fullName: me.fullName, username: me.username, profilePic: me.profilePic },
		});

		res.status(201).json({ status: "outgoing" });
	} catch (error) {
		console.log("Error in sendFriendRequest controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFriendRequests = async (req, res) => {
	try {
		const requests = await FriendRequest.find({ receiver: req.user._id })
			.sort({ createdAt: -1 })
			.populate("sender", PUBLIC_FIELDS);

		res.status(200).json(requests);
	} catch (error) {
		console.log("Error in getFriendRequests controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const acceptFriendRequest = async (req, res) => {
	try {
		const { requestId } = req.params;
		const me = req.user;

		const request = await FriendRequest.findById(requestId);
		if (!request) return res.status(404).json({ error: "Request not found" });
		if (request.receiver.toString() !== me._id.toString()) {
			return res.status(403).json({ error: "Not your request to accept" });
		}

		await makeFriends(me._id, request.sender);
		emitTo(request.sender, "friendRequestAccepted", {
			user: { _id: me._id, fullName: me.fullName, username: me.username, profilePic: me.profilePic },
		});

		res.status(200).json({ status: "friend" });
	} catch (error) {
		console.log("Error in acceptFriendRequest controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const rejectFriendRequest = async (req, res) => {
	try {
		const { requestId } = req.params;

		const request = await FriendRequest.findById(requestId);
		if (!request) return res.status(404).json({ error: "Request not found" });
		if (request.receiver.toString() !== req.user._id.toString()) {
			return res.status(403).json({ error: "Not your request to reject" });
		}

		await FriendRequest.deleteOne({ _id: requestId });
		res.status(200).json({ status: "rejected" });
	} catch (error) {
		console.log("Error in rejectFriendRequest controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const removeFriend = async (req, res) => {
	try {
		const { id: friendId } = req.params;
		const me = req.user;

		await Promise.all([
			User.updateOne({ _id: me._id }, { $pull: { friends: friendId } }),
			User.updateOne({ _id: friendId }, { $pull: { friends: me._id } }),
		]);

		emitTo(friendId, "friendRemoved", { userId: me._id.toString() });
		res.status(200).json({ status: "removed" });
	} catch (error) {
		console.log("Error in removeFriend controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
