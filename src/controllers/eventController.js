import mongoose from "mongoose";
import Event from "../models/Event.js";
import EventJoin from "../models/EventJoin.js";

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Create Event - Login required
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      image,
      location,
      date,
    } = req.body;

    if (!req.user?.id || !req.user?.email) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user information is missing.",
      });
    }

    const eventDate = new Date(date);

    if (!date || Number.isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid future event date.",
      });
    }

    const event = await Event.create({
      title,
      description,
      category,
      image,
      location,
      date: eventDate,
      creatorId: req.user.id,
      creatorEmail: req.user.email,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: event,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Upcoming Events - Public
export const getUpcomingEvents = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      page = "1",
      limit = "6",
    } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      !Number.isInteger(perPage) ||
      currentPage < 1 ||
      perPage < 1 ||
      perPage > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit value.",
      });
    }

    const filter = {
      date: { $gt: new Date() },
    };

    if (category.trim()) {
      filter.category = {
        $regex: `^${escapeRegex(category.trim())}$`,
        $options: "i",
      };
    }

    if (search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const skip = (currentPage - 1) * perPage;

    const [events, totalEvents] = await Promise.all([
      Event.find(filter)
        .sort({ date: 1 })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Event.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalEvents / perPage);

    res.status(200).json({
      success: true,
      count: events.length,
      pagination: {
        currentPage,
        limit: perPage,
        totalEvents,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Event - Public
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Event - Owner only
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
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

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    if (updateData.date !== undefined) {
      const eventDate = new Date(updateData.date);

      if (
        Number.isNaN(eventDate.getTime()) ||
        eventDate <= new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Event date must be in the future.",
        });
      }

      updateData.date = eventDate;
    }

    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: id,
        creatorId: req.user.id,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not its owner.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      creatorId: req.user.id,
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
};


// Delete Event - Owner only
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const deletedEvent = await Event.findOneAndDelete({
      _id: id,
      creatorId: req.user.id,
    });

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not its owner.",
      });
    }

    await EventJoin.deleteMany({ event: id });

    res.status(200).json({
      success: true,
      message: "Event and its participation records deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};