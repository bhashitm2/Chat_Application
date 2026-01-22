import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSidebar, addContact } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);
router.post("/add", protectRoute, addContact);

export default router;
