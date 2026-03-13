'use client';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepProgressBar({ currentStep, totalSteps }: StepProgressBarProps) {
  return (
    <div className="w-full px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step < currentStep
                  ? 'bg-success-500 text-white'
                  : step === currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`w-12 sm:w-16 h-1 mx-1 transition-colors ${
                  step < currentStep ? 'bg-success-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <span className="text-sm text-slate-600">
          Step {currentStep} / {totalSteps}
        </span>
      </div>
    </div>
  );
}
