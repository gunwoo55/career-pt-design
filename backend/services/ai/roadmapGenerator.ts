import { openai, AI_MODELS, handleOpenAIError, safeJSONParse } from './openai';

// 로드맵 입력 타입
export interface RoadmapInput {
  targetCompany: string;
  targetPosition: string;
  currentSpecs: Record<string, unknown>;
  timeline: number;
}

// 마일스톤 타입
export interface Milestone {
  month: number;
  title: string;
  tasks: string[];
}

// 로드맵 결과 타입
export interface RoadmapResult {
  title: string;
  milestones: Milestone[];
}

/**
 * 사용자의 취업 목표와 현재 스펙을 기반으로 단계별 로드맵을 생성합니다.
 * @param userInput - 사용자 입력 정보
 * @returns 생성된 로드맵
 */
export async function generateRoadmap(userInput: RoadmapInput): Promise<RoadmapResult> {
  const { targetCompany, targetPosition, currentSpecs, timeline } = userInput;

  const prompt = `
당신은 취업 컨설턴트입니다.
사용자가 ${targetCompany}의 ${targetPosition} 직무에 지원하려고 합니다.

현재 스펙:
${JSON.stringify(currentSpecs, null, 2)}

남은 기간: ${timeline}개월

합격까지 필요한 단계별 로드맵을 JSON 형태로 생성해주세요.

요구사항:
1. ${timeline}개월 동안의 단계별 계획을 제시하세요.
2. 각 단계는 구체적이고 실행 가능한 태스크를 포함해야 합니다.
3. 취업 준비의 전형적인 단계(스펙 보완, 서류 준비, 면접 준비 등)를 고려하세요.
4. 현재 스펙과 목표 직무 간의 격차를 분석하여 우선순위를 정하세요.

응답 형식:
{
  "title": "로드맵 제목 (예: ${targetCompany} ${targetPosition} 합격 로드맵)",
  "milestones": [
    {
      "month": 1,
      "title": "1개월 차 목표",
      "tasks": ["구체적인 태스크 1", "구체적인 태스크 2", "구체적인 태스크 3"]
    }
  ]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4,
      messages: [
        {
          role: 'system',
          content: '당신은 취업 컨설팅 전문가입니다. 사용자의 현재 상황과 목표를 분석하여 현실적이고 구체적인 취업 준비 로드맵을 제공합니다.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    const parsed = safeJSONParse(content);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI 응답을 파싱할 수 없습니다.');
    }

    // 결과 검증
    const result = parsed as RoadmapResult;
    if (!result.title || !Array.isArray(result.milestones)) {
      throw new Error('잘못된 로드맵 형식입니다.');
    }

    return result;
  } catch (error) {
    throw handleOpenAIError(error);
  }
}

/**
 * 기존 로드맵을 기반으로 특정 기간의 세부 계획을 생성합니다.
 * @param roadmap - 기존 로드맵
 * @param month - 특정 월 (선택적)
 * @returns 세부 계획
 */
export async function generateDetailedPlan(
  roadmap: RoadmapResult,
  month?: number
): Promise<string> {
  const targetMilestone = month
    ? roadmap.milestones.find((m) => m.month === month)
    : roadmap.milestones[0];

  if (!targetMilestone) {
    throw new Error('해당 월의 마일스톤을 찾을 수 없습니다.');
  }

  const prompt = `
로드맵 제목: ${roadmap.title}
${targetMilestone.month}개월 차 목표: ${targetMilestone.title}
주요 태스크:
${targetMilestone.tasks.map((t) => `- ${t}`).join('\n')}

위 내용을 바탕으로 각 태스크별 구체적인 실행 방법과 체크리스트를 작성해주세요.
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_3_5_TURBO,
      messages: [
        {
          role: 'system',
          content: '당신은 취업 준비 코치입니다. 구체적이고 실천 가능한 조언을 제공합니다.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0]?.message?.content || '세부 계획 생성에 실패했습니다.';
  } catch (error) {
    throw handleOpenAIError(error);
  }
}
