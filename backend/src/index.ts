import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import roadmapRoutes from './routes/roadmaps';
import taskRoutes from './routes/tasks';
import aiRoutes from './routes/ai';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: '요청하신 리소스를 찾을 수 없습니다.' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: '서버 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   - Auth:     http://localhost:${PORT}/api/auth`);
  console.log(`   - Users:    http://localhost:${PORT}/api/users`);
  console.log(`   - Roadmaps: http://localhost:${PORT}/api/roadmaps`);
  console.log(`   - Tasks:    http://localhost:${PORT}/api/tasks`);
  console.log(`   - AI:       http://localhost:${PORT}/api/ai`);
});

export default app;