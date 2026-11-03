
import express from "express";

import {
  createEvent,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from "../controllers/eventController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// Public routes
router.get("/", getUpcomingEvents);

// Private route — must be before /:id
router.get("/mine", authMiddleware, getMyEvents);

// Public dynamic route
router.get("/:id", getEventById);

// Protected create, update and delete routes
router.post("/", authMiddleware, createEvent);
router.patch("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);


export default router;
