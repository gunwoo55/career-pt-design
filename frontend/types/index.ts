export interface UserSpec {
  targetJob: string;
  gpa: number;
  certifications: string[];
  activities: string[];
  remainingMonths: number;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  tasks: Task[];
  order: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: 'study' | 'certificate' | 'activity' | 'portfolio';
}

export interface DailyMission {
  id: string;
  title: string;
  completed: boolean;
  category: 'study' | 'certificate' | 'activity' | 'portfolio';
}

export interface Roadmap {
  id: string;
  title: string;
  steps: RoadmapStep[];
  createdAt: string;
}

export interface UserProgress {
  streakDays: number;
  totalCompletedTasks: number;
  totalTasks: number;
  lastCheckIn: string | null;
}
