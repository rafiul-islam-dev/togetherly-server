
import express from "express";

import {
  joinEvent,
  getJoinedEvents,
  leaveEvent,
} from "../controllers/joinController.js";

const router = express.Router();

// Get all joined events of a user
router.get("/", getJoinedEvents);

// Join an event
router.post("/:id", joinEvent);

// Leave an event
router.delete("/:id", leaveEvent);

export default router;
