import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

interface UploadResponse {
  fileUrl: string;
  metadata: Record<string, unknown>;
}

export const useFirebaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadMedia = async (
    file: File,
    token: string,
    stepId: string,
    stepTitle: string
  ): Promise<UploadResponse | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Create a FormData instance to send the file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("token", token);
      formData.append("stepId", stepId);
      formData.append("stepTitle", stepTitle);
      formData.append("fileType", file.type.includes("image") ? "photo" : "video");

      // Use XMLHttpRequest for progress tracking
      return await new Promise<UploadResponse | null>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            setIsUploading(false);
            resolve(response);
          } else {
            setError("Upload failed");
            setIsUploading(false);
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        
        xhr.addEventListener("error", () => {
          setError("Network error during upload");
          setIsUploading(false);
          reject(new Error("Network error during upload"));
        });
        
        xhr.open("POST", "/api/upload", true);
        xhr.send(formData);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error during upload");
      setIsUploading(false);
      return null;
    }
  };

  return {
    uploadMedia,
    isUploading,
    uploadProgress,
    error
  };
};
