# GoPratle – Requirement Posting Flow

A 4-step form for posting an event requirement (looking for an Event Planner, Performer or Crew), with a Node/Express/MongoDB API that stores each requirement tagged with its category.

- **Frontend:** Next.js (App Router, TypeScript), in `frontend/`
- **Backend:** Node.js + Express + Mongoose, in `backend/`
- **Live:** _add Vercel URL here_ · API: _add Render URL here_

## The flow

1. **Event basics**: name, type, single date or a date range, city, optional venue, and the category (planner / performer / crew).
2. **Step 2** and 3. **Step 3** change depending on the category:

   | Category  | Step 2                                        | Step 3                                                  |
   | --------- | --------------------------------------------- | ------------------------------------------------------- |
   | Planner   | services needed, guest count, theme           | budget range, notes                                     |
   | Performer | performer type, genre, no. of performers, languages | duration, who provides sound, budget range, notes |
   | Crew      | list of roles + headcount for each            | shift timings, experience level, pay per person/day, notes |

4. **Review & submit**: summary of everything with Edit links back to each step. On submit it's POSTed to the API and saved.

There's also a `/requirements` page that lists what's been posted, with tabs to filter by category.

## Running locally

Needs Node 20+ and a MongoDB connection string (a free Atlas cluster works, or a local `mongod`).

```bash
# backend
cd backend
cp .env.example .env      # put your MONGODB_URI in here
npm install
npm run dev               # http://localhost:4000

# frontend (new terminal)
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm run dev               # http://localhost:3000
```

Tests (backend): `npm test`. They spin up an in-memory MongoDB, so no database setup needed.

## API

| Method | Path                      | Notes                                                   |
| ------ | ------------------------- | ------------------------------------------------------- |
| POST   | `/api/requirements`       | Create. `201` with the saved doc, `400` with field errors |
| GET    | `/api/requirements`       | List, newest first. `?category=planner\|performer\|crew`, `?page=`, `?limit=` (max 50) |
| GET    | `/api/requirements/:id`   | Single requirement, `404` if missing                    |
| GET    | `/api/health`             | Health check                                            |

Example request:

```json
POST /api/requirements
{
  "eventName": "Tech Summit 2026",
  "eventType": "corporate",
  "startDate": "2026-11-12",
  "endDate": "2026-11-13",
  "location": "Bengaluru",
  "venue": "",
  "category": "crew",
  "details": {
    "roles": [{ "role": "photographer", "count": 2 }, { "role": "security", "count": 4 }],
    "shiftStart": "09:00",
    "shiftEnd": "18:00",
    "experienceLevel": "any",
    "ratePerPersonPerDay": 2500,
    "notes": ""
  }
}
```

Validation error response:

```json
400
{
  "error": "Validation failed",
  "fields": { "endDate": "End date is before start date", "details.budget.max": "Max budget must be at least min" }
}
```

## How the data is stored

Everything goes into one `requirements` collection. I used Mongoose **discriminators** with `category` as the discriminator key, so:

- every document has the common event fields at the top level plus `category: "planner" | "performer" | "crew"`
- the category-specific fields live under `details`, and each category has its own schema for it
- listing by category is just `find({ category })`, backed by an index on `{ category, createdAt }`

I went with one collection instead of three because the list page and any future "all requirements" views need to query across categories, and the shared fields (date, location, status) are the same for all of them.

## Decisions / assumptions

- **Validation happens twice.** The frontend checks each step before letting you move on (quick feedback). The backend validates the whole payload with Zod regardless, since the API shouldn't trust the client. Zod's `discriminatedUnion` on `category` means sending planner fields with `category: "performer"` gets rejected.
- Unknown fields in the request body are stripped, not stored.
- Dates are sent as plain `YYYY-MM-DD` and compared as strings, so timezones don't shift the date. Past dates are rejected (with one day of slack on the server for timezone differences).
- A crew shift that ends "before" it starts (e.g. 18:00 to 02:00) is treated as an overnight shift, not an error.
- Budgets are whole rupees. Budget is a range because most people don't have an exact number.
- The form keeps a draft in `localStorage`, so a refresh doesn't lose what you typed. If you switch category halfway, the other category's answers are kept too in case you switch back. Only the selected category's details are sent.
- No auth. Anyone can post. In the real product this would be tied to a logged-in user.

## Edge cases handled

- End date before start date, past dates, multi-day toggle turned off after picking an end date
- Budget max lower than min, zero/negative numbers, non-numeric input
- Same crew role added twice, removing the last role
- API down or unreachable (shows a message, form data is kept so you can retry)
- Double submit (button is disabled while the request is in flight)
- Malformed JSON, invalid ObjectId, unknown category in the query string

## Limitations / what I'd improve

- Option lists (event types, roles, etc.) are duplicated between frontend and backend. I'd move them, and ideally the Zod schemas, into a shared package so the client and server can't drift.
- No frontend tests yet. I'd add Playwright for the full flow per category, and unit tests for `validateStep`.
- Server-side errors are shown as a list on the review step rather than mapped back to the exact field on the right step.
- Location is free text. A places autocomplete would give cleaner data.
- No auth, no rate limiting, no edit/delete for posted requirements.
