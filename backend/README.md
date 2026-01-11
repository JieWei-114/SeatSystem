# Backend 

This folder contains the Express + TypeScript API for SeatSystem.

## Prerequisites
- Node.js >= 18
- PostgreSQL and a DB user

## Environment
- Copy `.env.example` (if present) or create `.env` with the following keys:

```
NODE_ENV=development
APP_PORT=5000

DB_NAME=your_name
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=your_host
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

## Install & run (development)

cd backend
npm install
npm run dev


## Database migrations & seeds

cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

## Linting & formatting

cd backend
npm run lint
npm run lint:fix
npm run format

## Notes
- Uploaded floorplans are saved in `public/uploads/floorplans/`.
- Server entry: `src/index.ts`.
