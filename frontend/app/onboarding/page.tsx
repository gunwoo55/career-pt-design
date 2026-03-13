'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import StepProgressBar from '@/components/onboarding/StepProgressBar';
import Step1Job from '@/components/onboarding/Step1Job';
import Step2Spec from '@/components/onboarding/Step2Spec';
import Step3Period from '@/components/onboarding/Step3Period';
import Step4Loading from '@/components/onboarding/Step4Loading';
import Step5Result from '@/components/onboarding/Step5Result';
import { useOnboardingStore, useRoadmapStore } from '@/store';

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { currentStep, userSpec, setStep, updateUserSpec, resetOnboarding } = useOnboardingStore();
  const { setRoadmap } = useRoadmapStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStep1Submit = (data: { targetJob: string }) => {
    updateUserSpec({ targetJob: data.targetJob });
    setStep(2);
  };

  const handleStep2Submit = (data: { gpa: number; certifications: string[]; activities: string[] }) => {
    updateUserSpec({
      gpa: data.gpa,
      certifications: data.certifications,
      activities: data.activities,
    });
    setStep(3);
  };

  const handleStep3Submit = (data: { remainingMonths: number }) => {
    updateUserSpec({ remainingMonths: data.remainingMonths });
    setStep(4);
  };

  const handleLoadingComplete = () => {
    // 더미 로드맵 설정
    setRoadmap({
      id: '1',
      title: `${userSpec.targetJob} 취업 로드맵`,
      steps: [
        {
          id: 'step-1',
          title: '기초 다지기',
          description: '필수 기술 스택 학습',
          duration: '1-2개월',
          order: 1,
          tasks: [
            { id: 't1', title: '프로그래밍 기초 완성', completed: false, category: 'study' as const },
            { id: 't2', title: 'Git/GitHub 마스터', completed: false, category: 'study' as const },
          ],
        },
        {
          id: 'step-2',
          title: '심화 학습',
          description: '전문 기술 습득',
          duration: '2-3개월',
          order: 2,
          tasks: [
            { id: 't3', title: '프레임워크 학습', completed: false, category: 'study' as const },
            { id: 't4', title: '데이터베이스 설계', completed: false, category: 'portfolio' as const },
          ],
        },
        {
          id: 'step-3',
          title: '실전 프로젝트',
          description: '포트폴리오 준비',
          duration: '2개월',
          order: 3,
          tasks: [
            { id: 't5', title: '토이 프로젝트 완성', completed: false, category: 'portfolio' as const },
            { id: 't6', title: '코드 리뷰 참여', completed: false, category: 'activity' as const },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
    });
    setStep(5);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Job
            defaultValue={userSpec.targetJob}
            onSubmit={handleStep1Submit}
          />
        );
      case 2:
        return (
          <Step2Spec
            defaultValues={{
              gpa: userSpec.gpa,
              certifications: userSpec.certifications,
              activities: userSpec.activities,
            }}
            onSubmit={handleStep2Submit}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step3Period
            defaultValue={userSpec.remainingMonths}
            onSubmit={handleStep3Submit}
            onBack={handleBack}
          />
        );
      case 4:
        return <Step4Loading onComplete={handleLoadingComplete} />;
      case 5:
        return (
          <Step5Result
            targetJob={userSpec.targetJob || ''}
            remainingMonths={userSpec.remainingMonths || 6}
          />
        );
      default:
        return null;
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <Layout showNav={false}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">Career PT</h1>
            {currentStep < 5 && (
              <button
                onClick={() => {
                  resetOnboarding();
                  router.push('/dashboard');
                }}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                건
              </button>
            )}
          </div>
          <p className="text-slate-500 mt-1">AI와 함께하는 취업 준비</p>
        </div>

        {/* Progress Bar */}
        {currentStep < 5 && <StepProgressBar currentStep={currentStep} totalSteps={4} />}

        {/* Content */}
        <div className="flex-1 px-6 py-4 animate-fade-in">
          {renderStep()}
        </div>
      </div>
    </Layout>
  );
}
