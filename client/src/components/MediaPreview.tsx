import { useEffect, useState } from "react";

interface MediaPreviewProps {
  file: File;
  type: "photo" | "video";
}

const MediaPreview = ({ file, type }: MediaPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Free memory when this component is unmounted
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!previewUrl) {
    return (
      <div className="mb-6 w-full h-48 bg-gray-200 animate-pulse rounded-lg"></div>
    );
  }

  return (
    <div id="preview-container" className="mb-6">
      <p className="text-sm text-neutral-900/70 mb-2">Your capture:</p>
      <div className="relative">
        {type === "photo" ? (
          <img
            src={previewUrl}
            className="w-full h-48 object-cover rounded-lg shadow-sm"
            alt="Captured media"
          />
        ) : (
          <video
            src={previewUrl}
            className="w-full h-48 object-cover rounded-lg shadow-sm"
            controls
          />
        )}
      </div>
    </div>
  );
};

export default MediaPreview;
