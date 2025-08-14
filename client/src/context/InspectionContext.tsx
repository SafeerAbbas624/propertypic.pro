import React, {
  createContext,
  useReducer,
  useState,
  useCallback,
  useEffect,
} from "react";
import { getInspectionSteps, InspectionStep, PropertyFeatures } from "@/lib/inspectionSteps";
import { useFirebaseStorage } from "@/hooks/use-firebase-storage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { compressImage } from "@/lib/utils";

// Define the context state
interface InspectionContextState {
  token: string | null;
  propertyType: string;
  steps: InspectionStep[];
  currentStepIndex: number;
  totalSteps: number;
  currentStep: InspectionStep | null;
  selectedStep: InspectionStep | null;
  captureMode: "photo" | "video" | null;
  mediaFile: File | null;
  isReviewing: boolean;
  isCompleted: boolean;
  uploadProgress: number;
  isUploading: boolean;
  uploadedMedia: {
    stepId: string;
    fileUrl: string;
    fileType: "photo" | "video";
  }[];
  startInspection: (token: string, propertyType: string, bedrooms?: number, bathrooms?: number, features?: PropertyFeatures) => void;
  selectStep: (step: InspectionStep | null) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setCaptureMode: (mode: "photo" | "video") => void;
  setMediaFile: (file: File) => Promise<void>;
  confirmMedia: () => Promise<void>;
  retakeMedia: () => void;
  completeInspection: () => void;
  resetInspection: () => void;
}

// Create the context with a default value
export const InspectionContext = createContext<InspectionContextState | null>(
  null
);

// Define the initial state with proper typing
const initialState = {
  token: null as string | null,
  propertyType: "SFR",
  steps: [] as InspectionStep[],
  currentStepIndex: 0,
  selectedStep: null as InspectionStep | null,
  captureMode: null as "photo" | "video" | null,
  mediaFile: null as File | null,
  isReviewing: false,
  isCompleted: false,
  uploadProgress: 0,
  isUploading: false,
  uploadedMedia: [] as {
    stepId: string;
    fileUrl: string;
    fileType: "photo" | "video";
  }[],
};

