import express from "express";

import {
  joinEvent,
  getJoinedEvents,
  leaveEvent,
} from "../controllers/joinController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All participation routes require authentication
router.use(authMiddleware);

router.get("/", getJoinedEvents);
router.post("/:id", joinEvent);
router.delete("/:id", leaveEvent);

export default router;