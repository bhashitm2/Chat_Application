// Emoji picker data — categories mirror the design's footer strip
// (🕐 recent · 😀 smileys · 🐻 animals · 🍔 food · ⚽ activity · 🚗 travel · 💡 objects · 🎉 celebration · ❤️ hearts)
// Each entry: [emoji, searchable name]

export const EMOJI_CATEGORIES = [
	{
		id: "smileys",
		icon: "😀",
		label: "Smileys",
		emojis: [
			["😀", "grinning"], ["😁", "beaming"], ["😂", "joy tears"], ["🤣", "rofl"],
			["😊", "smiling blush"], ["😍", "heart eyes"], ["😘", "kiss"], ["😎", "cool sunglasses"],
			["🤩", "star struck"], ["🥳", "party face"], ["🤔", "thinking"], ["😴", "sleeping"],
			["😭", "crying"], ["😅", "sweat smile"], ["😉", "wink"], ["🙃", "upside down"],
			["🤗", "hug"], ["🤯", "mind blown"], ["😇", "angel"], ["🥰", "loving"],
			["😜", "tongue wink"], ["🤠", "cowboy"], ["🥺", "pleading"], ["😱", "scream"],
			["😡", "angry"], ["😌", "relieved"], ["🫠", "melting"], ["😬", "grimace"],
			["🙄", "eye roll"], ["😏", "smirk"], ["🤫", "shush"], ["🤤", "drool"],
		],
	},
	{
		id: "animals",
		icon: "🐻",
		label: "Animals & nature",
		emojis: [
			["🐶", "dog"], ["🐱", "cat"], ["🐭", "mouse"], ["🐹", "hamster"],
			["🐰", "rabbit"], ["🦊", "fox"], ["🐻", "bear"], ["🐼", "panda"],
			["🐨", "koala"], ["🐯", "tiger"], ["🦁", "lion"], ["🐮", "cow"],
			["🐷", "pig"], ["🐸", "frog"], ["🐵", "monkey"], ["🐔", "chicken"],
			["🐧", "penguin"], ["🦋", "butterfly"], ["🐢", "turtle"], ["🐙", "octopus"],
			["🦄", "unicorn"], ["🐝", "bee"], ["🌸", "blossom"], ["🌹", "rose"],
			["🌻", "sunflower"], ["🌴", "palm tree"], ["🌵", "cactus"], ["🍀", "clover luck"],
			["🌙", "moon"], ["☀️", "sun"], ["⛅", "cloud sun"], ["🌈", "rainbow"],
		],
	},
	{
		id: "food",
		icon: "🍔",
		label: "Food & drink",
		emojis: [
			["🍎", "apple"], ["🍌", "banana"], ["🍇", "grapes"], ["🍓", "strawberry"],
			["🍉", "watermelon"], ["🥭", "mango"], ["🍍", "pineapple"], ["🥑", "avocado"],
			["🍕", "pizza"], ["🍔", "burger"], ["🍟", "fries"], ["🌭", "hot dog"],
			["🌮", "taco"], ["🍜", "noodles ramen"], ["🍣", "sushi"], ["🍩", "donut"],
			["🍪", "cookie"], ["🎂", "birthday cake"], ["🍰", "cake"], ["🍫", "chocolate"],
			["🍿", "popcorn"], ["🍦", "ice cream"], ["☕", "coffee"], ["🍵", "tea"],
			["🥤", "soda"], ["🧋", "boba"], ["🍺", "beer"], ["🥂", "cheers champagne"],
		],
	},
	{
		id: "activity",
		icon: "⚽",
		label: "Activity",
		emojis: [
			["⚽", "soccer football"], ["🏀", "basketball"], ["🏈", "american football"], ["⚾", "baseball"],
			["🎾", "tennis"], ["🏐", "volleyball"], ["🏏", "cricket"], ["🏸", "badminton"],
			["🥊", "boxing"], ["🏓", "ping pong"], ["⛳", "golf"], ["🎣", "fishing"],
			["🎽", "running"], ["🛹", "skateboard"], ["🎿", "ski"], ["🏊", "swimming"],
			["🚴", "cycling"], ["🧘", "yoga"], ["🎮", "gaming"], ["🎲", "dice game"],
			["🎯", "target darts"], ["♟️", "chess"], ["🎳", "bowling"], ["🎹", "piano"],
			["🎸", "guitar"], ["🥁", "drums"], ["🎤", "microphone sing"], ["🎧", "headphones"],
		],
	},
	{
		id: "travel",
		icon: "🚗",
		label: "Travel & places",
		emojis: [
			["🚗", "car"], ["🚕", "taxi"], ["🚌", "bus"], ["🏎️", "race car"],
			["🚓", "police car"], ["🚑", "ambulance"], ["🚲", "bicycle"], ["🛵", "scooter"],
			["🚆", "train"], ["🚇", "metro"], ["✈️", "airplane"], ["🚀", "rocket"],
			["🛸", "ufo"], ["🚁", "helicopter"], ["⛵", "sailboat"], ["🚢", "ship"],
			["🏠", "house"], ["🏢", "office"], ["🏰", "castle"], ["🗼", "tower"],
			["🗽", "statue liberty"], ["⛰️", "mountain"], ["🏖️", "beach"], ["🏕️", "camping"],
			["🌋", "volcano"], ["🗺️", "map"], ["🧳", "luggage"], ["⛽", "fuel"],
		],
	},
	{
		id: "objects",
		icon: "💡",
		label: "Objects",
		emojis: [
			["💡", "idea bulb"], ["📱", "phone"], ["💻", "laptop"], ["⌚", "watch"],
			["📷", "camera"], ["🎥", "video camera"], ["🔋", "battery"], ["🔌", "plug"],
			["📚", "books"], ["✏️", "pencil"], ["📌", "pin"], ["📎", "paperclip"],
			["🔑", "key"], ["🔒", "lock"], ["🔨", "hammer"], ["🧲", "magnet"],
			["💊", "pill"], ["💰", "money bag"], ["💳", "credit card"], ["💎", "gem diamond"],
			["🕶️", "sunglasses"], ["👑", "crown"], ["🎓", "graduation"], ["⏰", "alarm clock"],
			["🛒", "shopping cart"], ["🧸", "teddy bear"], ["📦", "package"], ["✉️", "envelope mail"],
		],
	},
	{
		id: "celebration",
		icon: "🎉",
		label: "Celebration",
		emojis: [
			["🎉", "party popper"], ["🎊", "confetti"], ["🎈", "balloon"], ["🎁", "gift"],
			["🎄", "christmas tree"], ["🎃", "halloween pumpkin"], ["🎆", "fireworks"], ["✨", "sparkles"],
			["🌟", "glowing star"], ["⭐", "star"], ["🏆", "trophy"], ["🥇", "gold medal"],
			["🥈", "silver medal"], ["🥉", "bronze medal"], ["🎖️", "military medal"], ["🏅", "medal"],
			["👏", "clap"], ["🙌", "raised hands"], ["🥂", "toast"], ["🪅", "pinata"],
			["💯", "hundred"], ["🔥", "fire"], ["👍", "thumbs up"], ["👎", "thumbs down"],
			["🙏", "pray thanks"], ["💪", "strong flex"], ["🤝", "handshake"], ["👀", "eyes"],
		],
	},
	{
		id: "hearts",
		icon: "❤️",
		label: "Hearts",
		emojis: [
			["❤️", "red heart"], ["🧡", "orange heart"], ["💛", "yellow heart"], ["💚", "green heart"],
			["💙", "blue heart"], ["💜", "purple heart"], ["🖤", "black heart"], ["🤍", "white heart"],
			["🤎", "brown heart"], ["💕", "two hearts"], ["💞", "revolving hearts"], ["💓", "beating heart"],
			["💗", "growing heart"], ["💖", "sparkling heart"], ["💘", "cupid heart arrow"], ["💝", "heart gift"],
			["💔", "broken heart"], ["❣️", "heart exclamation"], ["💋", "kiss mark"], ["😻", "cat heart eyes"],
		],
	},
];

const RECENT_KEY = "recent-emojis";

export const getRecentEmojis = () => {
	try {
		const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
		return Array.isArray(stored) ? stored.slice(0, 24) : [];
	} catch {
		return [];
	}
};

export const addRecentEmoji = (emoji) => {
	const next = [emoji, ...getRecentEmojis().filter((e) => e !== emoji)].slice(0, 24);
	localStorage.setItem(RECENT_KEY, JSON.stringify(next));
};
