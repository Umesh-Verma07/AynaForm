# AynaForm Backend

A production-ready Node.js/Express/MongoDB backend for the AynaForm feedback platform.

## Features

- JWT-based admin authentication (register/login)
- Secure password hashing (bcrypt)
- Mongoose models: User, Form, Response
- CRUD for forms (protected)
- Public form access and response submission
- CSV export for responses
- Input validation (Joi)
- Centralized error handling
- Comprehensive tests (Jest + Supertest)

## Setup

1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run locally:

   ```bash
   npm run dev
   ```

4. Run tests:

   ```bash
   npm test
   ```

6. See [../README.md](../README.md) for full-stack setup. 