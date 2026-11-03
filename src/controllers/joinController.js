import mongoose from "mongoose";
import Event from "../models/Event.js";
import EventJoin from "../models/EventJoin.js";

// Join Event - Login required
export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findOne({
      _id: id,
      date: { $gt: new Date() },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Upcoming event not found.",
      });
    }

    const participation = await EventJoin.create({
      event: id,
      userEmail: req.user.email,
      userName: req.user.name || "",
    });

    res.status(201).json({
      success: true,
      message: "You joined the event successfully.",
      data: participation,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already joined this event.",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Joined Events - Login required
export const getJoinedEvents = async (req, res) => {
  try {
    const participations = await EventJoin.find({
      userEmail: req.user.email,
    })
      .populate("event")
      .lean();

    const joinedEvents = participations
      .filter((item) => item.event)
      .sort(
        (a, b) =>
          new Date(a.event.date).getTime() -
          new Date(b.event.date).getTime()
      );

    res.status(200).json({
      success: true,
      count: joinedEvents.length,
      data: joinedEvents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Leave Event - Login required
export const leaveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const participation = await EventJoin.findOneAndDelete({
      event: id,
      userEmail: req.user.email,
    });

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "You have not joined this event.",
      });
    }

    res.status(200).json({
      success: true,
      message: "You left the event successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};