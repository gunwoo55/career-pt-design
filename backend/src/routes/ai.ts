import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const roadmapGenerateSchema = z.object({
  targetCompany: z.string().min(1, '목표 기업을 입력해주세요.'),
  targetPosition: z.string().min(1, '목표 포지션을 입력해주세요.'),
  currentGpa: z.number().min(0).max(4.5).optional(),
  currentSkills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  deadline: z.string().optional(), // 취업 목표 날짜
});

// POST /roadmap-generate - GPT로 로드맵 생성
router.post('/roadmap-generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const validated = roadmapGenerateSchema.parse(req.body);
    
    const { targetCompany, targetPosition, currentGpa, currentSkills, experience, deadline } = validated;
    
    // 사용자 프로필 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { profile: true },
    });
    
    // GPT 프롬프트 생성
    const prompt = `
당신은 취업 컨설턴트입니다. 다음 정보를 바탕으로 상세한 취업 준비 로드맵을 생성해주세요.

[목표 기업]: ${targetCompany}
[목표 포지션]: ${targetPosition}
${currentGpa ? `[현재 GPA]: ${currentGpa}/4.5` : ''}
${currentSkills ? `[보유 스킬]: ${currentSkills.join(', ')}` : ''}
${experience ? `[경험]: ${experience}` : ''}
${deadline ? `[취업 목표일]: ${deadline}` : ''}

다음 JSON 형식으로 응답해주세요:
{
  "title": "로드맵 제목",
  "milestones": [
    {
      "title": "마일스톤 제목",
      "description": "상세 설명",
      "deadline": "YYYY-MM-DD (선택사항)",
      "tasks": ["태스크1", "태스크2", "태스크3"]
    }
  ]
}

요구사항:
1. 최소 4개, 최대 6개의 마일스톤을 생성하세요.
2. 각 마일스톤은 2-4개의 구체적인 태스크를 포함해야 합니다.
3. 마일스톤은 시간 순서대로 배열해주세요.
4. 태스크는 실행 가능한 구체적인 행동으로 작성해주세요.
5. JSON만 반환하고 다른 설명은 추가하지 마세요.
`;

    // GPT API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a career consultant specialized in helping students prepare for job applications. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      res.status(500).json({ error: 'AI 응답을 받지 못했습니다.' });
      return;
    }

    // JSON 파싱
    let roadmapData;
    try {
      roadmapData = JSON.parse(responseContent);
    } catch (e) {
      console.error('JSON parse error:', e);
      res.status(500).json({ error: 'AI 응답 파싱 중 오류가 발생했습니다.' });
      return;
    }

    // 응답 형식 검증
    if (!roadmapData.title || !Array.isArray(roadmapData.milestones)) {
      res.status(500).json({ error: 'AI 응답 형식이 올바르지 않습니다.' });
      return;
    }

    res.json({
      message: '로드맵이 생성되었습니다.',
      roadmap: roadmapData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API error:', error);
      res.status(500).json({ error: 'AI 서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
      return;
    }
    
    console.error('Roadmap generate error:', error);
    res.status(500).json({ error: '로드맵 생성 중 오류가 발생했습니다.' });
  }
});

// POST /chat - AI 채팅 (추가 기능)
router.post('/chat', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: '메시지를 입력해주세요.' });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful career advisor. Provide concise, actionable advice for job seekers. Always respond in Korean.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || '죄송합니다. 응답을 생성하지 못했습니다.';

    res.json({
      reply,
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API error:', error);
      res.status(500).json({ error: 'AI 서비스 오류가 발생했습니다.' });
      return;
    }
    
    console.error('Chat error:', error);
    res.status(500).json({ error: '채팅 처리 중 오류가 발생했습니다.' });
  }
});

export default router;