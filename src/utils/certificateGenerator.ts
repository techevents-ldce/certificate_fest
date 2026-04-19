import { jsPDF } from 'jspdf';
import type { CertificateConfig, Member } from '../types';

/**
 * Convert an image Blob to a PDF Blob
 */
export async function convertBlobToPDF(imageBlob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imgData = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        
        const doc = new jsPDF({
          orientation: width > height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [width, height]
        });
        
        doc.addImage(imgData, 'JPEG', 0, 0, width, height, undefined, 'FAST');
        resolve(doc.output('blob'));
      };
      img.onerror = reject;
      img.src = imgData;
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });
}

/**
 * Load a custom font from file
 */
export async function loadCustomFont(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fontData = e.target?.result as string;
        resolve(fontData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to load font'));
    reader.readAsDataURL(file);
  });
}

/**
 * Create a font face CSS rule for custom font
 */
export function createFontFace(fontFamily: string, fontDataURL: string): string {
  return `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${fontDataURL}') format('truetype');
    }
  `;
}

/**
 * Generate a single certificate image with member name
 */
export async function generateCertificate(
  templateImage: string,
  member: Member,
  config: CertificateConfig,
  fontFamily: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = templateImage;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        // Draw template image
        ctx.drawImage(img, 0, 0);

        // Configure text styling
        const fontStyle = `${config.italic ? 'italic' : ''} ${config.bold ? 'bold' : ''} ${config.fontSize}px ${fontFamily}`.trim();
        ctx.font = fontStyle;
        ctx.fillStyle = config.textColor;
        ctx.textBaseline = 'middle';

        // Set text alignment
        if (config.alignment === 'left') {
          ctx.textAlign = 'left';
        } else if (config.alignment === 'right') {
          ctx.textAlign = 'right';
        } else {
          ctx.textAlign = 'center';
        }

        // Draw member name
        ctx.fillText(member.fullName, config.namePosition.x, config.namePosition.y);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate certificate'));
          }
        }, 'image/jpeg', 0.8);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load template image'));
  });
}

/**
 * Generate preview of certificate with a sample name
 */
export async function generateCertificatePreview(
  templateImage: string,
  sampleName: string,
  config: CertificateConfig,
  fontFamily: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = templateImage;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.drawImage(img, 0, 0);

        const fontStyle = `${config.italic ? 'italic' : ''} ${config.bold ? 'bold' : ''} ${config.fontSize}px ${fontFamily}`.trim();
        ctx.font = fontStyle;
        ctx.fillStyle = config.textColor;
        ctx.textBaseline = 'middle';

        if (config.alignment === 'left') {
          ctx.textAlign = 'left';
        } else if (config.alignment === 'right') {
          ctx.textAlign = 'right';
        } else {
          ctx.textAlign = 'center';
        }

        ctx.fillText(sampleName, config.namePosition.x, config.namePosition.y);

        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load template image'));
  });
}

/**
 * Batch generate certificates for all members
 */
export async function generateBatchCertificates(
  templateImage: string,
  members: Member[],
  config: CertificateConfig,
  fontFamily: string,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<{ member: Member; certificate: Blob }[]> {
  const results: { member: Member; certificate: Blob }[] = [];

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    try {
      const certificateImage = await generateCertificate(
        templateImage,
        member,
        config,
        fontFamily
      );
      
      // Convert image to PDF as requested by user
      const certificate = await convertBlobToPDF(certificateImage);
      
      results.push({ member, certificate });
    } catch (error) {
      console.error(`Failed to generate certificate for ${member.fullName}:`, error);
    }

    if (onProgress) {
      onProgress({ current: i + 1, total: members.length });
    }
  }

  return results;
}

/**
 * Create ZIP file from certificates
 */
export async function createZipFromCertificates(
  _certificates: { member: Member; certificate: Blob }[]
): Promise<Blob> {
  // This requires JSZip library - you'll need to install it
  // For now, returning a placeholder
  throw new Error('ZIP creation requires additional library. Install jszip package.');
}
