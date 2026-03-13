import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// OpenAI 클라이언트 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI 인스턴스 낳port
export { openai };

// 모델 설정
export const AI_MODELS = {
  GPT_4: 'gpt-4',
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
} as const;

// API 에러 처리 유틸리티
export function handleOpenAIError(error: unknown): Error {
  if (error instanceof Error) {
    if (error.message.includes('rate limit')) {
      return new Error('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
    }
    if (error.message.includes('invalid api key')) {
      return new Error('API 키가 유효하지 않습니다. 관리자에게 문의해주세요.');
    }
    return new Error(`AI 서비스 오류: ${error.message}`);
  }
  return new Error('알 수 없는 오류가 발생했습니다.');
}

// JSON 파싱 유틸리티
export function safeJSONParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
