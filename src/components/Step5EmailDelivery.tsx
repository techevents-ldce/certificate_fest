import { useState } from 'react';
import type { Member, SendingProgress } from '../types';
import { sendCertificates, validateEmailConfig } from '../utils/emailService';
import styles from './Step5EmailDelivery.module.css';

interface Step5EmailDeliveryProps {
  members: Member[];
  certificates: { member: Member; certificate: Blob }[];
  onEmailsSent?: (progress: SendingProgress) => void;
  isLoading?: boolean;
}

export const Step5EmailDelivery: React.FC<Step5EmailDeliveryProps> = ({
  members,
  certificates,
  onEmailsSent,
  isLoading = false
}) => {
  const [subject, setSubject] = useState('Your Certificate from Lakshya TechFest 2025');
  const [body, setBody] = useState(
    'Dear {{name}},\n\nCongratulations! We are pleased to send you your certificate for participating in Lakshya TechFest 2025.\n\nBest regards,\nThe Lakshya Team'
  );
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<SendingProgress | null>(null);
  const [error, setError] = useState<string>('');

  const handleSendAll = async () => {
    setError('');

    // Validate configuration
    const validation = validateEmailConfig(subject, body);
    if (!validation.isValid) {
      setError(validation.errors.join('; '));
      return;
    }

    setSending(true);
    // Create certificate map
    const certificateMap = new Map<string, Blob>();
    certificates.forEach(({ member, certificate }) => {
      certificateMap.set(member.email, certificate);
    });

    setSending(true);
    try {
      const result = await sendCertificates(
        members,
        certificateMap,
        subject,
        body,
        (prog) => {
          setProgress(prog);
          onEmailsSent?.(prog);
        }
      );

      setProgress(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send certificates');
    } finally {
      setSending(false);
    }
  };

  const handleRetryFailed = async () => {
    if (!progress?.failedRecipients || progress.failedRecipients.length === 0) {
      setError('No failed recipients to retry');
      return;
    }

    const failedMembers = members.filter((m) =>
      progress.failedRecipients.some((f) => f.email === m.email)
    );

    const certificateMap = new Map<string, Blob>();
    certificates.forEach(({ member, certificate }) => {
      certificateMap.set(member.email, certificate);
    });

    setSending(true);
    try {
      const result = await sendCertificates(
        failedMembers,
        certificateMap,
        subject,
        body,
        (prog) => {
          setProgress((prev) =>
            prev
              ? {
                  ...prev,
                  sent: prev.sent + prog.sent,
                  failed: prev.failed + prog.failed,
                  failedRecipients: [
                    ...prev.failedRecipients.filter(
                      (f) => !prog.failedRecipients.some((nf) => nf.email === f.email)
                    ),
                    ...prog.failedRecipients
                  ]
                }
              : prog
          );
        }
      );

      setProgress(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry sending');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Step 5: Email Delivery to All Recipients</h2>
        <p className={styles.description}>
          Configure the email message and send certificates to all {members.length} members.
        </p>

        {/* Email Configuration */}
        {!progress && (
          <div className={styles.emailConfig}>
            <div className={styles.section}>
              <label>
                <strong>Email Subject:</strong>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={sending || isLoading}
                  className={styles.input}
                />
              </label>
            </div>

            <div className={styles.section}>
              <label>
                <strong>Email Body:</strong>
                <p className={styles.hint}>Use {'{{name}}'} placeholder for personalization</p>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={sending || isLoading}
                  className={styles.textarea}
                  rows={6}
                />
              </label>
            </div>

            {/* Email Preview */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={styles.previewBtn}
              disabled={sending || isLoading}
            >
              {showPreview ? '✓ Hide Email Preview' : '👁️ Show Email Preview'}
            </button>

            {showPreview && (
              <div className={styles.previewEmail}>
                <h4>Email Preview (for {members[0]?.fullName}):</h4>
                <div className={styles.emailPreview}>
                  <p>
                    <strong>To:</strong> {members[0]?.email}
                  </p>
                  <p>
                    <strong>Subject:</strong> {subject}
                  </p>
                  <hr />
                  <p>{body.replace('{{name}}', members[0]?.fullName || 'John Doe')}</p>
                </div>
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}

            <button
              onClick={handleSendAll}
              disabled={sending || isLoading}
              className={styles.sendBtn}
            >
              {sending ? '📧 Sending...' : '✓ Send Certificates to All Members'}
            </button>
          </div>
        )}

        {/* Sending Progress */}
        {progress && (
          <div className={styles.progressSection}>
            <h3>📧 Delivery Status</h3>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total:</span>
                <span className={styles.statValue}>{progress.total}</span>
              </div>
              <div className={styles.stat + ' ' + styles.success}>
                <span className={styles.statLabel}>Sent:</span>
                <span className={styles.statValue}>{progress.sent}</span>
              </div>
              <div className={styles.stat + ' ' + styles.failed}>
                <span className={styles.statLabel}>Failed:</span>
                <span className={styles.statValue}>{progress.failed}</span>
              </div>
            </div>

            {progress.failedRecipients.length > 0 && (
              <div className={styles.failedList}>
                <h4>Failed Recipients:</h4>
                <ul>
                  {progress.failedRecipients.map((recipient, idx) => (
                    <li key={idx}>
                      {recipient.email}: {recipient.error}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleRetryFailed}
                  disabled={sending || isLoading}
                  className={styles.retryBtn}
                >
                  🔄 Retry Failed Recipients
                </button>
              </div>
            )}

            {progress.total > 0 && progress.failed === 0 && (
              <div className={styles.success}>
                <p>✓ All {progress.sent} certificates sent successfully as PDF attachments!</p>
              </div>
            )}
            {progress.total === 0 && progress.sent === 0 && (
              <div className={styles.error}>
                <p>⚠️ No members found to process. Please go back to Step 1 and upload a valid list.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
