import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video } from "lucide-react";

interface CaptureButtonProps {
  mode: "photo" | "video";
  onCapture: (file: File) => void;
}

const CaptureButton = ({ mode, onCapture }: CaptureButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0]);
    }
  };

  return (
    <>
      <Button
        className={`py-4 px-6 rounded-lg text-lg font-semibold w-full flex items-center justify-center shadow-md ${
          mode === "photo" 
            ? "bg-primary text-white" 
            : "bg-white border-2 border-primary text-primary"
        }`}
        onClick={handleButtonClick}
      >
        {mode === "photo" ? (
          <Camera className="mr-2 h-5 w-5" />
        ) : (
          <Video className="mr-2 h-5 w-5" />
        )}
        {mode === "photo" ? "Take Photo" : "Record Video"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={mode === "photo" ? "image/*" : "video/*"}
        capture={mode === "photo" ? "environment" : "environment"}
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

export default CaptureButton;
