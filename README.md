# InternPortal — Full Stack Setup Guide

## Project Structure
```
internship-dashboard/
├── app/                  ← Next.js frontend pages
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   ├── tasks/
│   ├── attendance/
│   ├── journals/
│   ├── analytics/
│   ├── calendar/
│   ├── messages/
│   ├── mentor/
│   └── settings/
├── backend/              ← Flask + MongoDB backend
│   ├── app.py            ← Main Flask app (all routes registered)
│   ├── routes/           ← auth, tasks, journals, attendance, mentor, messages, calendar, settings
│   ├── models/           ← MongoDB collection helpers
│   ├── middleware/        ← JWT auth middleware
│   ├── config/           ← database.py (MongoDB connection)
│   ├── .env              ← environment variables
│   └── requirements.txt
└── lib/
    └── api.js            ← Frontend API utility (all backend calls)
```

---

## 1. Start the Backend (Flask)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the server
python app.py
```
Backend runs at: **http://localhost:5000**

---

## 2. Start the Frontend (Next.js)

```bash
# From project root
npm run dev
```
Frontend runs at: **http://localhost:3000**

---

## 3. Backend API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login + get JWT token |
| GET | /auth/profile/:id | Get user profile |
| PUT | /auth/profile/:id | Update profile |
| GET | /tasks/?userId= | Get all tasks |
| POST | /tasks/ | Create task |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |
| PATCH | /tasks/:id/status | Update task status |
| POST | /attendance/checkin | Check in |
| PATCH | /attendance/checkout/:id | Check out |
| GET | /attendance/all?userId= | Get attendance records |
| GET | /attendance/stats?userId= | Get attendance stats |
| GET | /journals/?userId= | Get all journals |
| POST | /journals/ | Create journal |
| POST | /journals/:id/comment | Add mentor comment |
| GET | /mentor/all | Get all mentors |
| POST | /mentor/connect/:id | Connect with mentor |
| POST | /messages/send | Send message |
| GET | /messages/conversation | Get chat between 2 users |
| GET | /messages/conversations/:userId | Get all conversations |
| GET | /calendar/all?userId= | Get events |
| POST | /calendar/add | Add event |
| GET | /calendar/upcoming | Get upcoming events |
| GET | /settings/:userId | Get settings |
| PUT | /settings/:userId | Update settings |

---

## 4. MongoDB
Make sure MongoDB is running locally:
```bash
mongod
```
Or update `MONGO_URI` in `backend/.env` to use MongoDB Atlas.
