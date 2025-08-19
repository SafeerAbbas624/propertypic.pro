import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useInspection } from "@/hooks/use-inspection";
import FlexibleInspectionView from "@/components/FlexibleInspectionView";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Home, Check, MapPin, Bed, Bath, Square, Camera, Upload } from "lucide-react";
import { PropertyLead } from "@shared/schema";

const PropertyMediaUpload = () => {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  
  const {
    steps,
    selectedStep,
    captureMode,
    mediaFile,
    isReviewing,
    isCompleted,
    uploadProgress,
    isUploading,
    uploadedMedia,
    startInspection,
    selectStep,
    setCaptureMode,
    setMediaFile,
    confirmMedia,
    retakeMedia,
    completeInspection,
    resetInspection,
    resetSelectedSteps,
  } = useInspection();

  // Fetch property lead data to verify token and get property details
  const { data: propertyLead, isLoading, error } = useQuery<PropertyLead>({
    queryKey: [`/api/property-leads/${token}`],
    retry: false
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Invalid Token",
        description: "The inspection token is invalid or has expired.",
        variant: "destructive",
      });
      navigate("/");
    }

    if (propertyLead && !isLoading) {
      // Parse special features from notes
      const specialFeatures = propertyLead.notes
        ? propertyLead.notes.split(',').map(f => f.trim()).filter(f => f.length > 0)
        : [];

      const features = {
        hasPool: (propertyLead as any).hasPool || false,
        hasBasement: (propertyLead as any).hasBasement || false,
        hasGarage: (propertyLead as any).hasGarage || false,
        specialFeatures
      };

      startInspection(
        token,
        propertyLead.propertyType || "SFR",
        propertyLead.bedrooms || 3,
        propertyLead.bathrooms || 2,
        features
      ).catch(error => {
        console.error('Failed to start inspection:', error);
        toast({
          title: "Error",
          description: "Failed to load inspection data",
          variant: "destructive",
        });
      });
    }
  }, [propertyLead, isLoading, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <p className="mb-2">Loading inspection data...</p>
        </div>
      </div>
    );
  }
  


  return (
    <FlexibleInspectionView
      steps={steps}
      uploadedMedia={uploadedMedia}
      onStepSelect={selectStep}
      onCapture={async (file, mode) => {
        setCaptureMode(mode);
        await setMediaFile(file);
      }}
      onConfirmMedia={confirmMedia}
      onRetakeMedia={retakeMedia}
      onCompleteInspection={completeInspection}
      onGoHome={() => navigate("/")}
      onResetSelectedSteps={resetSelectedSteps}
      selectedStep={selectedStep}
      mediaFile={mediaFile}
      captureMode={captureMode}
      isReviewing={!!mediaFile}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      isCompleted={isCompleted}
    />
  );


};

export default PropertyMediaUpload;
