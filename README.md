# Togetherly Server

Togetherly is a community-driven volunteering events platform. This repository contains the backend REST API for managing events, user participation, and authentication-related operations.

## Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- JavaScript

## Features

- **Event Management:** Create, retrieve, update, and delete community events.
- **Upcoming Events:** Retrieve upcoming events with pagination.
- **Event Details:** Retrieve individual event information.
- **My Events:** Retrieve events created by the authenticated user.
- **Join Events:** Allow users to participate in community events.
- **Joined Events:** Retrieve events joined by a user.
- **Leave Events:** Allow users to leave joined events.
- **Authorization:** Protect private routes and restrict event updates and deletion to their owners.
- **Search & Filtering:** Search events and filter them by category.

## Project Structure

```text
tohetherly-server/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── index.js
├── scripts/
├── .env
├── package.json
└── README.md
```

## Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB Atlas account or a local MongoDB instance
- Git

## Installation

Clone the repository:

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
cd tohetherly-server
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Add any additional environment variables required by your actual authentication and middleware configuration.

## Run the Server

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

The API server runs at:

`http://localhost:5000`

## API Endpoints

### Events

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Get upcoming events |
| GET | `/api/events/:id` | Get event details |
| GET | `/api/events/mine` | Get authenticated user's events |
| POST | `/api/events` | Create an event |
| PATCH | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |

### Event Participation

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/joins` | Get joined events |
| POST | `/api/joins/:id` | Join an event |
| DELETE | `/api/joins/:id` | Leave an event |

**Note:** Private endpoints require valid authentication. Event updates and deletion are restricted to the event owner.

## Deployment

The backend is intended to be deployed on Render.

Configure the required environment variables in the deployment platform before starting the production server.

## Project Purpose

Togetherly makes it easier for people to discover and organize local volunteering activities and participate in meaningful community development initiatives.

---

**Built with ❤️ for stronger communities.**