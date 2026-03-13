import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  targetCompany: z.string().optional(),
  targetPosition: z.string().optional(),
  currentGpa: z.number().min(0).max(4.5).optional(),
});

// GET /me - 내 정보 조회
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        profile: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      return;
    }
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      profile: user.profile,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: '프로필 조회 중 오류가 발생했습니다.' });
  }
});

// PUT /me - 내 정보 수정
router.put('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    
    // 사용자 정보 업데이트
    const updateData: any = {};
    if (validated.name) updateData.name = validated.name;
    
    // 프로필 업데이트 또는 생성
    const profileData: any = {};
    if (validated.targetCompany !== undefined) profileData.targetCompany = validated.targetCompany;
    if (validated.targetPosition !== undefined) profileData.targetPosition = validated.targetPosition;
    if (validated.currentGpa !== undefined) profileData.currentGpa = validated.currentGpa;
    
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...updateData,
        profile: {
          upsert: {
            create: profileData,
            update: profileData,
          },
        },
      },
      include: {
        profile: true,
      },
    });
    
    res.json({
      message: '프로필이 업데이트되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile: user.profile,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: '프로필 수정 중 오류가 발생했습니다.' });
  }
});

// GET /me/stats - 통계
router.get('/me/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    // 총 미션 수
    const totalTasks = await prisma.task.count({
      where: { userId },
    });
    
    // 완료된 미션 수
    const completedTasks = await prisma.task.count({
      where: { userId, status: 'completed' },
    });
    
    // 로드맵 수
    const roadmapCount = await prisma.roadmap.count({
      where: { userId },
    });
    
    // 이번 주 완료율
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyTasks = await prisma.task.count({
      where: {
        userId,
        date: {
          gte: startOfWeek,
        },
      },
    });
    
    const weeklyCompleted = await prisma.task.count({
      where: {
        userId,
        status: 'completed',
        date: {
          gte: startOfWeek,
        },
      },
    });
    
    res.json({
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      roadmapCount,
      weeklyStats: {
        total: weeklyTasks,
        completed: weeklyCompleted,
        rate: weeklyTasks > 0 ? Math.round((weeklyCompleted / weeklyTasks) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
  }
});

export default router;