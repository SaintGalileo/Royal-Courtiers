/**
 * Cloudinary URL transformations to handle auto-format (f_auto) and quality (q_auto).
 * This ensures that even if an image is uploaded as a .heic file, it loads correctly
 * in all browsers by being served as a web-compatible format (like JPEG or WEBP).
 */
export function getOptimizedUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // Only apply transformations to Cloudinary URLs
  if (url.includes("cloudinary.com")) {
    // If the URL already has transformations, skip it to avoid conflicts
    if (url.includes("/upload/f_auto,q_auto/")) return url;
    
    // Inject auto-format and auto-quality transformations
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  }
  
  return url;
}
