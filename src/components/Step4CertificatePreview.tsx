import { useState, useEffect } from 'react';
import type { Member, CertificateConfig } from '../types';
import { generateCertificatePreview, generateBatchCertificates } from '../utils/certificateGenerator';
import styles from './Step4CertificatePreview.module.css';

interface Step4CertificatePreviewProps {
  members: Member[];
  config: CertificateConfig;
  fontFamily: string;
  onCertificatesGenerated: (certificates: { member: Member; certificate: Blob }[]) => void;
  isLoading?: boolean;
}

export const Step4CertificatePreview: React.FC<Step4CertificatePreviewProps> = ({
  members,
  config,
  fontFamily,
  onCertificatesGenerated,
  isLoading = false
}) => {
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generatePreview();
  }, [currentPreviewIndex, config, fontFamily, members]);

  const generatePreview = async () => {
    try {
      if (members.length === 0) return;

      const member = members[currentPreviewIndex];
      const preview = await generateCertificatePreview(
        config.templateImage,
        member.fullName,
        config,
        fontFamily
      );
      setPreviewImage(preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    }
  };

  const handleGenerateAll = async () => {
    setGenerating(true);
    setError('');
    setGenerationProgress(0);

    try {
      const certificates = await generateBatchCertificates(
        config.templateImage,
        members,
        config,
        fontFamily,
        (progress) => {
          setGenerationProgress(Math.round((progress.current / progress.total) * 100));
        }
      );

      onCertificatesGenerated(certificates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate certificates');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Step 4: Certificate Preview & Generation</h2>
        <p className={styles.description}>
          Review certificate previews and confirm before bulk generation for all {members.length} members.
        </p>

        {/* Preview Section */}
        <div className={styles.previewSection}>
          <h3>Preview for: {members[currentPreviewIndex]?.fullName}</h3>
          {previewImage && (
            <img src={previewImage} alt="Certificate Preview" className={styles.previewImage} />
          )}

          {/* Navigation */}
          <div className={styles.navigation}>
            <button
              onClick={() => setCurrentPreviewIndex(Math.max(0, currentPreviewIndex - 1))}
              disabled={currentPreviewIndex === 0 || generating}
              className={styles.navBtn}
            >
              ← Previous
            </button>
            <span className={styles.pageInfo}>
              {currentPreviewIndex + 1} / {members.length}
            </span>
            <button
              onClick={() => setCurrentPreviewIndex(Math.min(members.length - 1, currentPreviewIndex + 1))}
              disabled={currentPreviewIndex === members.length - 1 || generating}
              className={styles.navBtn}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Generation Status */}
        {generating && (
          <div className={styles.generationStatus}>
            <h4>Generating Certificates...</h4>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p>{generationProgress}% Complete</p>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <button
          onClick={handleGenerateAll}
          disabled={generating || isLoading || members.length === 0}
          className={styles.generateBtn}
        >
          {generating ? '⏳ Generating...' : '✓ Generate All Certificates'}
        </button>
      </div>
    </div>
  );
};
