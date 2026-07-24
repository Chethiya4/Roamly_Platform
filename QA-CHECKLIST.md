# Roamly QA Checklist

This checklist is for manual testing of the Roamly platform end-to-end, simulating real human user journeys across different roles.

## 1. Visitor Journey

### 1.1 Registration & Login
- [ ] Go to `auth.html` (make sure it defaults to the Visitor tab).
- [ ] Fill out the Registration form with a new user (e.g. `visitor@example.com`).
- [ ] Submit. Verify you are redirected to `account.html`.
- [ ] Click Logout (if a button is provided) or clear local storage.
- [ ] Go back to `auth.html` and use the Login form to sign in.
- [ ] Verify you are redirected to the dashboard.

### 1.2 Submitting a Tourist Spot
- [ ] As a logged-in visitor, navigate to a destination page (e.g., `destination-detail.html?id=...`).
- [ ] Submit a new tourist spot (assuming there is a form/button available, or test via API `POST /api/spots` with token if UI is pending).
- [ ] Verify the spot appears in `account.html` under a "My Submissions" tab with a `pending` badge.

### 1.3 Admin Approval (Context Switch)
- [ ] Open a new incognito window and go to `auth.html?tab=admin`.
- [ ] Log in with admin credentials.
- [ ] Verify you are redirected to `admin-dashboard.html`.
- [ ] Find the pending spot in the moderation queue and click **Approve**.

### 1.4 Spot Appearance & Review
- [ ] Back in the visitor window, refresh the destination page.
- [ ] Verify the newly approved spot is now visible in the grid.
- [ ] Click on the spot to view details.
- [ ] Write a 5-star review for the spot.
- [ ] Verify the review appears on the page and the average rating for the spot updates.
- [ ] Check `account.html` to see if the review is listed under your reviews.

### 1.5 Wishlisting
- [ ] On the destination page, click the Wishlist heart icon.
- [ ] Verify the heart toggles to a filled/active state.
- [ ] Go to `account.html` and verify the destination appears in your Wishlist tab.

---

## 2. Business Owner Journey

### 2.1 Registration
- [ ] Go to `auth.html?tab=business`.
- [ ] Click the link to register a new business (redirects to `registration.html`).
- [ ] Fill out the multi-step form completely (ensure you select a valid destination from the dropdown and upload dummy images).
- [ ] Submit the form. Verify a success message indicating the business is pending approval.

### 2.2 Admin Approval (Context Switch)
- [ ] In the admin incognito window (`admin-dashboard.html`), find the new pending business.
- [ ] Click **Approve**.

### 2.3 Dashboard & Listings
- [ ] Back in the business owner window, log in at `auth.html?tab=business`.
- [ ] Verify you are redirected to `business-dashboard.html`.
- [ ] Create a new Listing (e.g., "Standard Room", "Jeep Safari").
- [ ] Verify the listing appears in your active listings table.

### 2.4 Public Business Page
- [ ] Navigate to the public `business-detail.html?id=...` for your business.
- [ ] Verify your cover photo, logo, description, and contact info are correct.
- [ ] Verify the listing you just created is visible to the public.

---

## 3. Search & Map Verification

### 3.1 Map Interaction
- [ ] Go to `map.html`.
- [ ] Click on a district (e.g., Kandy or Colombo).
- [ ] Verify a modal pops up containing real destination data (description, image) fetched from the backend.
- [ ] Verify that approved spots for that district appear as cards inside the modal.

### 3.2 Global Search
- [ ] Go to `index.html`.
- [ ] Type a query into the main search box (e.g., the name of the business or spot you just created).
- [ ] Verify the dropdown populates with categorized results (Destinations, Spots, Businesses).
- [ ] Click a result and verify it navigates to the correct detail page.

---

## 4. Error Handling & Hardening Tests

### 4.1 Validation Errors (400 Bad Request)
- [ ] Try to submit the visitor registration form with an invalid email (e.g., `not-an-email`).
- [ ] Verify the backend returns a clean `400` error with a specific message about the email field.
- [ ] Try to leave a review with a rating of `8`.
- [ ] Verify the backend returns a `400` error (rating must be 1-5).

### 4.2 Malformed ObjectId (400 Bad Request)
- [ ] Navigate to `destination-detail.html?id=invalid-id-format`.
- [ ] Verify the page handles the error gracefully (backend should return `400 Resource not found. Invalid: _id`).

### 4.3 Duplicate Key (409 Conflict)
- [ ] Try to register a new user with an email that is already in use.
- [ ] Verify the backend returns a `409` error with "Email already exists" instead of a 500 stack trace.

### 4.4 Rate Limiting (429 Too Many Requests)
- [ ] Open an API tool (like Postman or curl) or mash the Login button rapidly with wrong credentials.
- [ ] Send more than 10 login requests within 15 minutes.
- [ ] Verify that the 11th request returns a `429` status code with the message "Too many requests from this IP".
