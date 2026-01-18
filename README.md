# Seat Booking Solution

BleakFuture is a full-stack seat booking solution built with Nuxt 3 (Vue 3) for the frontend and Node.js + TypeScript for the backend.
The project demonstrates a clean frontend–backend separation and includes an interactive floor plan editor for seat layout management.

## Features
**Floor Plan & Seat Management**

Upload floor plans using any image format (PNG / JPG / SVG, etc.)
Interactive floor plan editor built with Fabric.js + JavaScript
Drag, move, and arrange seats directly on the floor plan
Visual seat positioning with real-time preview
Persist seat layout data to backend

**Seat Booking**

Seat layout browsing by building and floor
Seat selection and booking
Booking history tracking

**System Features**

RESTful API backend
Frontend and backend separation
Scalable project structure for future expansion
Role-based access support (e.g. admin / super admin)

## Tech Stack
**Frontend**

Nuxt 3 (Vue 3 + Vite) 

TypeScript + JavaScript 

Pinia (State Management) 

Tailwind CSS 

Axios 

Fabric.js (Canvas-based floor plan editor) 


**Backend**

Node.js 

Express 

TypeScript 

Sequelize ORM 

PostgreSQL (or other SQL databases) 


### Floor Plan Editor (Fabric.js)
The floor plan editor is implemented using Fabric.js, providing a canvas-based editing experience
Upload any image format as a floor plan background
Drag & drop seats onto the canvas
Move, align, and reposition seats freely
Canvas-based coordinate system for precise seat placement
Seat layout data can be serialized and stored in the backend

This approach allows:
Flexible floor design without hardcoded layouts
Easy future extension (zones, meeting rooms, equipment, etc.)
Visual consistency between admin editing and user booking views

## Prerequisites
Node.js >= 18 

npm 

PostgreSQL (for backend database) 


## Quick Start
**Backend setup (development)**

cd backend

npm install

cp .env.example .env   # create and edit .env as needed, refer to backend readme

npm run dev


**Frontend setup (development)**

cd frontend

npm install

npm run dev


Frontend will be available at:

http://localhost:3000


### Linting & Formatting

Both backend and frontend include ESLint and Prettier configurations.

**Backend**
cd backend
npm run lint
npm run lint:fix
npm run format

**Frontend**
cd frontend
npm run lint
npm run lint:fix
npm run format

## Useful Notes

Backend migrations:

npx sequelize-cli db:migrate

(Run from backend/ directory)

Floor plan images are stored in:

backend/public/uploads/floorplans/

## App screenshot

![App screenshot](assets/screenshot1.png)
![App screenshot](assets/screenshot2.png)
![App screenshot](assets/screenshot3.png)


