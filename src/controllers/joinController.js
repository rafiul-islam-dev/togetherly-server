
import mongoose from "mongoose";
import Event from "../models/Event.js";
import EventJoin from "../models/EventJoin.js";

// Join an event
export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, userName } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    const event = await Event.findOne({
      _id: id,
      date: { $gt: new Date() },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Upcoming event not found",
      });
    }

    const normalizedEmail = userEmail.trim().toLowerCase();

    try {
      const participation = await EventJoin.create({
        event: id,
        userEmail: normalizedEmail,
        userName: userName || "",
      });

      return res.status(201).json({
        success: true,
        message: "You have joined the event successfully",
        data: participation,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "You have already joined this event",
        });
      }

      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to join event",
    });
  }
};

// Get joined events for a user
export const getJoinedEvents = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    const participations = await EventJoin.find({
      userEmail: email.trim().toLowerCase(),
    })
      .populate("event")
      .lean();

    const joinedEvents = participations
      .filter((item) => item.event !== null)
      .sort(
        (a, b) =>
          new Date(a.event.date).getTime() -
          new Date(b.event.date).getTime()
      );

    return res.status(200).json({
      success: true,
      count: joinedEvents.length,
      data: joinedEvents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch joined events",
    });
  }
};

// Cancel event participation
export const leaveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    const participation = await EventJoin.findOneAndDelete({
      event: id,
      userEmail: userEmail.trim().toLowerCase(),
    });

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Event participation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "You have left the event successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to leave event",
    });
  }
};
