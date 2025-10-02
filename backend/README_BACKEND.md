# Backend Setup & Integration Guide

This document explains how to stand up the MongoDB database, seed it with minimum required data, run the Express API, and integrate with the React frontend.

## 1. Prerequisites
- Node.js 18+
- npm
- MongoDB Atlas account (preferred) OR Docker (for local Mongo)

## 2. Environment Variables
Create a `.env` file in project root:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/imy220project?retryWrites=true&w=majority&appName=imy220project
PORT=8000
```
See `.env.example` for template.

## 3. Install Dependencies
```
npm install
```

## 4. Create MongoDB Atlas Cluster (Preferred)
1. Go to https://cloud.mongodb.com/
2. Create free project + free M0 cluster.
3. Choose a cloud provider + region near you.
4. Create a database user (username/password) with read/writeAnyDatabase.
5. Add IP Access List entry: `0.0.0.0/0` (or your IP specifically for security).
6. Obtain connection string: `mongodb+srv://<user>:<pass>@<cluster-host>/imy220project?retryWrites=true&w=majority&appName=imy220project`
7. Put it into `.env` as `MONGODB_URI`.

## 5. Alternative: Local Mongo via Docker
```
docker run -d --name imy220-mongo -p 27017:27017 -e MONGO_INITDB_DATABASE=imy220project mongo:7
```
Connection string example for local:
```
MONGODB_URI=mongodb://localhost:27017/imy220project
```

## 6. Seed Minimum Data
Seeds 2 users, 2 projects, 3+ check-ins.
```
npm run seed
```
If you change schemas and need a clean slate, run seed again (it clears Users & Projects collections).

## 7. Run the Backend Server
```
npm run dev:server
```
Server starts on `PORT` (default 8000). Example test:
```
GET http://localhost:8000/api/bootstrap
```

## 8. API Overview
| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| POST | /api/login | Auth stub |
| POST | /api/signup | Auth stub |
| GET | /api/bootstrap | Initial users + projects |
| GET | /api/users | List users |
| GET | /api/users/search?q= | Search users |
| GET | /api/users/:id | Get user |
| POST | /api/users | Create user |
| PATCH | /api/users/:id | Update user |
| GET | /api/projects | List projects |
| GET | /api/projects/search/checkins?q= | Search check-ins |
| GET | /api/projects/:id | Project detail |
| POST | /api/projects | Create project |
| POST | /api/projects/:id/checkins | Add check-in |
| PATCH | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |

## 9. Frontend Integration
`ProjectsContext` calls `/api/bootstrap` on mount. To persist actions, update context methods to call corresponding API endpoints (e.g., POST /api/projects on create). After mutation, either re-fetch the resource or optimistically update local state.

## 10. Adding Checkout/Return (Next Step)
Add endpoints:
```
PATCH /api/projects/:id/checkout  { userId }
PATCH /api/projects/:id/return    { }
```
Update project fields: `isAvailable`, `checkedOutBy`, and push activity objects.

## 11. Testing with Postman / Hoppscotch
1. Seed DB.
2. Create new project: POST /api/projects
3. Add check-in: POST /api/projects/:id/checkins
4. Search check-ins: GET /api/projects/search/checkins?q=react
5. Update user: PATCH /api/users/:id

## 12. Production Notes
- Move version bump logic to backend on check-in for atomicity.
- Add indexes to high-search fields (done for hashtags & type).
- Add auth (JWT) later if required.

## 13. Troubleshooting
| Issue | Fix |
| ----- | --- |
| `Missing MONGODB_URI` | Ensure `.env` exists & restart server |
| `MongoNetworkError` | Check IP whitelist / firewall / connection string |
| Empty bootstrap | Did you run `npm run seed`? |
| CORS errors | Confirm frontend dev server origin; adjust `cors()` config |

## 14. Marking Checklist Mapping
- db_creation: Collections = users, projects (+ friendships optional) ✔
- db_population: Seed script inserts 2 users, 2 projects, 3+ check-ins ✔
- backend_implementation: Routes & CRUD JSON endpoints ✔ (checkout/return & friendships pending optional)
- api_encapsulation: Repositories abstract DB logic ✔
- integration_guidelines: Frontend only calls API; no direct Mongo usage ✔
- db_connection: `.env.example` + connect script; requires you to supply real URI ✔
- additional_requirements: Styling (Tailwind foundation) + async bootstrap ✔

## 15. Next Enhancements (Optional)
- Add friendship routes
- Implement checkout/return endpoints
- Convert inline error handling to async wrapper to reduce repetition
- Add pagination & rate limiting

---
End of backend guide.
