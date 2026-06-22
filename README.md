# ExpenseMate 💎

ExpenseMate is a modern, production-ready, AI-powered financial tracking and optimization platform for personal budgeting. It supports multi-profile isolation, full ledger bookkeeping, savings goal trackers, client-side receipt OCR scanning, and heuristic or OpenAI-powered budgeting advice.

---

## 🚀 Key Features

1. **Authentication Shield:** JWT security tokens, hashed password storage (BcryptJS), protected routes, and auto-session recovery.
2. **5-Profile Cap System:** Manage up to 5 profiles (e.g. Personal, Dorm Room, Clubs, Projects) per account with custom theme styling, budget bounds, and cascading deletions.
3. **Client-side OCR Scanner:** Drop or upload receipts to initiate our local `tesseract.js` worker thread, which uses regex matching to parse the Store name, Total Amount, and Date. Pre-populates the ledger form automatically!
4. **AI recommendation hub:** Runs deep analysis comparing spending thresholds against budgets, identifying high-cost categories (e.g. books or shopping) and suggesting actionable personal saving hacks. Integrates OpenAI GPT-3.5 when an API key is present.
5. **Ledger Reports Export:** Convert transactions lists into CSV spreadsheets or launch printable PDF ledger sheets immediately from the dashboard.
6. **Responsive midnight design:** Stunning glassmorphism UI with Outfit & Inter typography, glowing colored border states, collapse sidebars, and fully animated interactive React Chart.js panels.

---

## 📁 Repository Structure

```
expensemate/
├── client/                     # React + Vite Frontend Client
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── charts/             # Custom ChartJS templates
│   │   ├── components/         # Reusable widgets (Sidebar, Skeletons)
│   │   ├── context/            # Auth, Profile, & Toast systems
│   │   ├── pages/              # Landing, Auth, Dashboard, Ledger, Goals, Scanner, Settings
│   │   ├── services/           # Axios interceptors (api.js)
│   │   ├── index.css           # Global custom classes & Scrollbars
│   │   └── App.jsx             # React routing table
│   ├── vercel.json             # SPA redirects configuration
│   └── package.json
│
├── server/                     # Express Node API Server
│   ├── config/                 # DB connectors
│   ├── controllers/            # Logic for ledger REST endpoints & AI recommendation rules
│   ├── middleware/             # Auth checks & Helmet guards
│   ├── models/                 # Mongoose schemas (User, Profile, Expense, Income, Goal)
│   ├── routes/                 # Express routing mounts
│   └── package.json
│
├── docker-compose.yml          # Container configuration for client/server/mongo
├── package.json                # Monorepo command runner
└── README.md                   # Developer instructions (This document)
```

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Axios, React Chart.js 2, Tesseract.js (OCR), Lucide Icons.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, BcryptJS, Helmet (Security headers), Express-Rate-Limit.
- **Containerization & Deployment:** Docker, Docker Compose, Vercel SPA Configs.

---

## ⚙️ Environment Configuration

### Server Environment (`server/.env`)
Create a `.env` file in `./server` folder:
```env
PORT=5000
NODE_ENV=production

# MongoDB Connection String (Atlas URI)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expensemate?retryWrites=true&w=majority

# JWT Token Signing Secret
JWT_SECRET=super_secret_session_token_key_change_me_in_production

# Deployed Frontend domain to satisfy secure CORS headers
FRONTEND_URL=https://expensemate.vercel.app

# Optional AI Features: OpenAI API Key (falls back to local rules engine if empty)
OPENAI_API_KEY=your_openai_api_key_here
```

### Client Environment (`client/.env`)
Create a `.env` file in `./client` folder:
```env
# Dynamic Base API URL pointing to deployed Render/Railway backend
VITE_API_URL=https://expensemate-backend.onrender.com
```

---

## 📦 Getting Started (Local Development)

### Prerequisites
- Node.js (version 18 or higher)
- MongoDB running locally or Atlas Cloud Cluster
- (Optional) Docker & Docker Compose

### Fast Startup (Root Runner)
1. Clone this repository into your workspace.
2. In the root directory, install all client and server node packages:
   ```bash
   npm run install-all
   ```
3. Boot up the concurrent dev script:
   ```bash
   npm run dev
   ```
- Frontend will open at `http://localhost:8080`
- Backend API will listen on `http://localhost:5000`

### Running with Docker Compose
If you prefer containerized local environments:
```bash
docker-compose up --build
```
This automatically boots a local MongoDB image, builds the Express container, compiles the React client, and wires them together!

---

## 🌐 Production Deployment Steps

### 1. Database (MongoDB Atlas)
1. Create a free shared cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Whitelist connection access (`0.0.0.0/` for simple server deployment integration).
3. Copy the cluster connection URI and set it as `MONGODB_URI` in the backend service variables.

### 2. Backend Deployment (Render or Railway)
1. Connect your GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Choose **Web Service** and choose `./server` as the root directory.
3. Configure the start command as `npm start`.
4. Add backend environment variables (`PORT`, `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` pointing to your Vercel URL).

### 3. Frontend Deployment (Vercel or Netlify)
1. Import the repository into [Vercel](https://vercel.com).
2. Choose the `./client` subdirectory as the root directory.
3. Choose the build template as **Vite**.
4. Configure environment variables (`VITE_API_URL` pointing to your deployed backend URL on Render/Railway).
5. Vercel automatically processes the included `vercel.json` rewrite file to ensure SPA router links work perfectly.

---

## ⚖️ License
Licensed under the MIT License. Built securely for personal financial empowerment.
