
import express from "express";

import {
  createEvent,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();

router.post("/", createEvent);

router.get("/", getUpcomingEvents);

router.get("/:id", getEventById);

router.patch("/:id", updateEvent);

router.delete("/:id", deleteEvent);

export default router;
