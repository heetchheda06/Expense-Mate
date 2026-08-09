# 💎 ExpenseMate

> ### AI-Powered Personal Finance Tracking & Optimization Platform

ExpenseMate is a modern, production-ready, full-stack financial tracking and optimization platform designed to help users manage, analyze, and improve their personal finances.

It provides **expense and income tracking, multi-profile management, savings goals, receipt OCR scanning, historical financial analytics, AI-powered recommendations, report generation, and secure authentication** through a modern glassmorphism interface.

---

# 🌐 Live Demo

🚀 **Website:**
https://expense-mate-tracker.web.app/

---

# ✨ Key Features

## 🔐 1. Authentication & Security

* JWT-based authentication
* Secure password hashing using BcryptJS
* Protected routes
* Automatic session recovery
* Secure user profiles
* Forgot Password / Account Recovery
* Password visibility toggle
* Helmet security headers
* Express rate limiting

---

## 👤 2. Multi-Profile Management

ExpenseMate allows users to maintain multiple independent financial profiles.

Users can create up to **5 profiles per account**, such as:

* Personal
* College
* Dorm Room
* Clubs
* Projects

Each profile maintains its own:

* Income
* Expenses
* Budgets
* Savings goals
* Financial analytics
* Transaction history

Profiles also support custom theme styling and cascading deletion.

---

## 💰 3. Expense & Income Tracking

Users can maintain a complete financial ledger containing:

* Expenses
* Income
* Transaction dates
* Categories
* Amounts
* Descriptions

The dashboard provides a centralized view of financial activity.

---

# 📊 4. Advanced Expense Analytics

ExpenseMate provides time-based financial analytics directly from the dashboard.

### 📅 Current Month

Users can view:

* Current month's total expenses
* Category-wise spending
* Current income
* Remaining budget
* Current financial activity

### 📆 Previous Months

Users can access historical expense information from previous months.

This helps users:

* Compare monthly spending
* Identify spending patterns
* Analyze changes in expenses
* Understand financial behavior

### ♾️ Lifetime Data

ExpenseMate also provides access to complete historical financial data.

Users can analyze:

* Lifetime expenses
* Lifetime income
* Total transactions
* Long-term spending patterns
* Overall financial activity

Interactive charts make this information easier to understand.

---

# 🎯 5. Savings Goal Tracker

Users can create and monitor financial goals.

Examples:

* New Laptop
* Emergency Fund
* College Expenses
* Vacation
* Personal Savings

The system tracks progress toward each goal.

---

# 🧾 6. Receipt OCR Scanner

ExpenseMate includes a client-side OCR scanner powered by **Tesseract.js**.

Users can:

1. Upload or drop a receipt.
2. Process the receipt locally.
3. Extract important information.
4. Automatically populate the expense form.

The OCR system attempts to identify:

* Store Name
* Total Amount
* Date

This reduces manual data entry when recording expenses.

---

# 🤖 7. AI Recommendation Hub

ExpenseMate analyzes user spending behavior and provides financial recommendations.

The recommendation engine evaluates:

* Spending thresholds
* Budgets
* High-cost categories
* Expense patterns
* Financial goals

It can provide suggestions such as:

* Reducing unnecessary shopping expenses
* Controlling high-cost categories
* Adjusting monthly budgets
* Improving savings habits

### AI Integration

ExpenseMate supports **OpenAI GPT-3.5** when an API key is configured.

If an OpenAI API key is not available, the application falls back to a **local heuristic recommendation engine**.

---

# 📈 8. Interactive Dashboard

The dashboard provides a centralized financial overview with interactive visualizations.

It includes:

* Total income
* Total expenses
* Remaining balance
* Monthly spending
* Category-wise expenses
* Previous month data
* Lifetime financial data
* Savings goals
* AI recommendations

Charts are implemented using **Chart.js**.

---

# 📄 9. Financial Reports

Users can export their financial information.

Supported formats:

### CSV

Export transaction data into spreadsheet-compatible CSV files.

### PDF

Generate printable financial ledger reports.

---

# 🎨 10. Modern Responsive UI

ExpenseMate uses a modern midnight-themed glassmorphism interface.

UI features include:

* Responsive design
* Glassmorphism components
* Animated interactions
* Interactive charts
* Collapsible sidebar
* Glowing border states
* Modern typography
* Mobile-friendly layout

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Framer Motion
* Axios
* React Chart.js 2
* Tesseract.js
* Lucide Icons

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* BcryptJS
* Helmet
* Express Rate Limit

## AI

