import express from "express";
import { searchGifs } from "../controllers/gif.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// GET /api/gifs?q=cats — trending when q is empty
router.get("/", protectRoute, searchGifs);

export default router;
