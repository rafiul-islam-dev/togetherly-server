import express from "express";

import {
  createEvent,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getUpcomingEvents);
router.get("/:id", getEventById);

// Protected routes
router.post("/", authMiddleware, createEvent);
router.patch("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);

export default router;