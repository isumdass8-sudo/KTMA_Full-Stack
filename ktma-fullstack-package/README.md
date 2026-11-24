# KTMA — Kandy Tourism Marketing Association (Full-Stack Package)

This package contains the complete, deployable full-stack application for the **Kandy Tourism Marketing Association (KTMA)** with:
- **Backend**: Node.js & Express REST API with file upload support, MySQL connection, and Admin authentication.
- **Frontend**: React (Vite) + Tailwind CSS client with responsive UI, Admin Login gate, and Admin Dashboard for Events, Gallery photos, and Members.
- **Database**: MySQL schema + complete initial seed data.

---

## 📁 Package Structure

```text
ktma-fullstack-package/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # MySQL pool connection
│   │   ├── controllers/      # Events, Gallery, Members, Contact controllers
│   │   ├── routes/           # REST endpoints
│   │   ├── utils/            # Base64 photo storage helper (saves to /uploads)
│   │   ├── app.js            # Express app configuration & static uploads
│   │   └── server.js         # Entry point
│   ├── uploads/              # Server folder where uploaded photos are stored
│   ├── .env.example          # Environment variables template
│   └── package.json
│
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── public/               # Favicon and static files
│   ├── src/
│   │   ├── assets/           # Bundled images & logos
│   │   ├── components/       # UI components & AdminLogin.jsx
│   │   ├── context/          # DataContext.jsx (dual API + offline fallback)
│   │   ├── data/             # Static fallback seed data
│   │   ├── pages/            # Home, About, Members, Events, Gallery, Contact, Admin
│   │   └── utils/            # api.js, imageCompressor.js, storage.js
│   ├── .env.example          # VITE_API_URL template
│   ├── index.html
│   └── package.json
│
└── database/                 # MySQL Database
    └── schema.sql            # Tables (events, gallery, committee, general_members) + seed data
```

---

## 🚀 Setup & Deployment Instructions

### 1. Database Setup (MySQL)
1. Ensure MySQL is running on your server.
2. Create and seed the database using `database/schema.sql`:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *(Or import `database/schema.sql` via phpMyAdmin / MySQL Workbench).*

---

### 2. Backend Setup (`backend/`)
1. Open the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create `.env` file based on `.env.example`:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ktma_db
   ```
3. Start the backend:
   ```bash
   npm start
   # or for development:
   npm run dev
   ```
   Confirm backend is running at: `http://localhost:5000/api/health`

---

### 3. Frontend Setup (`frontend/`)
1. Open the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Create `.env` file (pointing to your backend API):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   *(In production, set `VITE_API_URL` to your production backend domain, e.g., `https://api.kandytourism.lk/api`).*

3. Run locally:
   ```bash
   npm run dev
   ```
4. Or build for production deployment:
   ```bash
   npm run build
   ```
   The production-ready static files will be generated in `frontend/dist/`.

---

## 🔐 Admin Portal Access
- Access URL: `/admin` (or `/login`)
- **Default Username:** `admin`
- **Default Password:** `admin123` (or `ktma2026`)

When logged in, the admin can:
- **Add Events**: with cover photo and multi-photo event gallery.
- **Upload Gallery Photos**: single or batch upload with category selection.
- **Manage Members**: Executive committee portraits & roles + General membership roster.
- Any changes made by the admin are automatically saved to the MySQL database and server `/uploads/` folder, visible live to all visitors globally.
