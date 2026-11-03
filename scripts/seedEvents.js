
import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import Event from "../src/models/Event.js";

const SEED_CREATOR_ID = "togetherly-community-seed";
const SEED_CREATOR_EMAIL = "community@togetherly.local";

function getFutureDate(daysFromNow, hour = 10) {
  const date = new Date();

  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);

  return date;
}

const sampleEvents = [
  {
    title: "Community Park Cleanup",
    description:
      "Join local volunteers to clean our neighborhood park, collect litter, and create a healthier environment for everyone.",
    category: "Environment",
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
    location: "Central Community Park",
    date: getFutureDate(5, 9),
  },
  {
    title: "Free Education Workshop",
    description:
      "Help students develop essential digital skills through an interactive learning and mentoring session.",
    category: "Education",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
    location: "Community Learning Center",
    date: getFutureDate(8, 10),
  },
  {
    title: "Neighborhood Health Camp",
    description:
      "Take part in a community health awareness program with basic health screenings and wellness guidance.",
    category: "Health",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    location: "City Health Center",
    date: getFutureDate(12, 9),
  },
  {
    title: "Animal Care & Feeding Drive",
    description:
      "Support local animal welfare volunteers by helping provide food, care, and shelter for animals in need.",
    category: "Animal Welfare",
    image:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80",
    location: "Community Animal Shelter",
    date: getFutureDate(16, 11),
  },
  {
    title: "Tree Plantation Campaign",
    description:
      "Work together with community members to plant trees and promote a greener and more sustainable neighborhood.",
    category: "Environment",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    location: "Green Valley Community",
    date: getFutureDate(20, 8),
  },
  {
    title: "Community Food Distribution",
    description:
      "Volunteer to organize and distribute food packages to families who need support in our community.",
    category: "Community",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    location: "Community Support Center",
    date: getFutureDate(25, 10),
  },
];

async function seedEvents() {
  try {
    await connectDB();

    for (const eventData of sampleEvents) {
      await Event.findOneAndUpdate(
        {
          creatorId: SEED_CREATOR_ID,
          title: eventData.title,
        },
        {
          $set: {
            ...eventData,
            creatorId: SEED_CREATOR_ID,
            creatorEmail: SEED_CREATOR_EMAIL,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`Seeded: ${eventData.title}`);
    }

    console.log("\nSuccessfully seeded 6 sample events!");
  } catch (error) {
    console.error("Event seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedEvents();