* OpenAI GPT-3.5
* Local Heuristic Recommendation Engine

## Deployment & DevOps

* Docker
* Docker Compose
* Vercel
* MongoDB Atlas
* GitHub

---

# 📁 Project Structure

```text
expensemate/
│
├── client/                         # React + Vite Frontend
│   │
│   ├── public/                     # Static assets
│   │
│   ├── src/
│   │   │
│   │   ├── charts/                 # Chart.js configurations
│   │   │
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Sidebar/
│   │   │   ├── Skeletons/
│   │   │   └── Other reusable widgets
│   │   │
│   │   ├── context/                # React Context providers
│   │   │   ├── Auth Context
│   │   │   ├── Profile Context
│   │   │   └── Toast Context
│   │   │
│   │   ├── pages/                  # Application pages
│   │   │   ├── Landing
│   │   │   ├── Authentication
│   │   │   ├── Dashboard
│   │   │   ├── Ledger
│   │   │   ├── Goals
│   │   │   ├── Scanner
│   │   │   └── Settings
│   │   │
│   │   ├── services/
│   │   │   └── api.js              # Axios API configuration
│   │   │
│   │   ├── index.css               # Global styling
│   │   └── App.jsx                 # Application routing
│   │
│   ├── vercel.json                 # Vercel SPA configuration
│   └── package.json
│
├── server/                         # Express Backend
│   │
│   ├── config/                     # Database configuration
│   │   └── db.js
│   │
│   ├── controllers/                # Business logic
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── incomeController.js
│   │   ├── goalController.js
│   │   └── recommendationController.js
│   │
│   ├── middleware/                 # Backend middleware
│   │   ├── auth.js
│   │   └── security middleware
│   │
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── Expense.js
│   │   ├── Income.js
│   │   └── Goal.js
│   │
│   ├── routes/                     # REST API routes
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── incomeRoutes.js
│   │   ├── goalRoutes.js
│   │   └── recommendationRoutes.js
│   │
│   └── package.json
│
├── docker-compose.yml              # Docker configuration
├── package.json                    # Root scripts
└── README.md
```

> **Note:** The exact filenames inside `controllers/`, `routes/`, and other directories may vary depending on the current implementation. The structure above represents the application's major modules.

---

# ⚙️ Prerequisites

Before running ExpenseMate locally, make sure you have:

* **Node.js 18 or higher**
* **npm**
* **MongoDB** locally or MongoDB Atlas
* **Git**

Optional:

* Docker
* Docker Compose
* OpenAI API Key

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

# 🚀 Run ExpenseMate Locally

## 1. Clone the Repository

```bash
git clone https://github.com/heetchheda06/ExpenseMate.git
```

Navigate into the project:

```bash
cd ExpenseMate
```

---

# 📦 2. Install Dependencies

Install root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Return to the root directory:

```bash
cd ..
```

Install backend dependencies:

```bash
cd server
npm install
```

Return to the root:

```bash
cd ..
```

---

# 🔑 3. Configure Environment Variables

ExpenseMate requires environment variables for the backend and frontend.

## Backend Environment

Create:

```text
server/.env
```

Add:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

FRONTEND_URL=http://localhost:5173

OPENAI_API_KEY=your_openai_api_key
```

### Environment Variable Explanation

| Variable         | Purpose                     |
| ---------------- | --------------------------- |
| `PORT`           | Backend server port         |
| `NODE_ENV`       | Application environment     |
| `MONGODB_URI`    | MongoDB database connection |
| `JWT_SECRET`     | JWT token signing secret    |
| `FRONTEND_URL`   | Frontend URL used for CORS  |
| `OPENAI_API_KEY` | Optional OpenAI API key     |

> `OPENAI_API_KEY` is optional. If it is not provided, ExpenseMate uses the local recommendation engine.

---

# 🌐 4. Configure Frontend Environment

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

This tells the React application where the backend API is running.

---

# 🗄️ 5. Configure MongoDB

You can use either:

### Option 1 — Local MongoDB

Install MongoDB locally and make sure the MongoDB service is running.

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/expensemate
```

### Option 2 — MongoDB Atlas

