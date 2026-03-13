import { openai, AI_MODELS, handleOpenAIError } from './openai';

// 자소서 첨삭 결과 타입
export interface CoverLetterReviewResult {
  overallScore: number; // 0-100
  keywordMatch: {
    score: number;
    matched: string[];
    missing: string[];
  };
  strengths: string[];
  improvements: {
    section: string;
    issue: string;
    suggestion: string;
  }[];
  rewrittenParagraphs?: {
    original: string;
    rewritten: string;
    reason: string;
  }[];
  finalAdvice: string;
}

// 자소서 섹션 타입
export interface CoverLetterSection {
  title: string;
  content: string;
}

// 첨삭 옵션
export interface ReviewOptions {
  detailedRewrite?: boolean; // 문단 단위 재작성 포함 여부
  focusAreas?: string[]; // 집중 검토 영역
  maxLength?: number; // 권장 최대 글자수
}

/**
 * 자소서를 첨삭하고 피드백을 제공합니다.
 * @param text - 자소서 전문
 * @param jobDescription - 채용공고 내용
 * @param options - 첨삭 옵션
 * @returns 첨삭 결과
 */
export async function reviewCoverLetter(
  text: string,
  jobDescription: string,
  options: ReviewOptions = {}
): Promise<CoverLetterReviewResult> {
  const { detailedRewrite = false, focusAreas = [], maxLength } = options;

  const prompt = `
채용공고:
${jobDescription}

자소서:
${text}
${maxLength ? `\n권장 글자수: ${maxLength}자 이내` : ''}
${focusAreas.length > 0 ? `\n집중 검토 영역: ${focusAreas.join(', ')}` : ''}

위 자소서를 채용공고 기준으로 첨삭해주세요.

검토 항목:
1. **키워드 매칭**: JD의 핵심 키워드가 자소서에 얼마나 반영되었는지
2. **강점**: 자소서의 잘된 점
3. **개선점**: 구체적인 문제점과 수정 제안
4. ${detailedRewrite ? '**문단 재작성**: 개선이 필요한 문단의 수정안' : ''}
5. **최종 조언**: 합격을 위한 종합적인 조언

응답 형식 (JSON):
{
  "overallScore": 75,
  "keywordMatch": {
    "score": 70,
    "matched": ["매칭된 키워드1", "매칭된 키워드2"],
    "missing": ["누락된 키워드1", "누락된 키워드2"]
  },
  "strengths": ["강점 1", "강점 2"],
  "improvements": [
    {
      "section": "해당 문단/섹션",
      "issue": "문제점 설명",
      "suggestion": "개선 제안"
    }
  ],
  ${detailedRewrite ? `"rewrittenParagraphs": [
    {
      "original": "원본 문단",
      "rewritten": "수정안",
      "reason": "수정 이유"
    }
  ],` : ''}
  "finalAdvice": "종합 조언"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4,
      messages: [
        {
          role: 'system',
          content: '당신은 채용 전문가입니다. 채용공고와 자소서를 비교 분석하여 구체적이고 실용적인 첨삭 피드백을 제공합니다.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    const parsed = JSON.parse(content);

    // 결과 검증 및 기본값 설정
    const result: CoverLetterReviewResult = {
      overallScore: parsed.overallScore ?? 0,
      keywordMatch: {
        score: parsed.keywordMatch?.score ?? 0,
        matched: parsed.keywordMatch?.matched ?? [],
        missing: parsed.keywordMatch?.missing ?? [],
      },
      strengths: parsed.strengths ?? [],
      improvements: parsed.improvements ?? [],
      finalAdvice: parsed.finalAdvice ?? '',
    };

    if (detailedRewrite && parsed.rewrittenParagraphs) {
      result.rewrittenParagraphs = parsed.rewrittenParagraphs;
    }

    return result;
  } catch (error) {
    throw handleOpenAIError(error);
  }
}

/**
 * 채용공고에서 핵심 키워드를 추출합니다.
 * @param jobDescription - 채용공고 내용
 * @returns 추출된 키워드 목록
 */
export async function extractKeywords(jobDescription: string): Promise<{
  required: string[];
  preferred: string[];
  skills: string[];
  values: string[];
}> {
  const prompt = `
채용공고:
${jobDescription}

위 채용공고에서 다음 카테고리별 핵심 키워드를 추출해주세요:
- required: 필수 자격요건
- preferred: 우대사항
- skills: 필요 기술/역량
- values: 기업이 중시하는 가치/문화

응답 형식 (JSON):
{
  "required": ["키워드1", "키워드2"],
  "preferred": ["키워드1", "키워드2"],
  "skills": ["키워드1", "키워드2"],
  "values": ["키워드1", "키워드2"]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_3_5_TURBO,
      messages: [
        {
          role: 'system',
          content: '당신은 채용공고 분석 전문가입니다. 공고에서 핵심 키워드를 정확히 추출합니다.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    const parsed = JSON.parse(content);

    return {
      required: parsed.required ?? [],
      preferred: parsed.preferred ?? [],
      skills: parsed.skills ?? [],
      values: parsed.values ?? [],
    };
  } catch (error) {
    throw handleOpenAIError(error);
  }
}

/**
 * 자소서 문단을 개선된 버전으로 재작성합니다.
 * @param paragraph - 원본 문단
 * @param context - 문맥 정보 (질문 내용 등)
 * @param keywords - 강조할 키워드
 * @returns 재작성된 문단
 */
export async function rewriteParagraph(
  paragraph: string,
  context?: string,
  keywords: string[] = []
): Promise<{
  rewritten: string;
  changes: string[];
}> {
  const prompt = `
${context ? `문항: ${context}\n` : ''}원본 문단:
${paragraph}
${keywords.length > 0 ? `\n강조할 키워드: ${keywords.join(', ')}` : ''}

위 문단을 더 설득력 있고 구체적으로 개선해주세요.
STAR 기법(상황-과제-행동-결과)을 적용하고, 수치화된 성과가 있다면 강조하세요.
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4,
      messages: [
        {
          role: 'system',
          content: '당신은 자소서 첨삭 전문가입니다. 문단을 더 임팩트 있고 설득력 있게 다시 작성합니다.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    const parsed = JSON.parse(content);

    return {
      rewritten: parsed.rewritten || paragraph,
      changes: parsed.changes || [],
    };
  } catch (error) {
    throw handleOpenAIError(error);
  }
}

/**
 * 자소서와 채용공고의 적합도를 분석합니다.
 * @param coverLetter - 자소서 내용
 * @param jobDescription - 채용공고 내용
 * @returns 적합도 분석 결과
 */
export async function analyzeFit(
  coverLetter: string,
  jobDescription: string
): Promise<{
  overallFit: number;
  categoryScores: {
    experience: number;
    skills: number;
    values: number;
    motivation: number;
  };
  gaps: string[];
  recommendations: string[];
}> {
  const prompt = `
채용공고:
${jobDescription}

자소서:
${coverLetter}

위 자소서가 채용공고 요건과 얼마나 잘 부합하는지 분석해주세요.

응답 형식 (JSON):
{
  "overallFit": 75,
  "categoryScores": {
    "experience": 80,
    "skills": 70,
    "values": 75,
    "motivation": 80
  },
  "gaps": ["부족한 부분 1", "부족한 부분 2"],
  "recommendations": ["개선 제안 1", "개선 제안 2"]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4,
      messages: [
        {
          role: 'system',
          content: '당신은 인사 담당자 관점에서 자소서와 채용공고의 적합도를 객관적으로 분석합니다.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    const parsed = JSON.parse(content);

    return {
      overallFit: parsed.overallFit ?? 0,
      categoryScores: {
        experience: parsed.categoryScores?.experience ?? 0,
        skills: parsed.categoryScores?.skills ?? 0,
        values: parsed.categoryScores?.values ?? 0,
        motivation: parsed.categoryScores?.motivation ?? 0,
      },
      gaps: parsed.gaps ?? [],
      recommendations: parsed.recommendations ?? [],
    };
  } catch (error) {
    throw handleOpenAIError(error);
  }
}
