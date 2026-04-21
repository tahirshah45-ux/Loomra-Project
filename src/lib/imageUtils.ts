import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5, // 500KB limit
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: 'image/webp' as const, // Convert to WebP for faster uploads
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    return file; // Fallback to original file
  }
}
