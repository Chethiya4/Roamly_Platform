# Roamly Platform

Roamly is a comprehensive web platform for exploring destinations, finding tourist spots, discovering local businesses, and managing wishlists and reviews in Sri Lanka. It features specialized dashboards for Visitors, Business Owners, and Admins.

## Getting Started (Local Setup)

Follow these steps to get Roamly running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on the default port (`27017`)

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone <your-repo-url>
cd Roamly_Platform
npm install
```

### 2. Environment Variables
Copy the example environment file to create your local `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in the required values (or leave defaults for local development).

### 3. Database Seeding
Ensure your local MongoDB instance is running. Then, populate the database with the initial required data:
```bash
node scripts/seedDestinations.js
node scripts/seedAdmin.js
```
*This creates the 25 official districts and a default admin account (defined in your `.env`).*

### 4. Start the Server
Start the development server:
```bash
npm start
```
The backend API and the static frontend will be served at `http://localhost:3000`. Navigate there in your browser to view the application.

---

## Architecture Overview

Roamly uses a standard Node.js/Express backend paired with a vanilla HTML/CSS/JS frontend (served statically). 

### Folder Structure
- `/config` — Database connection and environment configurations.
- `/controllers` — Business logic for all routes, separated by module.
- `/middleware` — Authentication (`protect`, `authorize`), File uploading (`multer`), validation, and global error handling.
- `/models` — Mongoose schemas (User, Business, Destination, TouristSpot, Listing, Review, Wishlist).
- `/routes` — Express routers mapping HTTP methods and paths to controllers.
- `/scripts` — Standalone database seeding scripts.
- `/utils` — Reusable helpers (e.g., `asyncHandler`, `generateToken`, `updateRatingStats`).
- `/*.html, /style.css, /script.js` — The static frontend client.

### Standardized Response Envelope
All API responses follow a strict JSON envelope format for consistency on the frontend:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message (mostly used for mutations)"
}
```
Validation failures and standard errors return `{ success: false, message: "...", errors: [...] }`.

### Authentication Flow
Authentication is stateless using **JSON Web Tokens (JWT)**.
- Clients acquire a token via `POST /api/auth/login` or `POST /api/auth/register`.
- The token is sent in the `Authorization: Bearer <token>` header for protected routes.
- The backend `protect` middleware decodes the token and attaches the `User` object to `req.user`.
- The backend `authorize('admin')` middleware acts as a role-based guard.

---

## API Documentation

For a complete list of all backend endpoints, methods, and auth requirements, please read the **[API Reference](API.md)**.

---

## Known Limitations / Before You Deploy

This codebase is currently optimized for local development and testing. Before deploying to a production environment (like Render, Heroku, or DigitalOcean), please address the following:

1. **Ephemeral File Storage**
   File uploads (logos, covers, documents) currently use `Multer` to save files directly to the local `/uploads` directory on disk. Most modern PaaS providers (like Render or Heroku) use ephemeral filesystems, meaning any uploaded images will be permanently deleted every time the server restarts or deploys. 
   **Action Required**: Swap the local Multer storage engine in `middleware/upload.js` to a cloud provider like AWS S3 or Cloudinary.

2. **MongoDB Connection**
   The `.env` file currently points to a local MongoDB instance (`mongodb://localhost...`). 
   **Action Required**: Provision a managed database (like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)) and update the `MONGODB_URI` environment variable on your host.

3. **Production Secrets**
   Ensure `JWT_SECRET` is changed to a long, cryptographically secure random string, and that `ADMIN_PASSWORD` is changed.

4. **CORS Security**
   In `server.js`, `app.use(cors())` is currently completely open. 
   **Action Required**: Restrict CORS to your specific production frontend domains.
