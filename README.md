# ExpenseMate 💎

ExpenseMate is a modern, production-ready, AI-powered financial tracking and optimization platform for personal budgeting. It supports multi-profile isolation, full ledger bookkeeping, savings goal trackers, client-side receipt OCR scanning, historical expense analytics, and heuristic or OpenAI-powered budgeting advice.

---

## 🚀 Key Features

1. **Authentication Shield:** JWT security tokens, hashed password storage (BcryptJS), protected routes, auto-session recovery, and secure password reset/forgot password functionality.
2. **5-Profile Cap System:** Manage up to 5 profiles (e.g. Personal, Dorm Room, Clubs, Projects) per account with custom theme styling, budget bounds, and cascading deletions.
3. **Client-side OCR Scanner:** Drop or upload receipts to initiate our local `tesseract.js` worker thread, which uses regex matching to parse the Store name, Total Amount, and Date. Pre-populates the ledger form automatically!
4. **AI Recommendation Hub:** Runs deep analysis comparing spending thresholds against budgets, identifying high-cost categories (e.g. books or shopping) and suggesting actionable personal saving hacks. Integrates OpenAI GPT-3.5 when an API key is present.
5. **Complete Expense History:** Dashboard provides expense insights for the **current month, previous months, and lifetime financial data**, allowing users to analyze their spending patterns over different time periods.
6. **Historical Financial Analytics:** Users can review past monthly expenses and compare spending trends with their current month's financial activity.
7. **Ledger Reports Export:** Convert transaction lists into CSV spreadsheets or launch printable PDF ledger sheets immediately from the dashboard.
8. **Savings Goal Tracking:** Create and monitor financial goals while tracking progress toward saving targets.
9. **Forgot Password:** Added a secure **Forgot Password** flow that allows users to recover access to their ExpenseMate account when they forget their password.
10. **Responsive Midnight Design:** Stunning glassmorphism UI with Outfit & Inter typography, glowing colored border states, collapse sidebars, and fully animated interactive React Chart.js panels.

---

## 📊 Dashboard & Expense Analytics

ExpenseMate provides a comprehensive financial dashboard that allows users to understand their spending across different time periods.

### 📅 Current Month

* View total expenses for the current month
* Analyze spending by category
* Monitor budgets and financial goals
* View interactive charts and financial insights

### 📆 Previous Months

* Access expense data from previous months
* Analyze historical spending patterns
* Compare previous monthly expenses with current spending
* Identify changes in spending behavior over time

### ♾️ Lifetime Financial Data

* View complete historical expense data
* Analyze overall spending trends
* Track total financial activity across the account
* Understand long-term spending patterns

The dashboard combines these time-based insights with interactive charts and AI-powered recommendations to help users make better financial decisions.

---

## 🔐 Authentication & Account Recovery

ExpenseMate provides secure authentication and account recovery features.

### Authentication

* JWT-based authentication
* BcryptJS password hashing
* Protected routes
* Automatic session recovery
* Secure user profiles

### Forgot Password

Users who forget their password can use the **Forgot Password** option available on the login screen to initiate the account recovery process and regain access to their ExpenseMate account.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Axios, React Chart.js 2, Tesseract.js (OCR), Lucide Icons.
* **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, BcryptJS, Helmet (Security headers), Express-Rate-Limit.
* **AI:** OpenAI GPT-3.5 with a local heuristic recommendation fallback.
* **Containerization & Deployment:** Docker, Docker Compose, Vercel SPA Configs.

---

## ✨ Core Highlights

* 💰 Personal expense & income tracking
* 👤 Multi-profile financial management
* 📅 Current month expense analytics
* 📆 Previous month expense history
* ♾️ Lifetime financial data
* 📊 Interactive financial dashboards
* 🎯 Savings goal tracking
* 🧾 Receipt scanning with OCR
* 🤖 AI-powered spending recommendations
* 🔐 JWT authentication
* 🔑 Forgot password & account recovery
* 📄 CSV & PDF financial reports
* 📈 Interactive Chart.js visualizations
* 🛡️ Protected API routes
* 🐳 Dockerized deployment support
* 📱 Responsive glassmorphism interface

---

## ⚖️ License

Licensed under the MIT License. Built securely for personal financial empowerment.
