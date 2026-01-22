import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
	try {
		const loggedInUserId = req.user._id;

		// Fetch the current user to get their contacts list
		const currentUser = await User.findById(loggedInUserId).populate("contacts", "-password");

		// Also fetch users with whom we have existing conversations (optional, but good UX if they remove contact)
		// For now, let's strictly restrict to contacts as per "Private List" requirement

		const filteredUsers = currentUser.contacts;

		res.status(200).json(filteredUsers);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const addContact = async (req, res) => {
	try {
		const { secretKey } = req.body;
		const userId = req.user._id;

		console.log(`[AddContact] Request from ${userId} to add key: '${secretKey}'`);

		if (!secretKey) {
			console.log("[AddContact] No key provided");
			return res.status(400).json({ error: "Secret key is required" });
		}

		// Find the user with this secret key
		const userToAdd = await User.findOne({ secretKey }).select("-password");

		if (!userToAdd) {
			console.log(`[AddContact] Key '${secretKey}' not found in DB`);
			return res.status(404).json({ error: "User not found with this Key" });
		}

		console.log(`[AddContact] Found user: ${userToAdd.username} (${userToAdd._id})`);

		if (userToAdd._id.toString() === userId.toString()) {
			console.log("[AddContact] User tried to add themselves");
			return res.status(400).json({ error: "You cannot add yourself" });
		}

		// Add to current user's contacts
		const currentUser = await User.findById(userId);

		// Check if already added
		if (currentUser.contacts.includes(userToAdd._id)) {
			console.log("[AddContact] User already in contacts");
			return res.status(400).json({ error: "User already in contacts" });
		}

		currentUser.contacts.push(userToAdd._id);
		await currentUser.save();

		// Mutual Connection
		userToAdd.contacts.push(userId);
		await userToAdd.save();

		console.log("[AddContact] Success");
		res.status(200).json(userToAdd);
	} catch (error) {
		console.error("Error in addContact: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
