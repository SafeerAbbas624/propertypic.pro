import { useState } from "react";
import { InspectionStep } from "@/lib/inspectionSteps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Check, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import CaptureButton from "./CaptureButton";
import MediaPreview from "./MediaPreview";

interface FlexibleInspectionViewProps {
  steps: InspectionStep[];
  uploadedMedia: Array<{
    stepId: string;
    fileUrl: string;
    fileType: "photo" | "video";
  }>;
  onStepSelect: (step: InspectionStep) => void;
  onCapture: (file: File, mode: "photo" | "video") => void;
  onConfirmMedia: () => Promise<void>;
  onRetakeMedia: () => void;
  onCompleteInspection: () => void;
  onGoHome: () => void;
  selectedStep: InspectionStep | null;
  mediaFile: File | null;
  captureMode: "photo" | "video" | null;
  isReviewing: boolean;
  isUploading: boolean;
  uploadProgress: number;
  isCompleted: boolean;
}

const FlexibleInspectionView = ({
  steps,
  uploadedMedia,
  onStepSelect,
  onCapture,
  onConfirmMedia,
  onRetakeMedia,
  onCompleteInspection,
  onGoHome,
  selectedStep,
  mediaFile,
  captureMode,
  isReviewing,
  isUploading,
  uploadProgress,
  isCompleted
}: FlexibleInspectionViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group steps by category
  const stepsByCategory = steps.reduce((acc, step) => {
    if (!acc[step.category]) {
      acc[step.category] = [];
    }
    acc[step.category].push(step);
    return acc;
  }, {} as Record<string, InspectionStep[]>);

  // Calculate completion stats
  const completedSteps = uploadedMedia.length;
  const totalSteps = steps.length;
  const completionPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const isStepCompleted = (stepId: string) => {
    return uploadedMedia.some(media => media.stepId === stepId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exterior': return '🏠';
      case 'interior': return '🛋️';
      case 'bedrooms': return '🛏️';
      case 'bathrooms': return '🚿';
      case 'utility': return '🔧';
      case 'special': return '⭐';
      default: return '📷';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'exterior': return 'Exterior';
      case 'interior': return 'Interior - Main Living Areas';
      case 'bedrooms': return 'Bedrooms';
      case 'bathrooms': return 'Bathrooms';
      case 'utility': return 'Utility & Condition';
      case 'special': return 'Special Features';
      default: return category;
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inspection Complete!</h2>
            <p className="text-gray-600 mb-6">
              All {totalSteps} photos have been captured and uploaded successfully.
            </p>
            <Button onClick={onGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedStep) {
    return (
      <div className="min-h-screen bg-neutral-100 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => onStepSelect(null as any)}
              className="p-2"
            >
              ← Back to List
            </Button>
            <Badge variant={isStepCompleted(selectedStep.id) ? "default" : "secondary"}>
              {isStepCompleted(selectedStep.id) ? "Completed" : "Pending"}
            </Badge>
          </div>

          {/* Step Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{selectedStep.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{selectedStep.description}</p>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Example:</p>
                <img 
                  src={selectedStep.exampleImageUrl} 
                  alt={`Example of ${selectedStep.title}`} 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Preview */}
          {mediaFile && (
            <MediaPreview 
              file={mediaFile} 
              type={captureMode || 'photo'} 
            />
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isReviewing ? (
              <>
                <CaptureButton 
                  mode="photo" 
                  onCapture={(file) => onCapture(file, 'photo')} 
                />
                <CaptureButton 
                  mode="video" 
                  onCapture={(file) => onCapture(file, 'video')} 
                />
              </>
            ) : (
              <div className="space-y-3">
                <Button 
                  onClick={onConfirmMedia}
                  disabled={isUploading}
                  className="w-full h-12 bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? `Uploading... ${uploadProgress}%` : 'Confirm & Upload'}
                </Button>
                <Button 
                  onClick={onRetakeMedia}
                  variant="outline"
                  className="w-full h-12"
                  disabled={isUploading}
                >
                  Retake
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Inspection</h1>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{completedSteps} of {totalSteps} photos</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {Object.entries(stepsByCategory).map(([category, categorySteps]) => {
            const completedInCategory = categorySteps.filter(step => isStepCompleted(step.id)).length;
            const totalInCategory = categorySteps.length;
            
            return (
              <Card key={category} className="overflow-hidden">
                <CardHeader 
                  className="pb-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <div>
                        <CardTitle className="text-base">{getCategoryTitle(category)}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {completedInCategory} of {totalInCategory} completed
                        </p>
                      </div>
                    </div>
                    <ChevronRight 
                      className={cn(
                        "h-5 w-5 text-gray-400 transition-transform",
                        selectedCategory === category && "rotate-90"
                      )}
                    />
                  </div>
                </CardHeader>
                
                {selectedCategory === category && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {categorySteps.map((step) => (
                        <Button
                          key={step.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-between h-auto p-3 text-left",
                            isStepCompleted(step.id) && "bg-green-50 border-green-200"
                          )}
                          onClick={() => onStepSelect(step)}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{step.title}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isStepCompleted(step.id) && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                            <Camera className="h-4 w-4 text-gray-400" />
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Complete Inspection Button */}
        {completedSteps === totalSteps && (
          <Card className="mt-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <Button 
                onClick={onCompleteInspection}
                className="w-full h-12 bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Complete Inspection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FlexibleInspectionView;
