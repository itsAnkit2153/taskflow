# ⚡ TaskFlow — Team Task Manager

A full-stack team task management web application with role-based access control (Admin & Member).
Users can create projects, assign tasks, and track progress efficiently.

---

## 🚀 Deployed Application

🔗 https://adventurous-benevolence-production-0394.up.railway.app 


## 📌 Problem Statement

Managing team tasks manually can lead to confusion, missed deadlines, and lack of accountability.
TaskFlow provides a structured platform for managing projects, assigning tasks, and tracking progress with role-based control.

---

## ✨ Key Features

* 🔐 Authentication (Signup/Login with JWT)
* 👥 Role-based access (Admin / Member)
* 📁 Project & team management
* ✅ Task assignment with status tracking
* 📊 Dashboard (progress, overdue tasks)
* 🔍 Search & filter functionality
* 🌙 Dark mode support
* 📱 Responsive design

---

## 🛠 Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Frontend   | React 18, Tailwind CSS, React Router |
| Backend    | Node.js, Express.js                  |
| Database   | MongoDB + Mongoose                   |
| Auth       | JWT + bcrypt                         |
| Deployment | Railway                              |

---

## 📸 Screenshots

### Login

<img width="1919" height="915" alt="login" src="https://github.com/user-attachments/assets/425285e2-fe8d-4457-beb9-e91edd1a364f" />


### Tasks

<img width="1919" height="909" alt="task" src="https://github.com/user-attachments/assets/8f756a9e-4f1e-46b2-b491-80c9714fce20" />


### Projects
<img width="1919" height="923" alt="projects" src="https://github.com/user-attachments/assets/bfdb7e7c-54cd-4f40-9b22-5c1ce06933aa" />





---

## 🔐 Demo Credentials

| Role   | Email                                     | Password |
| ------ | ----------------------------------------- | -------- |
| Admin  | [sib@gmail.com](mailto:sib@gmail.com)     | 123456   |
| Member | [rohan@gmail.com](mailto:rohan@gmail.com) | 123456   |
| Member | [ankit@gmail.com](mailto:ankit@gmail.com) | 123456   |
| Member | [akki@gmail.com](mailto:akki@gmail.com)   | 123456   |

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/itsAnkit2153/taskflow.git
cd taskflow
```

### 2. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Environment Variables

Create `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

### 4. Run Locally

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm start
```

---

## 📁 Folder Structure

```
taskflow/
├── client/        # React frontend
├── server/        # Express backend
```

---

## 🔌 API Overview

### Auth

* POST `/api/auth/signup`
* POST `/api/auth/login`
* GET `/api/auth/me`

### Projects

* Admin can create, update, delete projects

### Tasks

* Admin assigns tasks
* Members update their own task status

### Users

* Admin manages users

---

## 🔐 Role-Based Access

| Feature            | Admin | Member        |
| ------------------ | ----- | ------------- |
| Create Projects    | ✅     | ❌             |
| Assign Tasks       | ✅     | ❌             |
| Update Task Status | ✅     | ✅ (own tasks) |
| View Tasks         | All   | Assigned only |

---

## 🚀 Deployment

Deployed on **Railway** (Full-stack)

---

## 📈 Future Improvements

* Real-time updates (WebSockets)
* Notifications system
* File attachments

---

## 👨‍💻 Author

**Ankit Vishwakarma**
GitHub: https://github.com/itsAnkit2153

---
