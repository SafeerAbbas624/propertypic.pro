import { Progress } from "@/components/ui/progress";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

const StepProgress = ({ currentStep, totalSteps }: StepProgressProps) => {
  const progressPercentage = ((currentStep) / totalSteps) * 100;

  return (
    <div>
      <div className="text-sm font-medium mb-2">
        Step <span>{currentStep}</span> of <span>{totalSteps}</span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="w-full h-2 bg-neutral-100 rounded-full shadow-inner" 
      />
    </div>
  );
};

export default StepProgress;
