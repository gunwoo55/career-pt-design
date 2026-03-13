import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSpec, Roadmap, UserProgress, DailyMission } from '@/types';

interface OnboardingState {
  currentStep: number;
  userSpec: Partial<UserSpec>;
  setStep: (step: number) => void;
  updateUserSpec: (spec: Partial<UserSpec>) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      userSpec: {},
      setStep: (step) => set({ currentStep: step }),
      updateUserSpec: (spec) =>
        set((state) => ({
          userSpec: { ...state.userSpec, ...spec },
        })),
      resetOnboarding: () => set({ currentStep: 1, userSpec: {} }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);

interface RoadmapState {
  roadmap: Roadmap | null;
  isGenerating: boolean;
  setRoadmap: (roadmap: Roadmap) => void;
  setGenerating: (isGenerating: boolean) => void;
  updateStepProgress: (stepId: string, taskId: string, completed: boolean) => void;
  getProgress: () => number;
}

const dummyRoadmap: Roadmap = {
  id: '1',
  title: '백엔드 개발자 취업 로드맵',
  createdAt: new Date().toISOString(),
  steps: [
    {
      id: 'step-1',
      title: '기초 다지기',
      description: '프로그래밍 기초와 웹 개발 기초 학습',
      duration: '1-2개월',
      order: 1,
      tasks: [
        { id: 't1', title: 'Python/Java 기초 문법 완료', completed: false, category: 'study' },
        { id: 't2', title: 'Git/GitHub 학습', completed: false, category: 'study' },
        { id: 't3', title: 'HTTP/REST API 이해', completed: false, category: 'study' },
      ],
    },
    {
      id: 'step-2',
      title: '데이터베이스',
      description: 'SQL 및 데이터베이스 설계 학습',
      duration: '1개월',
      order: 2,
      tasks: [
        { id: 't4', title: 'SQL 기초 및 심화 학습', completed: false, category: 'study' },
        { id: 't5', title: 'MySQL/PostgreSQL 실습', completed: false, category: 'study' },
        { id: 't6', title: '데이터베이스 설계 프로젝트', completed: false, category: 'portfolio' },
      ],
    },
    {
      id: 'step-3',
      title: '백엔드 프레임워크',
      description: 'Spring Boot 또는 Django 학습',
      duration: '2개월',
      order: 3,
      tasks: [
        { id: 't7', title: 'Spring Boot 기초', completed: false, category: 'study' },
        { id: 't8', title: 'JPA/Hibernate 학습', completed: false, category: 'study' },
        { id: 't9', title: 'RESTful API 개발 실습', completed: false, category: 'portfolio' },
        { id: 't10', title: '토이 프로젝트 완성', completed: false, category: 'portfolio' },
      ],
    },
    {
      id: 'step-4',
      title: '심화 및 포트폴리오',
      description: '고급 개념 학습 및 포트폴리오 준비',
      duration: '2-3개월',
      order: 4,
      tasks: [
        { id: 't11', title: 'Redis 캐싱 학습', completed: false, category: 'study' },
        { id: 't12', title: 'Docker 기초', completed: false, category: 'study' },
        { id: 't13', title: 'AWS/GCP 배포 경험', completed: false, category: 'certificate' },
        { id: 't14', title: '팀 프로젝트 참여', completed: false, category: 'portfolio' },
      ],
    },
  ],
};

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get) => ({
      roadmap: null,
      isGenerating: false,
      setRoadmap: (roadmap) => set({ roadmap }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      updateStepProgress: (stepId, taskId, completed) =>
        set((state) => {
          if (!state.roadmap) return state;
          return {
            roadmap: {
              ...state.roadmap,
              steps: state.roadmap.steps.map((step) =>
                step.id === stepId
                  ? {
                      ...step,
                      tasks: step.tasks.map((task) =>
                        task.id === taskId ? { ...task, completed } : task
                      ),
                    }
                  : step
              ),
            },
          };
        }),
      getProgress: () => {
        const { roadmap } = get();
        if (!roadmap) return 0;
        const totalTasks = roadmap.steps.reduce((sum, step) => sum + step.tasks.length, 0);
        const completedTasks = roadmap.steps.reduce(
          (sum, step) => sum + step.tasks.filter((t) => t.completed).length,
          0
        );
        return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      },
    }),
    {
      name: 'roadmap-storage',
    }
  )
);

interface DashboardState {
  todayMissions: DailyMission[];
  progress: UserProgress;
  toggleMission: (missionId: string) => void;
  checkIn: () => void;
  generateDailyMissions: () => void;
}

const dummyMissions: DailyMission[] = [
  { id: 'm1', title: '알고리즘 2문제 풀기', completed: false, category: 'study' },
  { id: 'm2', title: '기술 블로그 1개 읽기', completed: false, category: 'study' },
  { id: 'm3', title: 'CS 개념 정리하기', completed: false, category: 'study' },
  { id: 'm4', title: '프로젝트 1시간 작업', completed: false, category: 'portfolio' },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      todayMissions: dummyMissions,
      progress: {
        streakDays: 5,
        totalCompletedTasks: 12,
        totalTasks: 45,
        lastCheckIn: new Date().toISOString(),
      },
      toggleMission: (missionId) =>
        set((state) => ({
          todayMissions: state.todayMissions.map((mission) =>
            mission.id === missionId
              ? { ...mission, completed: !mission.completed }
              : mission
          ),
        })),
      checkIn: () =>
        set((state) => {
          const today = new Date().toDateString();
          const lastCheckIn = state.progress.lastCheckIn
            ? new Date(state.progress.lastCheckIn).toDateString()
            : null;
          
          if (lastCheckIn === today) return state;
          
          const isConsecutive = lastCheckIn
            ? new Date(today).getTime() - new Date(lastCheckIn).getTime() === 86400000
            : false;
          
          return {
            progress: {
              ...state.progress,
              streakDays: isConsecutive ? state.progress.streakDays + 1 : 1,
              lastCheckIn: new Date().toISOString(),
            },
          };
        }),
      generateDailyMissions: () =>
        set({
          todayMissions: dummyMissions.sort(() => Math.random() - 0.5).slice(0, 3),
        }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);
