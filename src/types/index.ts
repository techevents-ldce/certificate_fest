// Member data from Excel
export interface Member {
  fullName: string;
  email: string;
  [key: string]: string;
}

// Certificate configuration
export interface CertificateConfig {
  templateImage: string; // Base64 or data URL
  namePosition: { x: number; y: number };
  fontSize: number;
  textColor: string;
  alignment: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  fontFamily?: string;
}

// Email configuration
export interface EmailConfig {
  subject: string;
  body: string; // Can include {{name}} placeholder
}

// Step status
export type StepStatus = 'pending' | 'completed' | 'current';

// Application state
export interface AppState {
  currentStep: number;
  members: Member[];
  certificateConfig?: CertificateConfig;
  emailConfig?: EmailConfig;
  fontFile?: File;
  fontFamily?: string;
}

// Email sending progress
export interface SendingProgress {
  total: number;
  sent: number;
  failed: number;
  failedRecipients: { email: string; error: string }[];
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: { rowIndex: number; message: string }[];
}