Create a MongoDB Atlas cluster and copy the connection string.

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expensemate
```

---

# ▶️ 6. Start the Backend

Open a terminal:

```bash
cd server
npm run dev
```

The backend should start on:

```text
http://localhost:5000
```

---

# 💻 7. Start the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Vite will provide a local development URL, normally:

```text
http://localhost:5173
```

Open the URL in your browser.

---

# ⚡ Run Frontend & Backend Together

If the root `package.json` contains the configured concurrent development script, you can start both services using:

```bash
npm run dev
```

Otherwise, run the frontend and backend in separate terminals as shown above.

---

# 🐳 Run Using Docker

ExpenseMate also supports Docker Compose.

Make sure Docker Desktop is installed and running.

From the project root:

```bash
docker-compose up --build
```

To stop the containers:

```bash
docker-compose down
```

---

# 🏗️ Production Build

Build the frontend:

```bash
cd client
npm run build
```

The production files will be generated in:

```text
client/dist/
```

---

# ☁️ Deployment

## Frontend – Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Set the project root to:

```text
client
```

4. Select Vite as the framework.
5. Add:

```env
VITE_API_URL=https://your-backend-url.com
```

6. Deploy the application.

---

## Backend – Render / Railway

Deploy the `server` directory as a Web Service.

Configure:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secure_secret
FRONTEND_URL=https://your-frontend-url.com
OPENAI_API_KEY=your_openai_api_key
```

Start command:

```bash
npm start
```

---

# 🔐 Authentication Flow

## Register

1. Open the ExpenseMate application.
2. Select **Register Here**.
3. Enter your:

   * Full Name
   * Email
   * Password
4. Click **Sign Up**.

The password is securely hashed using BcryptJS before being stored.

---

## Login

1. Open the login screen.
2. Enter your email and password.
3. Click **Sign In**.
4. A JWT session is created.
5. You are redirected to the dashboard.

---

# 🔑 Forgot Password

If a user forgets their password:

1. Open the ExpenseMate login page.
2. Select **Forgot Password**.
3. Follow the account recovery process.
4. Create a new password.
5. Log in using the updated credentials.

---

# 📊 Dashboard Workflow

After logging in, users can:

```text
Login
  ↓
Select Profile
  ↓
Dashboard
  ↓
View Current Month
  ↓
View Previous Months
  ↓
View Lifetime Data
  ↓
Analyze Categories
  ↓
Check Goals
  ↓
View AI Recommendations
```

---

# 🧾 Receipt Scanner Workflow

```text
Upload Receipt
      ↓
Tesseract.js OCR
      ↓
Extract Text
      ↓
Regex Processing
      ↓
Store Name + Amount + Date
      ↓
Pre-fill Expense Form
      ↓
Save Transaction
```

---

# 🤖 AI Recommendation Workflow

```text
User Expenses
      ↓
Budget Analysis
      ↓
Category Analysis
      ↓
Spending Threshold Evaluation
      ↓
AI / Local Recommendation Engine
      ↓
Personalized Financial Suggestions
```

---

# 🔌 API Architecture

ExpenseMate follows a REST API architecture.

Major API modules include:

* Authentication
* User Profiles
* Expenses
* Income
* Savings Goals
* Financial Analytics
* AI Recommendations
* Reports

The frontend communicates with the Express backend using **Axios**.

---

# 🛡️ Security

ExpenseMate implements multiple security mechanisms:

* JWT Authentication
* BcryptJS password hashing
* Protected API routes
* Helmet security headers
* Express Rate Limiting
* Environment variables for secrets
* CORS configuration
* Profile-level data isolation

Sensitive credentials such as:

```text
JWT_SECRET
MONGODB_URI
OPENAI_API_KEY
```

should never be committed to GitHub.

---

# 📱 Responsive Design

ExpenseMate is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

The interface adapts the dashboard, charts, sidebar, forms, and financial reports to different screen sizes.

---

# 🚀 Future Enhancements

Possible future improvements include:

* Bank account integration
* UPI transaction synchronization
* Advanced financial forecasting
* Investment tracking
* Recurring expense automation
* Email notifications
* Mobile application
* Advanced AI financial assistant
* Financial anomaly detection
* More detailed monthly comparisons
* Cloud-based receipt storage
* Budget prediction
* Automated savings recommendations

---

# 👨‍💻 Project Highlights

ExpenseMate demonstrates practical implementation of:

* Full-Stack Web Development
* REST API Development
* JWT Authentication
* MongoDB Database Design
* OCR Integration
* AI Integration
* Data Visualization
* Financial Analytics
* Multi-Profile Architecture
* Secure Backend Development
* Docker Containerization
* Cloud Deployment
* Responsive UI Development

---

# 📜 License

Licensed under the **MIT License**.

Built to help users better understand their finances and develop smarter spending habits.

---

# 💎 ExpenseMate

### Track Smarter • Analyze Better • Save More

🌐 **Live Application**

https://expense-mate-tracker.web.app/

---

Made with ❤️ for smarter personal finance management.
