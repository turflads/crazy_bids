/**
 * Player Image Resolver
 * 
 * Handles multiple image sources for player photos:
 * - Local file paths (e.g., "player1.jpg" → "/player_images/player1.jpg")
 * - Google Drive links (various formats → direct view URL)
 * - Remote URLs (direct image links)
 * 
 * Supports Google Drive URL patterns:
 * - https://drive.google.com/file/d/{FILE_ID}/view
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}
 * - https://docs.google.com/...sharing links
 */

export type ImageSource = 'local' | 'gdrive' | 'remote' | 'unknown';

export interface ResolvedImage {
  resolvedUrl: string;
  sourceKind: ImageSource;
  originalValue: string;
}

/**
 * Extracts Google Drive file ID from various URL formats
 */
function extractGoogleDriveFileId(url: string): string | null {
  // Pattern 1: /file/d/{FILE_ID}/
  const filePattern = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  let match = url.match(filePattern);
  if (match) return match[1];

  // Pattern 2: /open?id={FILE_ID}
  const openPattern = /[?&]id=([a-zA-Z0-9_-]+)/;
  match = url.match(openPattern);
  if (match) return match[1];

  // Pattern 3: /uc?id={FILE_ID}
  const ucPattern = /\/uc\?.*id=([a-zA-Z0-9_-]+)/;
  match = url.match(ucPattern);
  if (match) return match[1];

  // Pattern 4: docs.google.com with resourcekey
  const docsPattern = /docs\.google\.com.*\/d\/([a-zA-Z0-9_-]+)/;
  match = url.match(docsPattern);
  if (match) return match[1];

  return null;
}

/**
 * Classifies image source type based on URL pattern
 */
function classifyImageSource(value: string): ImageSource {
  if (!value || value.trim() === '') {
    return 'unknown';
  }

  const trimmed = value.trim();

  // Check for HTTP/HTTPS URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Check if it's a Google Drive URL
    if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
      return 'gdrive';
    }
    // Generic remote URL
    return 'remote';
  }

  // No protocol = local filename
  return 'local';
}

/**
 * Converts Google Drive sharing URL to direct view URL
 * Uses thumbnail API which is more reliable for embedding
 */
function convertGoogleDriveUrl(url: string): string | null {
  const fileId = extractGoogleDriveFileId(url);
  
  if (!fileId) {
    console.warn(`[Image Resolver] Could not extract file ID from Google Drive URL: ${url}`);
    return null;
  }

  // Try multiple URL formats for best compatibility:
  // 1. Thumbnail API (most reliable for images)
  // 2. Direct download format (fallback)
  // Using thumbnail with size parameter for better quality
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/**
 * Main resolver function - converts any photo value to a render-ready URL
 */
export function resolvePlayerImage(photoValue: string | undefined | null): ResolvedImage {
  // Handle empty/null values
  if (!photoValue || photoValue.trim() === '') {
    return {
      resolvedUrl: '',
      sourceKind: 'unknown',
      originalValue: photoValue || ''
    };
  }

  const trimmed = photoValue.trim();
  const sourceKind = classifyImageSource(trimmed);

  switch (sourceKind) {
    case 'local':
      // Prepend local path for attached assets
      return {
        resolvedUrl: `/player_images/${trimmed}`,
        sourceKind: 'local',
        originalValue: trimmed
      };

    case 'gdrive':
      // Convert to direct view URL
      const directUrl = convertGoogleDriveUrl(trimmed);
      if (!directUrl) {
        // Fallback to empty if conversion fails
        return {
          resolvedUrl: '',
          sourceKind: 'gdrive',
          originalValue: trimmed
        };
      }
      return {
        resolvedUrl: directUrl,
        sourceKind: 'gdrive',
        originalValue: trimmed
      };

    case 'remote':
      // Use URL as-is for generic remote images
      return {
        resolvedUrl: trimmed,
        sourceKind: 'remote',
        originalValue: trimmed
      };

    default:
      return {
        resolvedUrl: '',
        sourceKind: 'unknown',
        originalValue: trimmed
      };
  }
}

/**
 * Batch resolver for multiple players (useful for Excel import)
 */
export function resolvePlayerImages(photoValues: (string | undefined | null)[]): ResolvedImage[] {
  return photoValues.map(resolvePlayerImage);
}

/**
 * Validates if a Google Drive link can be parsed
 */
export function isValidGoogleDriveLink(url: string): boolean {
  if (!url || !url.includes('drive.google.com') && !url.includes('docs.google.com')) {
    return false;
  }
  return extractGoogleDriveFileId(url) !== null;
}
