import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
const sequelize = require('./config/config').sequelize;

import testRoute from './routes/testRoute';
import userRoutes from './routes/userRoute';
import buildingRoutes from './routes/buildingRoute';
import floorPlanRoutes from './routes/floorPlanRoute';
import bookingRoutes from './routes/bookingRoute';

const app: Express = express();

// Increase payload limit (e.g., 50MB)
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const PORT: number | string = process.env.APP_PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

sequelize.authenticate()
  .then(() => {
    console.log('Database connected!');
    return sequelize.sync({ force: false }); // Sync models without dropping tables
  })
  .then(() => console.log('Database synchronized'))
  .catch((err: Error) => console.error('Database error:', err));

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'API working' });
});

app.use('/uploads/floorplans', express.static(path.join(__dirname, '../../backend/public/uploads/floorplans')));

app.use('/api/', testRoute)
app.use('/api/auth', userRoutes);
app.use('/api/building', buildingRoutes);
app.use('/api/floorplan', floorPlanRoutes);
app.use('/api/booking', bookingRoutes);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ status: 'fail', message: 'Route not found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server shut down');
    process.exit(0);
  });
});