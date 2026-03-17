# ft_transcendence - API Contract (v1.0)

This document outlines the expected communication between the Next.js Frontend (React components) and the Next.js Backend (API Routes/Database).

## 1. Authentication
*Note: Handled via NextAuth / Auth.js. The backend normalizes the data regardless of the identity provider.*

### `GET /api/auth/session`
Returns the currently logged-in user's session data.
**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "eala-lah",
    "email": "user@example.com",
    "avatarUrl": "[https://example.com/users/eala-lah.jpg](https://example.com/users/eala-lah.jpg)",
    "authProvider": "42", // Can be "42", "google", or "github"
    "isAuthenticated": true,
    "twoFactorEnabled": false
  }
}
```

---

## 2. Users & Profiles

### `GET /api/users/:username`
Fetches the public profile and stats of a specific user.
**Response (200 OK):**
```json
{
  "id": 42,
  "username": "gboggion",
  "avatarUrl": "[https://example.com/users/boggem.jpg](https://example.com/users/boggem.jpg)",
  "status": "ONLINE", 
  "stats": {
    "wins": 15,
    "losses": 3,
    "ladderLevel": 4
  }
}
```

### `PATCH /api/users/me`
Updates the current user's profile (e.g., changing their display name or uploading a custom avatar).
**Request Body:**
```json
{
  "username": "NewDisplayName",
  "avatarUrl": "[https://new-image-url.com/pic.jpg](https://new-image-url.com/pic.jpg)"
}
```
**Response (200 OK):** Returns the updated user object.

---

## 3. Social (Friends & Blocks)

### `GET /api/users/me/friends`
Gets the current user's friend list.
**Response (200 OK):**
```json
[
  { "id": 2, "username": "yingzhan", "status": "ONLINE" },
  { "id": 3, "username": "dvlachos", "status": "IN_GAME" }
]
```

### `POST /api/users/me/friends`
Sends a friend request or adds a friend.
**Request Body:**
```json
{
  "targetUsername": "amakinen"
}
```
**Response (201 Created)**

---

## 4. Match History

### `GET /api/users/:username/matches`
Gets the Pong match history for a specific user.
**Response (200 OK):**
```json
[
  {
    "matchId": 101,
    "date": "2026-03-17T14:30:00Z",
    "player1": "eala-lah",
    "player2": "gboggion",
    "score1": 5,
    "score2": 3,
    "winner": "gboggion"
  }
]
```
