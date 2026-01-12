# Seat booking solution

BleakFuture is a full-stack seat booking solution built with a Nuxt 3 (Vue 3) frontend and a Node.js + TypeScript backend.  
The project demonstrates a clean frontend–backend separation and provides basic seat browsing and booking functionality.

---

## ✨ Features

- Floor plan edit
- Seat layout browsing
- Seat selection and booking
- RESTful API backend
- Frontend and backend separation
- Scalable project structure for future expansion

---

## 🧠 Tech Stack

### Frontend
- Nuxt 3 (Vue 3 + Vite)
- TypeScript
- Pinia (State Management)
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Sequelize ORM
- PostgreSQL (or other SQL databases)

---

## Prerequisites

- Node.js >= 18 and npm
- PostgreSQL (for backend DB)

## Quick start

1. Install backend deps and start (dev):

cd backend
npm install
cp .env.example .env # create and edit .env as needed
npm run dev

2. Install frontend deps and start (dev):

cd frontend
npm install
npm run dev

## Linting & formatting

### Backend and frontend include ESLint + Prettier configs. To run:

cd backend
npm run lint
npm run lint:fix
npm run format

cd frontend
npm run lint
npm run lint:fix
npm run format

## Useful notes

- Backend migrations: `npx sequelize-cli db:migrate` (runs from `backend/`).
- Backend uploads are stored in `backend/public/uploads/floorplans/`.
