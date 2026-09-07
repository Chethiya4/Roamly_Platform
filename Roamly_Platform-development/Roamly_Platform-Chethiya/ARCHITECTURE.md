# Roamly Backend Architecture Guidelines

This document outlines the architectural conventions, folder structure, and formatting rules that must be followed for the Roamly backend.

## Folder Structure

The repository root should maintain the following consistent directory structure:

- `config/` - Configuration files (e.g., database connection, centralized environment variables).
- `controllers/` - Request handlers containing the core business logic.
- `middleware/` - Express middleware (e.g., authentication, error handling).
- `models/` - Mongoose database schemas and models.
- `routes/` - Express route definitions mapping URLs to controller functions.
- `utils/` - Shared utility functions and helpers (e.g., `asyncHandler`, token generators).
- `scripts/` - Standalone scripts (e.g., database seeding, data migrations).
- `uploads/` - Statically served directory for user-uploaded files (images, PDFs, etc.).

## Route Naming Conventions

- Route mount paths and endpoint definitions must use **plural nouns**. 
- Good: `/api/businesses`, `/api/users`, `/api/listings`
- Bad: `/api/business`, `/api/user-list`, `/api/get-listings`

## Standardized Response Envelope

Every single API endpoint must return a JSON response adhering to one of the following strict envelopes. Do not return primitive arrays or strings at the root of the response.

### 1. Standard Success
Used for fetching a single item, creating an item, or simple operations.
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message string"
}
```

### 2. List / Paginated Success
Used when returning arrays of items.
```json
{
  "success": true,
  "data": [ ... ],
  "totalItems": 10,
  "page": 1,
  "totalPages": 1
}
```
*(Note: `page` and `totalPages` are optional if the endpoint does not implement pagination yet, but `totalItems` or `count` is strongly recommended for lists).*

### 3. Error
Used for any failure (4xx, 5xx). Handled globally by `errorMiddleware.js`.
```json
{
  "success": false,
  "message": "Description of the error"
}
```

## Error Handling

- **Never use manual `try/catch` blocks** inside controller functions.
- Instead, wrap every controller export with the `asyncHandler` utility (`utils/asyncHandler.js`).
- If a controller needs to return an error, either throw an error `throw new Error('Message')` or set the status and throw `res.status(400); throw new Error('Message')`. 
- The centralized `errorHandler` middleware in `server.js` will catch these and format them into the standard error envelope.
