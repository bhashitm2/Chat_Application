import express from "express";
import {
	sendFriendRequest,
	getFriendRequests,
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
} from "../controllers/friend.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/requests", protectRoute, getFriendRequests);
router.post("/request/:id", protectRoute, sendFriendRequest);
router.post("/accept/:requestId", protectRoute, acceptFriendRequest);
router.post("/reject/:requestId", protectRoute, rejectFriendRequest);
router.delete("/:id", protectRoute, removeFriend);

export default router;
