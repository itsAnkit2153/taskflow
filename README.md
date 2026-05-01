# ⚡ TaskFlow — Team Task Manager

A full-stack team task manager with role-based access control (Admin & Member), built with React, Node.js, Express, and MongoDB.

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Deployment | Railway (backend/frontend)|

---



Demo accounts created:
| Email | Password | Role |
|-------|----------|------|
| sib@gmail.com | 123456 | Admin |
| rohan@gmail.com | 123456| Member |
| ankit@gmail.com | 123456 | Member |
| rohan@gmail.com | 123456 | member|
| akki@gmail.com | 123456 | member|

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm start
```

Visit: http://localhost:3000

---

## 📁 Folder Structure

```
taskflow/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/        # Sidebar, Layout
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── pages/             # All page components
│   │   └── utils/             # Axios instance
│   └── public/
│
└── server/                    # Express backend
    ├── controllers/           # Business logic
    ├── middleware/            # auth.js, errorHandler.js
    ├── models/                # User, Project, Task
    ├── routes/                # API routes
    ├── seed.js                # Demo data seeder
    └── index.js               # App entry point
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Get current user |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Auth | List projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Auth | Get project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Auth | List tasks (filtered) |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/:id` | Auth | Get task |
| PUT | `/api/tasks/:id` | Auth* | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

*Members can only update `status` of their own tasks

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:id` | Auth | Get user |
| PUT | `/api/users/:id` | Auth | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard` | Auth | Get stats + recent tasks |

**Query params for `/api/tasks`:**
- `?search=keyword` — search by title
- `?status=pending|in_progress|completed`
- `?priority=low|medium|high`
- `?project=<projectId>`

---

## 🔐 Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| Create/delete projects | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks) |
| View all tasks | ✅ | ❌ (only assigned) |
| Manage users | ✅ | ❌ |

---

## 🚢 Deployment

### Backend on Railway

1. Push `server/` to a GitHub repo
2. Create new Railway project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Set `NODE_ENV=production`

### Frontend on Vercel

1. Push `client/` to GitHub
2. Import to Vercel
3. Set environment variable: `REACT_APP_API_URL=https://your-railway-app.railway.app/api`
4. Deploy

---

## ✨ Features

- ✅ JWT authentication with bcrypt password hashing
- ✅ Role-based access (Admin / Member)
- ✅ Project management with color coding and team members
- ✅ Task management with status, priority, deadlines
- ✅ Dashboard with stats and progress tracking
- ✅ Search & filter tasks
- ✅ Dark mode
- ✅ Responsive design (mobile-first)
- ✅ Overdue task detection
- ✅ Inline status updates
- ✅ Railway deployment ready
