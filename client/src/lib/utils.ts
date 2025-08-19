import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compresses an image file while maintaining quality
 * @param file - The image file to compress
 * @param maxWidth - Maximum width for the compressed image (default: 1920)
 * @param maxHeight - Maximum height for the compressed image (default: 1080)
 * @param quality - Compression quality (0.1 to 1.0, default: 0.8)
 * @returns Promise<File> - The compressed image file
 */
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Skip compression for non-image files
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File object with the compressed data
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validates video duration and compresses if needed
 * @param file - The video file to validate and compress
 * @param maxDurationSeconds - Maximum duration in seconds (default: 120 for 2 minutes)
 * @returns Promise<File> - The validated/compressed video file
 */
export function validateAndCompressVideo(
  file: File,
  maxDurationSeconds: number = 120
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Skip processing for non-video files
    if (!file.type.startsWith('video/')) {
      resolve(file);
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      // Check video duration
      if (video.duration > maxDurationSeconds) {
        reject(new Error(`Video duration (${Math.round(video.duration)}s) exceeds maximum allowed duration (${maxDurationSeconds}s)`));
        return;
      }

      // For now, we'll just return the original file
      // In a production environment, you might want to implement actual video compression
      // using libraries like FFmpeg.wasm, but that adds significant complexity and bundle size
      resolve(file);
    };

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}
