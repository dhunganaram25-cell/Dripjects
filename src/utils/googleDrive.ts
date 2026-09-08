/**
 * Google Drive URL Utilities for Dripjects
 * Converts user Google Drive sharing URLs into immediate direct download links
 */

export interface GoogleDriveInfo {
  isGoogleDrive: boolean;
  fileId: string | null;
  directDownloadUrl: string;
  previewUrl: string;
  alternateDownloadUrl: string;
}

/**
 * Extracts Google Drive file ID from any standard Google Drive URL format
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/FILE_ID/
  const fileDPattern = /\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const match1 = trimmed.match(fileDPattern);
  if (match1 && match1[1]) return match1[1];

  // Pattern 2: id=FILE_ID or &id=FILE_ID
  const idPattern = /[?&]id=([a-zA-Z0-9_-]+)/i;
  const match2 = trimmed.match(idPattern);
  if (match2 && match2[1]) return match2[1];

  // Pattern 3: /folders/FOLDER_ID
  const folderPattern = /\/folders\/([a-zA-Z0-9_-]+)/i;
  const match3 = trimmed.match(folderPattern);
  if (match3 && match3[1]) return match3[1];

  // Pattern 4: User just pasted the raw Google Drive ID (typically 28-44 chars alphanumeric with _ -)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Converts any Google Drive link or ID into direct download info
 */
export function parseGoogleDriveUrl(url: string): GoogleDriveInfo {
  if (!url) {
    return {
      isGoogleDrive: false,
      fileId: null,
      directDownloadUrl: '',
      previewUrl: '',
      alternateDownloadUrl: '',
    };
  }

  const fileId = extractGoogleDriveFileId(url);

  if (fileId) {
    return {
      isGoogleDrive: true,
      fileId,
      // Official direct export download endpoint:
      directDownloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      // Google User Content direct link endpoint:
      alternateDownloadUrl: `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0`,
      // Preview web page:
      previewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
    };
  }

  // If not a recognized Google Drive URL, return the original url as the download target
  return {
    isGoogleDrive: false,
    fileId: null,
    directDownloadUrl: url,
    previewUrl: url,
    alternateDownloadUrl: url,
  };
}

/**
 * Triggers direct browser download for a given URL
 */
export function triggerDirectDownload(url: string, fileName?: string): void {
  if (!url) return;

  let downloadUrl = url;
  if (!url.includes('drive.usercontent.google.com') && !url.includes('export=download')) {
    const driveInfo = parseGoogleDriveUrl(url);
    downloadUrl = driveInfo.directDownloadUrl || url;
  }

  // Create an anchor element and click it
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  if (fileName) {
    link.download = fileName;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
