import { openai, AI_MODELS, handleOpenAIError } from './openai';
import type { RoadmapResult, Milestone } from './roadmapGenerator';

// 일일 미션 타입
export interface DailyMission {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  category: 'document' | 'interview' | 'study' | 'networking' | 'etc';
}

// 미션 생성 입력 타입
export interface MissionInput {
  userId: string;
  roadmap: RoadmapResult;
  currentMonth: number;
  deadlineDate?: Date;
  completedMissions?: string[];
  userPreferences?: {
    dailyAvailableTime?: number; // 분 단위
    focusAreas?: string[];
    avoidTasks?: string[];
  };
}

/**
 * 사용자의 로드맵과 마감일을 기반으로 오늘 수행할 미션 3개를 생성합니다.
 * @param input - 미션 생성 입력
 * @returns 일일 미션 목록
 */
export async function generateDailyMissions(input: MissionInput): Promise<DailyMission[]> {
  const { roadmap, currentMonth, deadlineDate, completedMissions = [], userPreferences } = input;

  // 현재 월의 마일스톤 찾기
  const currentMilestone = roadmap.milestones.find((m) => m.month === currentMonth);
  
  if (!currentMilestone) {
    throw new Error(`${currentMonth}개월 차 마일스톤을 찾을 수 없습니다.`);
  }

  const daysUntilDeadline = deadlineDate 
    ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const prompt = `
사용자의 취업 준비 로드맵 정보:
- 목표: ${roadmap.title}
- 현재 단계: ${currentMonth}개월 차 - ${currentMilestone.title}
- 이번 달 목표 태스크: ${currentMilestone.tasks.join(', ')}
${daysUntilDeadline ? `- 서류 마감까지 남은 일수: ${daysUntilDeadline}일` : ''}
${completedMissions.length > 0 ? `- 최근 완료한 미션: ${completedMissions.join(', ')}` : ''}
${userPreferences?.dailyAvailableTime ? `- 하루 가용 시간: ${userPreferences.dailyAvailableTime}분` : ''}
${userPreferences?.focusAreas?.length ? `- 집중 영역: ${userPreferences.focusAreas.join(', ')}` : ''}

위 정보를 바탕으로 오늘 수행할 미션 3개를 생성해주세요.

요구사항:
1. 각 미션은 구체적이고 당일 완료 가능해야 합니다.
2. 로드맵의 현재 단계 목표와 연결되어야 합니다.
3. 마감일이 임박했다면 서류/면접 준비를 우선시하세요.
4. 다양한 카테고리(서류, 면접, 학습, 네트워킹 등)를 고려하세요.
5. 예상 소요 시간을 포함하세요.
6. 우선순위를 설정하세요(high/medium/low).

응답 형식 (JSON):
{
  "missions": [
    {
      "id": "mission_1",
      "title": "미션 제목",
      "description": "구체적인 미션 설명과 완료 기준",
      "estimatedTime": "예상 소요 시간 (예: 30분)",
      "priority": "high",
      "category": "document"
    }
  ]
}

카테고리: document(서류), interview(면접), study(학습), networking(네트워킹), etc(기타)
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4,
      messages: [
        {
          role: 'system',
          content: '당신은 취업 준비 코치입니다. 사용자의 상황과 목표를 고려하여 오늘 수행할 구체적이고 현실적인 미션을 제안합니다.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    const parsed = JSON.parse(content);
    if (!parsed.missions || !Array.isArray(parsed.missions)) {
      throw new Error('잘못된 미션 형식입니다.');
    }

    // 미션 검증 및 기본값 설정
    const missions: DailyMission[] = parsed.missions.map((mission: Partial<DailyMission>, index: number) => ({
      id: mission.id || `mission_${index + 1}`,
      title: mission.title || '미션',
      description: mission.description || '',
      estimatedTime: mission.estimatedTime || '30분',
      priority: mission.priority || 'medium',
      category: mission.category || 'etc',
    }));

    return missions;
  } catch (error) {
    throw handleOpenAIError(error);
  }
}

/**
 * 특정 미션의 세부 가이드를 생성합니다.
 * @param mission - 미션 정보
 * @returns 세부 가이드
 */
export async function generateMissionGuide(mission: DailyMission): Promise<string> {
  const prompt = `
미션: ${mission.title}
설명: ${mission.description}
카테고리: ${mission.category}

위 미션을 성공적으로 완료하기 위한 단계별 가이드를 작성해주세요.
포함할 내용:
1. 준비 사항
2. 단계별 진행 방법
3. 완료 체크포인트
4. 참고 자료나 팁 (있는 경우)
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_3_5_TURBO,
      messages: [
        {
          role: 'system',
          content: '당신은 취업 준비 멘토입니다. 구체적이고 실용적인 가이드를 제공합니다.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    return response.choices[0]?.message?.content || '가이드 생성에 실패했습니다.';
  } catch (error) {
    throw handleOpenAIError(error);
  }
}

/**
 * 주간 미션 요약과 다음 주 예고를 생성합니다.
 * @param completedMissions - 완료한 미션 목록
 * @param roadmap - 로드맵 정보
 * @returns 주간 리포트
 */
export async function generateWeeklyReport(
  completedMissions: DailyMission[],
  roadmap: RoadmapResult,
  currentMonth: number
): Promise<{
  summary: string;
  achievements: string[];
  nextWeekPreview: string;
}> {
  const prompt = `
이번 주 완료한 미션:
${completedMissions.map((m) => `- ${m.title} (${m.category})`).join('\n')}

현재 로드맵: ${roadmap.title}
진행 중인 단계: ${currentMonth}개월 차

위 정보를 바탕으로 주간 리포트를 작성해주세요.

응답 형식 (JSON):
{
  "summary": "이번 주 활동 요약 (2-3문장)",
  "achievements": ["주요 성과 1", "주요 성과 2"],
  "nextWeekPreview": "다음 주 예상 활동 방향"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_3_5_TURBO,
      messages: [
        {
          role: 'system',
          content: '당신은 취업 준비 코치입니다. 사용자의 진행 상황을 긍정적으로 피드백하고 다음 단계를 안내합니다.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    return JSON.parse(content);
  } catch (error) {
    throw handleOpenAIError(error);
  }
}
