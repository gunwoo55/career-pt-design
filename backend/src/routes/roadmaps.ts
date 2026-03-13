import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const createRoadmapSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string(),
    deadline: z.string().optional(),
    tasks: z.array(z.string()).optional(),
  })),
});

const updateRoadmapSchema = z.object({
  title: z.string().min(1).optional(),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string(),
    deadline: z.string().optional(),
    tasks: z.array(z.string()).optional(),
  })).optional(),
});

// POST /generate - AI 로드맵 생성
router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { title, milestones } = createRoadmapSchema.parse(req.body);
    
    // 트랜잭션으로 로드맵과 관련 미션 생성
    const result = await prisma.$transaction(async (tx) => {
      // 로드맵 생성
      const roadmap = await tx.roadmap.create({
        data: {
          userId,
          title,
          milestones: milestones as any,
        },
      });
      
      // 마일스톤의 태스크를 일일 미션으로 생성
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const taskPromises: Promise<any>[] = [];
      
      milestones.forEach((milestone, mIndex) => {
        if (milestone.tasks) {
          milestone.tasks.forEach((taskTitle, tIndex) => {
            const taskDate = new Date(today);
            taskDate.setDate(taskDate.getDate() + (mIndex * 7) + tIndex);
            
            taskPromises.push(
              tx.task.create({
                data: {
                  userId,
                  title: `[${milestone.title}] ${taskTitle}`,
                  status: 'pending',
                  date: taskDate,
                },
              })
            );
          });
        }
      });
      
      await Promise.all(taskPromises);
      
      return roadmap;
    });
    
    res.status(201).json({
      message: '로드맵이 생성되었습니다.',
      roadmap: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Generate roadmap error:', error);
    res.status(500).json({ error: '로드맵 생성 중 오류가 발생했습니다.' });
  }
});

// GET / - 내 로드맵 조회
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json({ roadmaps });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({ error: '로드맵 조회 중 오류가 발생했습니다.' });
  }
});

// GET /:id - 특정 로드맵 조회
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const roadmap = await prisma.roadmap.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });
    
    if (!roadmap) {
      res.status(404).json({ error: '로드맵을 찾을 수 없습니다.' });
      return;
    }
    
    res.json({ roadmap });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: '로드맵 조회 중 오류가 발생했습니다.' });
  }
});

// PUT /:id - 로드맵 수정
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const validated = updateRoadmapSchema.parse(req.body);
    
    // 로드맵 존재 확인 및 소유권 검증
    const existingRoadmap = await prisma.roadmap.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });
    
    if (!existingRoadmap) {
      res.status(404).json({ error: '로드맵을 찾을 수 없습니다.' });
      return;
    }
    
    // 업데이트
    const updateData: any = {};
    if (validated.title) updateData.title = validated.title;
    if (validated.milestones) updateData.milestones = validated.milestones;
    
    const roadmap = await prisma.roadmap.update({
      where: { id },
      data: updateData,
    });
    
    res.json({
      message: '로드맵이 업데이트되었습니다.',
      roadmap,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Update roadmap error:', error);
    res.status(500).json({ error: '로드맵 수정 중 오류가 발생했습니다.' });
  }
});

// DELETE /:id - 로드맵 삭제
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // 로드맵 존재 확인 및 소유권 검증
    const existingRoadmap = await prisma.roadmap.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });
    
    if (!existingRoadmap) {
      res.status(404).json({ error: '로드맵을 찾을 수 없습니다.' });
      return;
    }
    
    await prisma.roadmap.delete({
      where: { id },
    });
    
    res.json({ message: '로드맵이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete roadmap error:', error);
    res.status(500).json({ error: '로드맵 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;