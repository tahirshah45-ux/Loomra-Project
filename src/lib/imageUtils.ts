import imageCompression from 'browser-image-compression';
import { Product } from '../types';

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

/**
 * Check if a product has at least one valid image
 */
export function hasValidImage(product: Product): boolean {
  if (!product) return false;
  
  // Check main image
  if (product.img && product.img.trim() !== '') return true;
  
  // Check images array
  if (product.images && product.images.length > 0 && product.images.some(img => img && img.trim() !== '')) return true;
  
  // Check color variant images
  if (product.colors && product.colors.length > 0) {
    for (const color of product.colors) {
      if (color.images && color.images.length > 0 && color.images.some(img => img && img.trim() !== '')) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get the primary product image URL
 */
export function getProductImage(product: Product): string {
  if (!product) return '';
  
  // Priority: main img > first image in images > first color variant image
  if (product.img && product.img.trim() !== '') return product.img;
  
  if (product.images && product.images.length > 0) {
    const validImg = product.images.find(img => img && img.trim() !== '');
    if (validImg) return validImg;
  }
  
  if (product.colors && product.colors.length > 0) {
    for (const color of product.colors) {
      if (color.images && color.images.length > 0) {
        const validImg = color.images.find(img => img && img.trim() !== '');
        if (validImg) return validImg;
      }
    }
  }
  
  return '';
}
