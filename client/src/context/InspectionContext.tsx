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
  setMediaFile: (file: File) => void;
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

  const setMediaFile = useCallback((file: File) => {
    setState((prev) => ({
      ...prev,
      mediaFile: file,
      isReviewing: true,
    }));
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

      // Complete the upload process
      setState((prev) => ({
        ...prev,
        uploadedMedia: [
          ...prev.uploadedMedia,
          {
            stepId: currentStep.id,
            fileUrl: uploadResult?.fileUrl || "https://example.com/mock-url",
            fileType: prev.captureMode as "photo" | "video",
          },
        ],
        mediaFile: null,
        captureMode: null,
        isReviewing: false,
        isUploading: false,
        uploadProgress: 100,
      }));

      // If we've completed all steps, mark as completed
      if (state.currentStepIndex >= state.steps.length - 1) {
        setState((prev) => ({ ...prev, isCompleted: true }));
      } else {
        // Otherwise, go to next step
        setState((prev) => ({
          ...prev,
          currentStepIndex: prev.currentStepIndex + 1,
        }));
      }

      toast({
        title: "Photo Uploaded",
        description: `${currentStep.title} saved to Google Drive`,
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
