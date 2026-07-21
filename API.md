# API Reference

This document lists every route available in the Roamly platform backend. All responses follow a standard envelope format:

```json
{
  "success": true|false,
  "data": { ... },
  "message": "Optional message",
  "errors": [ ... ] 
}
```
*(Paginated endpoints also include `page`, `totalPages`, and `totalItems` keys).*

---

## General
| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/api/health` | No | Returns system health, uptime, and database connection state. |
| GET | `/api/search` | No | Global search across Destinations, Tourist Spots, and Businesses. |

## Auth
| Method | Path | Auth Required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new visitor account. |
| POST | `/api/auth/login` | No | Authenticate and receive a JWT. |
| GET | `/api/auth/me` | Yes | Get the currently logged-in user's profile. |
| PUT | `/api/auth/me` | Yes | Update the currently logged-in user's profile. |
| POST | `/api/auth/logout` | Yes | Logout (client-side token removal hint). |

## Business (Public Discovery)
| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/api/businesses` | No | List all approved businesses (paginated). |
| GET | `/api/businesses/:id` | No* | Get a specific business. *(Non-approved visible only to owner/admin).* |

## Business (Owner Dashboard)
| Method | Path | Auth Required | Description |
|---|---|---|---|
| POST | `/api/business/register` | No | Register a new business owner account and submit a business for review. |
| GET | `/api/business/me` | Yes (owner) | Get the logged-in owner's business details. |
| PUT | `/api/business/me` | Yes (owner) | Update the logged-in owner's business text fields. |
| PUT | `/api/business/me/images`| Yes (owner) | Update the business logo, cover, and gallery images. |
| GET | `/api/business/me/stats` | Yes (owner) | Get stats (listing counts, rating averages) for the owner's business. |

## Listings
| Method | Path | Auth Required | Description |
|---|---|---|---|
| POST | `/api/listings` | Yes (owner) | Create a new listing under the owner's business. |
| GET | `/api/listings/mine` | Yes (owner) | List all listings for the logged-in owner's business. |
| GET | `/api/listings/:id` | No | Get a specific listing. |
| PUT | `/api/listings/:id` | Yes (owner) | Update a specific listing. |
| DELETE | `/api/listings/:id` | Yes (owner) | Delete a listing and its photos. |

## Tourist Spots
| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/api/spots` | No | List all approved tourist spots (paginated). |
| GET | `/api/spots/mine` | Yes | List all tourist spots submitted by the logged-in user (paginated). |
| GET | `/api/spots/:id` | No* | Get a specific spot. *(Non-approved visible only to submitter/admin).* |
| POST | `/api/spots` | Yes | Submit a new tourist spot for admin approval. |
| PUT | `/api/spots/:id` | Yes | Update a tourist spot (resubmits if rejected). |
| DELETE | `/api/spots/:id` | Yes | Delete a tourist spot. |

## Destinations
| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/api/destinations` | No | List all destinations (paginated). |
| GET | `/api/destinations/by-name/:name` | No | Get a destination by exact district name (used by map). |
| GET | `/api/destinations/:id` | No | Get a destination by ID. |
| POST | `/api/destinations` | Yes (admin) | Create a new destination. |
| PUT | `/api/destinations/:id` | Yes (admin) | Update a destination. |
| DELETE | `/api/destinations/:id` | Yes (admin) | Delete a destination (blocked if referenced by spots/businesses). |

## Reviews
| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/api/reviews` | No | List reviews for a specific target (`?targetType=&targetId=`). |
| GET | `/api/reviews/mine` | Yes | List all reviews written by the logged-in user. |
| POST | `/api/reviews` | Yes | Create a new review. |
| PUT | `/api/reviews/:id` | Yes | Edit an existing review (must be the author). |
| DELETE | `/api/reviews/:id` | Yes* | Delete a review (must be the author or admin). |

## Wishlist
| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/api/wishlist/mine` | Yes | List the logged-in user's wishlist items with lightweight summaries. |
| POST | `/api/wishlist` | Yes | Toggle an item in the wishlist (adds if absent, removes if present). |

## Admin
| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Yes (admin) | Get platform-wide overview counts. |
| GET | `/api/admin/businesses` | Yes (admin) | List businesses for moderation (paginated). |
| PUT | `/api/admin/businesses/:id/approve` | Yes (admin) | Approve a pending business. |
| PUT | `/api/admin/businesses/:id/reject` | Yes (admin) | Reject a business (requires reason). |
| GET | `/api/admin/users` | Yes (admin) | List users (paginated). |
| PUT | `/api/admin/users/:id/role` | Yes (admin) | Change a user's role. |
| PUT | `/api/admin/users/:id/deactivate` | Yes (admin) | Soft-delete a user. |
| PUT | `/api/admin/users/:id/reactivate` | Yes (admin) | Restore a soft-deleted user. |
| GET | `/api/admin/spots` | Yes (admin) | List tourist spots for moderation (paginated). |
| PUT | `/api/admin/spots/:id/approve` | Yes (admin) | Approve a pending tourist spot. |
| PUT | `/api/admin/spots/:id/reject` | Yes (admin) | Reject a tourist spot (requires reason). |
| GET | `/api/admin/reviews` | Yes (admin) | List all reviews for moderation (paginated). |
| DELETE | `/api/admin/reviews/:id` | Yes (admin) | Delete any review. |
