import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /daily?date=2024-03-13 - 오늘 미션
router.get('/daily', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { date } = req.query;
    const userId = req.user!.userId;
    
    let targetDate: Date;
    
    if (date) {
      targetDate = new Date(date as string);
    } else {
      targetDate = new Date();
    }
    
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    res.json({
      date: targetDate.toISOString().split('T')[0],
      tasks,
    });
  } catch (error) {
    console.error('Get daily tasks error:', error);
    res.status(500).json({ error: '일일 미션 조회 중 오류가 발생했습니다.' });
  }
});

// POST /:id/complete - 미션 완료 체크
router.post('/:id/complete', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    // 미션 존재 확인 및 소유권 검증
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });
    
    if (!task) {
      res.status(404).json({ error: '미션을 찾을 수 없습니다.' });
      return;
    }
    
    // 상태 토글
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });
    
    res.json({
      message: newStatus === 'completed' ? '미션을 완료했습니다.' : '미션 완료를 취소했습니다.',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: '미션 완료 처리 중 오류가 발생했습니다.' });
  }
});

// GET /stats - 완료 통계
router.get('/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    // 전체 통계
    const totalTasks = await prisma.task.count({
      where: { userId },
    });
    
    const completedTasks = await prisma.task.count({
      where: { userId, status: 'completed' },
    });
    
    const pendingTasks = totalTasks - completedTasks;
    
    // 이번 달 통계
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlyTasks = await prisma.task.groupBy({
      by: ['status'],
      where: {
        userId,
        date: {
          gte: startOfMonth,
        },
      },
      _count: {
        status: true,
      },
    });
    
    const monthlyCompleted = monthlyTasks.find(t => t.status === 'completed')?._count.status || 0;
    const monthlyTotal = monthlyTasks.reduce((sum, t) => sum + t._count.status, 0);
    
    // 최근 7일 일별 통계
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayTasks = await prisma.task.count({
        where: {
          userId,
          date: {
            gte: date,
            lt: nextDay,
          },
        },
      });
      
      const dayCompleted = await prisma.task.count({
        where: {
          userId,
          status: 'completed',
          date: {
            gte: date,
            lt: nextDay,
          },
        },
      });
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        total: dayTasks,
        completed: dayCompleted,
      });
    }
    
    res.json({
      overall: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      monthly: {
        total: monthlyTotal,
        completed: monthlyCompleted,
        completionRate: monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0,
      },
      last7Days,
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
  }
});

// GET / - 모든 미션 조회 (옵션: 날짜 범위)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const userId = req.user!.userId;
    
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setDate(end.getDate() + 1);
        where.date.lt = end;
      }
    }
    
    if (status) {
      where.status = status;
    }
    
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: '미션 조회 중 오류가 발생했습니다.' });
  }
});

export default router;