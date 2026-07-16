import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		message: {
			type: String,
			default: "",
		},
		messageType: {
			type: String,
			enum: ["text", "image", "video", "audio"],
			default: "text",
		},
		fileUrl: {
			type: String,
			default: "",
		},
		// album messages (2-3 photos sent together) store all urls here
		fileUrls: {
			type: [String],
			default: [],
		},
		// voice notes: normalized volume samples (0-100) and length in seconds
		waveform: {
			type: [Number],
			default: [],
		},
		duration: {
			type: Number,
			default: 0,
		},
		// read receipt: set true when the receiver opens the conversation
		read: {
			type: Boolean,
			default: false,
		},
		// createdAt, updatedAt
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
