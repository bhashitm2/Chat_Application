import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.join(path.resolve(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
	fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, UPLOADS_DIR);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname) || `.${file.mimetype.split("/")[1]?.split(";")[0] || "bin"}`;
		const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
		cb(null, uniqueName);
	},
});

const fileFilter = (req, file, cb) => {
	// mimetype may include a codecs suffix (e.g. "audio/webm;codecs=opus")
	const type = file.mimetype.split(";")[0];
	if (type.startsWith("image/") || type.startsWith("video/") || type.startsWith("audio/")) {
		cb(null, true);
	} else {
		cb(new Error("Only image, video and audio files are allowed"), false);
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export default upload;
