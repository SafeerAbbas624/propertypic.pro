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
      );
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
  
  if (isCompleted) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col bg-neutral-100">
        <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
          <div className="bg-status-success text-white rounded-full p-4 inline-flex mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">All Done!</h1>
          <p className="text-lg mb-6">Thank you for completing your property inspection.</p>
          <p className="text-base text-neutral-900/80 mb-8">Your media has been successfully uploaded and saved.</p>

          <div className="grid grid-cols-2 gap-2 w-full mb-8">
            {/* This would be replaced with actual uploaded media in a production app */}
            <div className="w-full h-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-full h-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-full h-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-full h-28 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <Button 
          className="bg-primary text-white py-4 px-6 rounded-lg text-lg font-semibold w-full flex items-center justify-center shadow-md"
          onClick={() => navigate("/")}
        >
          <Home className="mr-2 h-5 w-5" />
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <FlexibleInspectionView
      steps={steps}
      uploadedMedia={uploadedMedia}
      onStepSelect={selectStep}
      onCapture={(file, mode) => {
        setCaptureMode(mode);
        setMediaFile(file);
      }}
      onConfirmMedia={confirmMedia}
      onRetakeMedia={retakeMedia}
      onCompleteInspection={completeInspection}
      onGoHome={() => navigate("/")}
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
