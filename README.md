# AI Resume Builder & Optimizer (MERN)

A high-performance, ATS-friendly MERN stack resume builder that allows users to create professional resumes in both PDF and DOCX formats. It also includes an AI-powered resume optimizer to analyze resumes against specific job descriptions.

## 🚀 Live Demo
- **Frontend**: [https://resume-builder-frontend-6vmo.onrender.com](https://resume-builder-frontend-6vmo.onrender.com)
- **Backend API**: [https://resume-builder-backend-0ith.onrender.com](https://resume-builder-backend-0ith.onrender.com)

## ✨ Features
- **ATS-Friendly Templates**: Choose from Professional, Academic, and Modern styles.
- **Multi-Format Export**: Generate resumes in high-quality PDF and editable Word (DOCX) formats.
- **AI Resume Optimizer**: Upload your resume and paste a job description to get a detailed optimization report with missing keywords and suggestions.
- **Real-time Preview & Dark Mode**: Modern UI with a sleek dark mode and seamless multi-step form progress.
- **Production-Ready**: Configured for cloud deployment (Render for backend, Vercel/Vite for frontend).

## 🛠️ Tech Stack
- **Frontend**: React.js (Vite), Axios, React-Bootstrap, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via MongoDB Atlas)
- **File Generation**: PDFKit (PDF), docx.js (Word)
- **Deployment**: Render (Backend), Vercel (Frontend recommendation)

## 📁 Project Structure
```text
resume_builder/
├── client/             # React + Vite Frontend
│   ├── src/            # Components, Pages, Assets
│   └── .env.example    # Frontend environment template
├── server/             # Node + Express Backend
│   ├── controllers/    # API Logics
│   ├── models/         # MongoDB Schemas
│   ├── routes/         # API Endpoints
│   ├── utils/          # PDF & DOCX generation logic
│   └── .env.example    # Backend environment template
└── README.md           # Main documentation
```

## ⚙️ Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Saisurya01/resume_builder.git
cd resume_builder
```

### 2. Backend Setup
```bash
cd server
npm install
```
- Create a `.env` file in the `server` folder based on `.env.example`.
- Add your `MONGO_URI`.
- Start the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
- Create a `.env` file in the `client` folder based on `.env.example`.
- Set `REACT_APP_API_URL=http://localhost:5000` (or your live backend URL).
- Run the development server:
```bash
npm run dev
```

## 🌐 Deployment

### Backend (Render)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: `MONGO_URI`, `PORT`, `NODE_ENV=production`.

### Frontend (Vercel/Netlify)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: `REACT_APP_API_URL`.

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
