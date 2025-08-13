import { InspectionStep } from "@/lib/inspectionSteps";

interface StepInstructionProps {
  step: InspectionStep;
}

const StepInstruction = ({ step }: StepInstructionProps) => {
  return (
    <div className="flex flex-col mb-6">
      <div className="step-instruction mb-4">
        <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
        <p className="text-base mb-4">{step.description}</p>
      </div>
      
      <div className="example-image mb-6">
        <p className="text-sm text-neutral-900/70 mb-2">Example:</p>
        <img 
          src={step.exampleImageUrl} 
          alt={`Example of ${step.title}`} 
          className="w-full h-48 object-cover rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
};

export default StepInstruction;
