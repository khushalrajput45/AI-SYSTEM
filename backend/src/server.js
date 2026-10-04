import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './services/socketService.js';
import { setupSwagger } from './config/swagger.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { seedDatabase } from './seed/seedData.js';
import { User } from './models/User.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import zoneRoutes from './routes/zoneRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Security & Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [ENV.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Documentation
setupSwagger(app);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'SmartCampus API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/departments', departmentRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
async function startServer() {
  await connectDB();

  // Auto-seed if database is empty
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('🌱 Database is empty. Running initial campus seed...');
    await seedDatabase();
  }

  httpServer.listen(ENV.PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SmartCampus API Server running on port ${ENV.PORT}`);
    console.log(`📡 URL: http://localhost:${ENV.PORT}`);
    console.log(`📖 Swagger API Docs: http://localhost:${ENV.PORT}/api/docs`);
    console.log(`======================================================\n`);
  });
}

startServer();

export { app, httpServer };
