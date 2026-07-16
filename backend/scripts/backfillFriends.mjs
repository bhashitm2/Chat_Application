// One-time migration: make the participants of every existing conversation
// friends with each other, so current chat partners stay in each other's
// sidebar after the friends-only change. Additive only ($addToSet).
//
// Usage: node backend/scripts/backfillFriends.mjs
// (uses MONGO_DB_URI from the environment / .env, same as the server)

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectToMongoDB from "../db/connectToMongoDB.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

dotenv.config();

await connectToMongoDB();
if (mongoose.connection.readyState !== 1) {
	console.error("Could not connect to MongoDB — aborting.");
	process.exit(1);
}

const conversations = await Conversation.find({}, "participants");
let pairs = 0;

for (const conv of conversations) {
	const [a, b] = conv.participants;
	if (!a || !b) continue;
	await Promise.all([
		User.updateOne({ _id: a }, { $addToSet: { friends: b } }),
		User.updateOne({ _id: b }, { $addToSet: { friends: a } }),
	]);
	pairs++;
}

console.log(`Backfilled friendship for ${pairs} conversation pair(s).`);
await mongoose.disconnect();
process.exit(0);
