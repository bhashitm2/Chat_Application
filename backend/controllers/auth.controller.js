import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

const generateSecretKey = () => {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < 6; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};

export const signup = async (req, res) => {
	try {
		const { fullName, username, password, confirmPassword, gender } = req.body;

		if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords don't match" });
		}

		const user = await User.findOne({ username });

		if (user) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// https://avatar-placeholder.iran.liara.run/
		// FALLBACK: https://ui-avatars.com/ due to DNS blocking issues with liara.run

		const boyProfilePic = `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`;
		const girlProfilePic = `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`;

		let secretKey = generateSecretKey();
		let isKeyUnique = false;
		while (!isKeyUnique) {
			const existingUser = await User.findOne({ secretKey });
			if (!existingUser) {
				isKeyUnique = true;
			} else {
				secretKey = generateSecretKey();
			}
		}

		const newUser = new User({
			fullName,
			username,
			password: hashedPassword,
			gender,
			profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
			secretKey,
			contacts: [],
		});

		if (newUser) {
			// Generate JWT token here
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				profilePic: newUser.profilePic,
				secretKey: newUser.secretKey,
				contacts: newUser.contacts,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}


		// Check for legacy users without secretKey
		if (!user.secretKey) {
			let secretKey = generateSecretKey();
			let isKeyUnique = false;
			while (!isKeyUnique) {
				const existingUser = await User.findOne({ secretKey });
				if (!existingUser) {
					isKeyUnique = true;
				} else {
					secretKey = generateSecretKey();
				}
			}
			user.secretKey = secretKey;
			user.contacts = user.contacts || [];
			await user.save();
		}

		// FIX: Auto-repair broken profile pictures from liara.run
		if (user.profilePic.includes("liara.run")) {
			user.profilePic = `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`;
			await user.save();
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic,
			secretKey: user.secretKey,
			contacts: user.contacts,
		});
	} catch (error) {
		console.error("Error in login controller:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
