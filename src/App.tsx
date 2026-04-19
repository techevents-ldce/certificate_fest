import { useState } from 'react';
import type { Member, CertificateConfig, SendingProgress } from './types';
import { Step1MemberUpload } from './components/Step1MemberUpload';
import { Step2TemplateUpload } from './components/Step2TemplateUpload';
import { Step3FontUpload } from './components/Step3FontUpload';
import { Step4CertificatePreview } from './components/Step4CertificatePreview';
import { Step5EmailDelivery } from './components/Step5EmailDelivery';
import styles from './App.module.css';

export function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [templateImage, setTemplateImage] = useState<string>('');
  const [namePosition, setNamePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [certificateConfig, setCertificateConfig] = useState<CertificateConfig | null>(null);
  const [certificates, setCertificates] = useState<{ member: Member; certificate: Blob }[]>([]);
  const [isLoading] = useState(false);

  const handleMembersLoaded = (loadedMembers: Member[]) => {
    setMembers(loadedMembers);
    if (loadedMembers.length > 0) {
      setCurrentStep(2);
    }
  };

  const handleTemplateLoaded = (imageData: string, position: { x: number; y: number }) => {
    setTemplateImage(imageData);
    setNamePosition(position);
    setCurrentStep(3);
  };

  const handleFontConfigured = (family: string, _file: File, config: CertificateConfig) => {
    setFontFamily(family);
    setCertificateConfig(config);
    setCurrentStep(4);
  };

  const handleCertificatesGenerated = (generatedCerts: { member: Member; certificate: Blob }[]) => {
    setCertificates(generatedCerts);
    setCurrentStep(5);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return members.length > 0;
      case 2:
        return templateImage !== '' && namePosition.x !== 0;
      case 3:
        return fontFamily !== '';
      case 4:
        return certificates.length > 0;
      default:
        return true;
    }
  };

  const handleEmailsSent = (_progress: SendingProgress) => {
    // Progress tracking handled within Step5 component
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1MemberUpload
            onMembersLoaded={handleMembersLoaded}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <Step2TemplateUpload
            onTemplateLoaded={handleTemplateLoaded}
            isLoading={isLoading}
          />
        );
      case 3:
        return templateImage ? (
          <Step3FontUpload
            templateImage={templateImage}
            namePosition={namePosition}
            onFontConfigured={handleFontConfigured}
            isLoading={isLoading}
          />
        ) : null;
      case 4:
        return certificateConfig ? (
          <Step4CertificatePreview
            members={members}
            config={certificateConfig}
            fontFamily={fontFamily}
            onCertificatesGenerated={handleCertificatesGenerated}
            isLoading={isLoading}
          />
        ) : null;
      case 5:
        return certificateConfig ? (
          <Step5EmailDelivery
            members={members}
            certificates={certificates}
            onEmailsSent={handleEmailsSent}
            isLoading={isLoading}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className={styles.app}>
      {/* Progress Indicator */}
      <div className={styles.progressTracker}>
        <div className={styles.stepsContainer}>
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`${styles.step} ${
                step === currentStep
                  ? styles.active
                  : step < currentStep && canProceed() // More accurate indicator
                    ? styles.completed
                    : styles.pending
              }`}
              onClick={() => step < currentStep && setCurrentStep(step)}
            >
              <div className={styles.stepNumber}>
                {step < currentStep ? '✓' : step}
              </div>
              <div className={styles.stepLabel}>
                {[
                  'Members',
                  'Template',
                  'Font',
                  'Preview',
                  'Email'
                ][step - 1]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {renderStep()}
      </main>

      {/* Navigation Buttons */}
      <div className={styles.navigationFooter}>
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1 || isLoading}
          className={styles.navBtn}
        >
          ← Back
        </button>
        <span className={styles.stepIndicator}>
          Step {currentStep} / 5
        </span>
        <button
          onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
          disabled={currentStep === 5 || isLoading || !canProceed()}
          className={styles.navBtn}
        >
          {currentStep === 4 ? 'Confirm & Go to Send →' : 'Next →'}
        </button>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>🎓 E-Certificate Generator | Powered by React & Resend</p>
      </footer>
    </div>
  );
}

export default App;
