# 💸 Smart Expense Manager

A full-stack expense management application built to help users track expenses, manage shared group spending, monitor settlements, and understand their financial habits through analytics.

## ✨ Features

- **User Authentication** — Secure signup, login, and protected routes.
- **Financial Dashboard** — Get an overview of your expenses and financial activity.
- **Expense Management** — Create, view, update, and delete expenses.
- **Group Expense Sharing** — Manage groups and track shared expenses.
- **Settlements** — View balances and manage payments between group members.
- **Analytics** — Visualize spending patterns using interactive charts.
- **Budget Management** — Organize and monitor budgets.
- **Recurring Expenses** — Manage regularly occurring expenses.
- **Notifications** — Stay informed about relevant activities.
- **Profile & Settings** — Access your account details and application settings.

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs

## 📁 Project Structure

```text
smart-expense-manager/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── context/
│   └── App.tsx
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── app.js
│   ├── index.js
│   └── .env.example
├── public/
├── .gitignore
├── package.json
├── package-lock.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## ⚙️ Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) — preferably a compatible LTS version.
- npm — included with Node.js.
- [MongoDB](https://www.mongodb.com/) — either a local MongoDB instance or a MongoDB Atlas database.
- [Git](https://git-scm.com/) — for version control.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/smart-expense-manager.git
```

Navigate into the project directory:

```bash
cd smart-expense-manager
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file for the backend.

**Windows PowerShell:**

```powershell
Copy-Item server/.env.example server/.env
```

Open `server/.env` and configure the following values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-expense-manager
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Update `MONGODB_URI` with your MongoDB Atlas connection string if you use Atlas instead of a local database.

**Important:** Replace the example JWT secret with a strong, private value. Never commit your actual `.env` file or expose database credentials.

### 4. Start the backend server

Open a terminal in the project root and run:

```bash
npm run dev:server
```

The backend starts on:

```text
http://localhost:5000
```

The API base path is:

```text
http://localhost:5000/api
```

Ensure your MongoDB database is accessible before starting the server.

### 5. Start the frontend

Open a **second terminal** in the project root and run:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

The frontend uses `http://localhost:5000/api` as its default API URL. If you need to override it, create a root-level `.env.local` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Keep local environment files private.

## 🧪 Available Scripts

Run these commands from the project root.

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run dev:server` | Starts the backend with automatic restart |
| `npm run server` | Starts the backend server |
| `npm run build` | Creates the production frontend build |
| `npm run preview` | Previews the production frontend build |
| `npm run typecheck` | Checks TypeScript types |
| `npm run lint` | Runs ESLint |
| `npm test` | Runs the existing backend tests |

## 🔐 Security

- Authentication uses JSON Web Tokens.
- Passwords are handled using bcryptjs.
- Protected frontend routes restrict access to authenticated users.
- Sensitive configuration belongs in environment variables.
- Environment files and generated dependencies should not be committed to Git.

## 🚀 Future Improvements

Potential enhancements include:

- Light and dark theme switching.
- Improved responsive dashboard layouts.
- Additional spending insights and visualizations.
- Enhanced budget alerts.
- Deployment with a hosted frontend and backend.
- Additional automated tests.

## 👨‍💻 Author

**Anupam Mondal**

B.Tech Computer Science and Engineering Student

- GitHub: [AnupamMondal05](https://github.com/AnupamMondal05)
- LinkedIn: www.linkedin.com/in/anupam-mondal-b21a76339

## 📄 License

This project is available for learning and portfolio purposes. Add an appropriate open-source license if you intend to permit reuse, modification, and distribution.

---

⭐ If you find this project interesting, consider giving the repository a star!