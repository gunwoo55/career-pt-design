import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
  name: z.string().min(1, '이름을 입력해주세요.'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /register - 회원가입
router.post('/register', async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    
    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    
    if (existingUser) {
      res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
      return;
    }
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(validated.password, 10);
    
    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    
    // 토큰 생성
    const tokens = generateTokens({ userId: user.id, email: user.email });
    
    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user,
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// POST /login - 로그인
router.post('/login', async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    
    if (!user) {
      res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      return;
    }
    
    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(validated.password, user.password);
    
    if (!isValidPassword) {
      res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      return;
    }
    
    // 토큰 생성
    const tokens = generateTokens({ userId: user.id, email: user.email });
    
    res.json({
      message: '로그인 성공',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

// POST /refresh - 토큰 갱신
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({ error: '리프레시 토큰이 필요합니다.' });
      return;
    }
    
    // 리프레시 토큰 검증
    const decoded = verifyRefreshToken(refreshToken);
    
    // 새로운 토큰 생성
    const tokens = generateTokens({ userId: decoded.userId, email: decoded.email });
    
    res.json({
      message: '토큰이 갱신되었습니다.',
      ...tokens,
    });
  } catch (error) {
    res.status(401).json({ error: '유효하지 않은 리프레시 토큰입니다.' });
  }
});

export default router;