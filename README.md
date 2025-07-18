# AynaForm

A full-stack feedback platform built with the MERN stack and modern web technologies.

## Tech Stack

- **Frontend:** React, Tailwind CSS, Axios, Recharts
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Joi
- **Testing:** Jest, Supertest

## Features
- Admin authentication (JWT)
- Dynamic form builder (text/MCQ)
- Public form sharing and response collection
- Response analytics (charts, CSV export)
- Mobile-responsive, animated UI
- Robust validation and error handling

## Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)

## Local Setup

1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd FeedNest
   ```

2. **Configure environment variables:**
   - Copy `backend/.env.example` to `backend/.env` and fill in values if needed.
   - Copy `frontend/env` to `frontend/.env` and set your API URL if needed.

3. **Install dependencies and start services:**
   ```bash
   # Backend
   cd backend
   npm install
   npm start

   # Frontend (in a new terminal)
   cd frontend
   npm install
   npm run dev
   ```
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:5000/api](http://localhost:5000/api)
   - MongoDB: [localhost:27017](localhost:27017)

4. **Seed sample forms:**
   ```bash
   node scripts/seedForms.js
   ```

5. **Run tests:**
   ```bash
   cd backend
   npm install
   npm test
   ```

6. **Export responses as CSV:**
   ```bash
   ./scripts/exportCSV.sh <formId> <JWT_TOKEN>
   ```

## Production & High-Concurrency Deployment

FeedNest is designed for scalability, but for true high-concurrency (10,000+ users):

- **Backend Scaling:**
  - Use Node.js clustering (e.g., PM2) or run multiple containers behind a load balancer (Nginx, AWS ELB).
  - Example (PM2):
    ```bash
    npm install -g pm2
    pm2 start src/app.js -i max
    ```
- **Database Scaling:**
  - Use a managed MongoDB cluster (e.g., MongoDB Atlas) with replica sets and sharding for high write throughput.
- **Rate Limiting:**
  - Add `express-rate-limit` middleware to prevent abuse and smooth out spikes.
- **Queueing (Optional):**
  - For mission-critical writes, use a message queue (RabbitMQ, Kafka, SQS) to buffer and process submissions.
- **Monitoring:**
  - Use tools like PM2, New Relic, Datadog, or MongoDB Atlas monitoring.

## Troubleshooting

- **Port Already in Use:**
  - Stop other processes using the port or change the port in `.env`.
- **MongoDB Driver Warnings:**
  - The code is updated for latest drivers; warnings should not appear.
- **Vite/React Warnings:**
  - Ensure all entry points and file extensions are correct. See the frontend README for more.
- **Validation Errors:**
  - The API now returns all validation errors in a consistent format for easier debugging.

## Project Structure

See the codebase for a detailed structure. Key folders:
- `backend/` — Express API, models, controllers, tests
- `frontend/` — React app, pages, components, styles
- `scripts/` — Seeding and export scripts

## License

MIT