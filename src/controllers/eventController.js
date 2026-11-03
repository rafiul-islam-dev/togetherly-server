
import mongoose from "mongoose";
import Event from "../models/Event.js";
import EventJoin from "../models/EventJoin.js";

// Escape special characters in search input
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

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

// Get upcoming events with search, category filter and pagination
export const getUpcomingEvents = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      page = "1",
      limit = "6",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      !Number.isInteger(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1 ||
      limitNumber > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit. Limit must be between 1 and 50.",
      });
    }

    const filter = {
      date: { $gt: new Date() },
    };

    if (typeof category === "string" && category.trim()) {
      filter.category = {
        $regex: `^${escapeRegex(category.trim())}$`,
        $options: "i",
      };
    }

    if (typeof search === "string" && search.trim()) {
      const searchRegex = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [events, totalEvents] = await Promise.all([
      Event.find(filter)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Event.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalEvents / limitNumber);

    return res.status(200).json({
      success: true,
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalEvents,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
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

    if (Object.keys(safeUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (!creatorEmail) {
      return res.status(400).json({
        success: false,
        message: "Creator email is required",
      });
    }

    const event = await Event.findOneAndUpdate(
      {
        _id: id,
        creatorEmail: creatorEmail.trim().toLowerCase(),
      },
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

// Delete an event and its participation records
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
      creatorEmail: creatorEmail.trim().toLowerCase(),
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not the creator",
      });
    }

    // Remove all joins related to this event
    await EventJoin.deleteMany({ event: id });

    return res.status(200).json({
      success: true,
      message: "Event and its participation records deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete event",
    });
  }
};
