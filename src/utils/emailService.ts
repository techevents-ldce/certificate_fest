import type { Member, SendingProgress } from '../types';

/**
 * Send certificate email via internal API
 */
export async function sendCertificateEmail(
  member: Member,
  certificateBlob: Blob,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const personalizedBody = body.replace(/\{\{name\}\}/g, member.fullName);

    // Convert Blob to Base64 for the serverless function
    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(certificateBlob);
    });

    const response = await fetch('/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: member.email,
        subject,
        html: personalizedBody.replace(/\n/g, '<br/>'),
        attachment: base64Content,
        filename: `${member.fullName.replace(/\s+/g, '_')}_Certificate.pdf`
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to send email';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Not a JSON response, likely an HTML error page or "Request Entity Too Large"
        errorMessage = await response.text();
      }
      return {
        success: false,
        error: errorMessage.length > 100 ? errorMessage.substring(0, 100) + '...' : errorMessage
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Send certificates to all members
 */
export async function sendCertificates(
  members: Member[],
  certificateBlobs: Map<string, Blob>,
  subject: string,
  body: string,
  onProgress?: (progress: SendingProgress) => void
): Promise<SendingProgress> {
  const progress: SendingProgress = {
    total: members.length,
    sent: 0,
    failed: 0,
    failedRecipients: []
  };

  for (const member of members) {
    const certificateBlob = certificateBlobs.get(member.email);
    if (!certificateBlob) {
      progress.failed++;
      progress.failedRecipients.push({
        email: member.email,
        error: 'Certificate not found'
      });
      continue;
    }

    const result = await sendCertificateEmail(
      member,
      certificateBlob,
      subject,
      body
    );

    if (result.success) {
      progress.sent++;
    } else {
      progress.failed++;
      progress.failedRecipients.push({
        email: member.email,
        error: result.error || 'Unknown error'
      });
    }

    if (onProgress) {
      onProgress(progress);
    }
  }

  return progress;
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(subject: string, body: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!subject.trim()) {
    errors.push('Subject line cannot be empty');
  }

  if (!body.trim()) {
    errors.push('Email body cannot be empty');
  }

  if (!body.includes('{{name}}')) {
    errors.push('Email body should include {{name}} placeholder for personalization');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
