
import mongoose from "mongoose";

const eventJoinSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    userName: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// একই user একই event-এ একবারই join করতে পারবে
eventJoinSchema.index(
  { event: 1, userEmail: 1 },
  { unique: true }
);

const EventJoin =
  mongoose.models.EventJoin ||
  mongoose.model("EventJoin", eventJoinSchema);

export default EventJoin;
