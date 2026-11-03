
import mongoose from "mongoose";
import Event from "../models/Event.js";

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      image,
      location,
      date,
      creatorEmail,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !image ||
      !location ||
      !date ||
      !creatorEmail
    ) {
      return res.status(400).json({
        success: false,
        message: "All event fields are required",
      });
    }

    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid future event date",
      });
    }

    const newEvent = await Event.create({
      title,
      description,
      category,
      image,
      location,
      date: eventDate,
      creatorEmail,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create event",
    });
  }
};

// Get all upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gt: new Date() },
    }).sort({ date: 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch events",
    });
  }
};

// Get a single event
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch event",
    });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { creatorEmail, ...updates } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "image",
      "location",
      "date",
    ];

    const safeUpdates = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        safeUpdates[field] = updates[field];
      }
    }

    if (safeUpdates.date !== undefined) {
      const eventDate = new Date(safeUpdates.date);

      if (
        Number.isNaN(eventDate.getTime()) ||
        eventDate <= new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid future event date",
        });
      }

      safeUpdates.date = eventDate;
    }

    const event = await Event.findOneAndUpdate(
      { _id: id, creatorEmail },
      { $set: safeUpdates },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not the creator",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update event",
    });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { creatorEmail } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    if (!creatorEmail) {
      return res.status(400).json({
        success: false,
        message: "Creator email is required",
      });
    }

    const event = await Event.findOneAndDelete({
      _id: id,
      creatorEmail,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not the creator",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete event",
    });
  }
};
