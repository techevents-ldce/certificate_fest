import type { Member, SendingProgress } from '../types';

/**
 * Send certificate email to a single recipient
 */
export async function sendCertificateEmail(
  member: Member,
  certificateBlob: Blob,
  subject: string,
  body: string,
  resendApiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Replace {{name}} placeholder with member's actual name
    const personalizedBody = body.replace(/\{\{name\}\}/g, member.fullName);

    // Prepare form data
    const formData = new FormData();
    formData.append('from', 'noreply@lakshya.dev');
    formData.append('to', member.email);
    formData.append('subject', subject);
    formData.append('html', personalizedBody);

    // Add attachment
    formData.append(
      'attachments',
      certificateBlob,
      `${member.fullName.replace(/\s+/g, '_')}_Certificate.pdf`
    );

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Failed to send email'
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
  resendApiKey: string,
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
      body,
      resendApiKey
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