export const InspectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState(initialState);
  const { uploadMedia, isUploading } = useFirebaseStorage();
  const { toast } = useToast();

  const startInspection = useCallback((token: string, propertyType: string, bedrooms = 3, bathrooms = 2, features: PropertyFeatures = {}) => {
    const steps = getInspectionSteps(propertyType, bedrooms, bathrooms, features);
    setState({
      ...initialState,
      token,
      propertyType,
      steps,
    });
  }, []);

  const selectStep = useCallback((step: InspectionStep | null) => {
    setState((prev) => ({
      ...prev,
      selectedStep: step,
      mediaFile: null,
      captureMode: null,
      isReviewing: false,
    }));
  }, []);

  const goToNextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStepIndex: prev.currentStepIndex + 1,
    }));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  }, []);

  const setCaptureMode = useCallback((mode: "photo" | "video") => {
    setState((prev) => ({
      ...prev,
      captureMode: mode,
    }));
  }, []);

  const setMediaFile = useCallback(async (file: File) => {
    try {
      // Compress the image if it's an image file
      const compressedFile = await compressImage(file);

      setState((prev) => ({
        ...prev,
        mediaFile: compressedFile,
        isReviewing: true,
      }));
    } catch (error) {
      console.error('Error compressing image:', error);
      // If compression fails, use the original file
      setState((prev) => ({
        ...prev,
        mediaFile: file,
        isReviewing: true,
      }));
    }
  }, []);

  // Helper function to find the next step to navigate to
  const findNextStep = useCallback((currentSelectedStep: InspectionStep, allSteps: InspectionStep[], uploadedSteps: string[]) => {
    const currentIndex = allSteps.findIndex(step => step.id === currentSelectedStep.id);
    if (currentIndex === -1) return null;

    // Find the next incomplete step in the same category
    const currentCategory = currentSelectedStep.category;
    const sameCategorySteps = allSteps.filter(step => step.category === currentCategory);
    const currentCategoryIndex = sameCategorySteps.findIndex(step => step.id === currentSelectedStep.id);

    // Look for next incomplete step in same category
    for (let i = currentCategoryIndex + 1; i < sameCategorySteps.length; i++) {
      if (!uploadedSteps.includes(sameCategorySteps[i].id)) {
        return sameCategorySteps[i];
      }
    }

    // If no more steps in current category, find first incomplete step in next category
    const categories = ['exterior', 'interior', 'bedrooms', 'bathrooms', 'utility', 'special'];
    const currentCategoryIndex2 = categories.indexOf(currentCategory);

    for (let catIndex = currentCategoryIndex2 + 1; catIndex < categories.length; catIndex++) {
      const nextCategorySteps = allSteps.filter(step => step.category === categories[catIndex]);
      for (const step of nextCategorySteps) {
        if (!uploadedSteps.includes(step.id)) {
          return step;
        }
      }
    }

    return null; // All steps completed
  }, []);

  const confirmMedia = useCallback(async () => {
    const targetStep = state.selectedStep || state.steps[state.currentStepIndex];
    if (!state.mediaFile || !state.token || !targetStep) return;

    try {
      // Check if Firebase is configured by seeing if an environment variable exists
      const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;
      
      // If Firebase is configured, attempt to upload
      let response = null;
      if (isFirebaseConfigured) {
        response = await uploadMedia(
          state.mediaFile,
          state.token,
          targetStep.id,
          targetStep.title
        );
      } else {
        // Mock a successful upload for demo purposes
        response = {
          fileUrl: URL.createObjectURL(state.mediaFile),
          metadata: { 
            filename: state.mediaFile.name,
            size: state.mediaFile.size,
            type: state.mediaFile.type
          }
        };
      }

      // Set uploading state
      setState((prev) => ({
        ...prev,
        isUploading: true,
        uploadProgress: 0,
      }));

      // Upload to server with progress tracking
      const formData = new FormData();
      formData.append('file', state.mediaFile);
      formData.append('token', state.token);
      formData.append('stepId', targetStep.id);
      formData.append('stepTitle', targetStep.title);
      
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setState((prev) => ({
              ...prev,
              uploadProgress: progress,
            }));
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              resolve({ fileUrl: 'uploaded successfully' });
            }
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
        
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      // Complete the upload process and find next step
      setState((prev) => {
        const newUploadedMedia = [
          ...prev.uploadedMedia,
          {
            stepId: targetStep.id, // Use targetStep.id instead of currentStep.id
            fileUrl: uploadResult?.fileUrl || "https://example.com/mock-url",
            fileType: prev.captureMode as "photo" | "video",
          },
        ];

        // Find the next step to navigate to
        const uploadedStepIds = newUploadedMedia.map(media => media.stepId);
        const nextStep = findNextStep(targetStep, prev.steps, uploadedStepIds);

        return {
          ...prev,
          uploadedMedia: newUploadedMedia,
          selectedStep: nextStep, // Automatically select the next step
          mediaFile: null,
          captureMode: null,
          isReviewing: false,
          isUploading: false,
          uploadProgress: 100,
          isCompleted: nextStep === null, // Mark as completed if no more steps
        };
      });

      toast({
        title: "Photo Uploaded",
        description: `${targetStep.title} saved successfully`,
      });
    } catch (error) {
      // Reset upload state on error
      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
      }));
      
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your media",
        variant: "destructive",
      });
      console.error("Media upload error:", error);
    }
  }, [state.mediaFile, state.token, state.currentStepIndex, state.steps, uploadMedia, toast]);

  const retakeMedia = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mediaFile: null,
      isReviewing: false,
    }));
  }, []);

  const completeInspection = useCallback(async () => {
    if (!state.token) return;

    try {
      await apiRequest("PUT", `/api/property-leads/${state.token}/complete`, {});
      
      setState((prev) => ({
        ...prev,
        isCompleted: true,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark inspection as complete",
        variant: "destructive",
      });
    }
  }, [state.token, toast]);

  const resetInspection = useCallback(() => {
    setState(initialState);
  }, []);

  // Calculate current step based on current index
  const currentStep = state.steps.length > 0 && state.currentStepIndex < state.steps.length
    ? state.steps[state.currentStepIndex]
    : null;

  const contextValue: InspectionContextState = {
    ...state,
    currentStep,
    totalSteps: state.steps.length,
    startInspection,
    selectStep,
    goToNextStep,
    goToPreviousStep,
    setCaptureMode,
    setMediaFile,
    confirmMedia,
    retakeMedia,
    completeInspection,
    resetInspection,
  };

  return (
    <InspectionContext.Provider value={contextValue}>
      {children}
    </InspectionContext.Provider>
  );
};
