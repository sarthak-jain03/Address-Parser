# UrbanDash Customer Address Parsing System

A quick-commerce address parsing system for **UrbanDash Technologies**, designed to parse unstructured Indian delivery addresses into standardized, validated JSON records, flag edge cases for dark store routing, and store records in MongoDB Atlas.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas (Mongoose ORM)
- **AI Model**: Fireworks AI API (`accounts/fireworks/models/deepseek-v4p1-flash`)

## Prerequisites

- Node.js 18+
- MongoDB connection string
- Fireworks AI API Key

## Quick Start

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Ensure FIREWORKS_API_KEY and MONGODB_URI are set in .env
npm install
npm run dev
```

The backend server will run on `http://localhost:3001`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend application will run on `http://localhost:5173`.

## Documentation & Submission

- **[DESIGN_DOC.md](./DESIGN_DOC.md)**: Architecture design document, DB schema, API specs, prompt strategy, and Indian address edge cases.
- **[SUBMISSION.md](./SUBMISSION.md)**: Submission details, 4-6 line executive summary, and complete engineered prompt templates.
