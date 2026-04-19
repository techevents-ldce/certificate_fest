# Developer Quick Reference

## Component API Reference

### Step1MemberUpload
```typescript
Props: {
  onMembersLoaded: (members: Member[]) => void
  isLoading?: boolean
}

Events:
- User uploads Excel/CSV
- Component validates and parses
- Calls onMembersLoaded with parsed members
```

### Step2TemplateUpload
```typescript
Props: {
  onTemplateLoaded: (imageData: string, position: { x: number; y: number }) => void
  isLoading?: boolean
}

Events:
- User uploads image
- User clicks to select position
- Calls onTemplateLoaded with image data and coordinates
```

### Step3FontUpload
```typescript
Props: {
  templateImage: string
  namePosition: { x: number; y: number }
  onFontConfigured: (fontFamily: string, fontFile: File, config: CertificateConfig) => void
  isLoading?: boolean
}

Events:
- User selects/uploads font
- User adjusts styling options
- Live preview updates
- Calls onFontConfigured with configuration
```

### Step4CertificatePreview
```typescript
Props: {
  members: Member[]
  config: CertificateConfig
  fontFamily: string
  onCertificatesGenerated: (certificates: { member: Member; certificate: Blob }[]) => void
  isLoading?: boolean
}

Events:
- User previews certificates
- User clicks "Generate All"
- Batch generation with progress updates
- Calls onCertificatesGenerated when complete
```

### Step5EmailDelivery
```typescript
Props: {
  members: Member[]
  certificates: { member: Member; certificate: Blob }[]
  onEmailsSent?: (progress: SendingProgress) => void
  isLoading?: boolean
}

Events:
- User configures email
- User provides Resend API key
- Emails sent in batch
- Progress updated in real-time
```

---

## Utility Functions

### excelParser.ts

```typescript
// Parse Excel file
parseExcelFile(file: File): Promise<{
  members: Member[]
  validation: ValidationResult
}>

// Parse CSV file
parseCSVFile(file: File): Promise<{
  members: Member[]
  validation: ValidationResult
}>

// Validate email
isValidEmail(email: string): boolean
```

### certificateGenerator.ts

```typescript
// Load custom font
loadCustomFont(file: File): Promise<string>

// Create CSS font-face rule
createFontFace(fontFamily: string, fontDataURL: string): string

// Generate single certificate
generateCertificate(
  templateImage: string,
  member: Member,
  config: CertificateConfig,
  fontFamily: string
): Promise<Blob>

// Generate preview
generateCertificatePreview(
  templateImage: string,
  sampleName: string,
  config: CertificateConfig,
  fontFamily: string
): Promise<string>

// Batch generate
generateBatchCertificates(
  templateImage: string,
  members: Member[],
  config: CertificateConfig,
  fontFamily: string,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<{ member: Member; certificate: Blob }[]>
```

### emailService.ts

```typescript
// Send single email
sendCertificateEmail(
  member: Member,
  certificateBlob: Blob,
  subject: string,
  body: string,
  resendApiKey: string
): Promise<{ success: boolean; error?: string }>

// Send to all members
sendCertificates(
  members: Member[],
  certificateBlobs: Map<string, Blob>,
  subject: string,
  body: string,
  resendApiKey: string,
  onProgress?: (progress: SendingProgress) => void
): Promise<SendingProgress>

// Validate email config
validateEmailConfig(subject: string, body: string): {
  isValid: boolean
  errors: string[]
}
```

---

## Data Types

```typescript
// Member from Excel
interface Member {
  fullName: string
  email: string
  [key: string]: string  // Additional fields
}

// Certificate configuration
interface CertificateConfig {
  templateImage: string  // Base64 data URL
  namePosition: { x: number; y: number }
  fontSize: number
  textColor: string
  alignment: 'left' | 'center' | 'right'
  bold: boolean
  italic: boolean
  fontFamily?: string
}

// Email configuration
interface EmailConfig {
  subject: string
  body: string  // Supports {{name}} placeholder
}

// Sending progress
interface SendingProgress {
  total: number
  sent: number
  failed: number
  failedRecipients: { email: string; error: string }[]
}

// Validation result
interface ValidationResult {
  isValid: boolean
  errors: { rowIndex: number; message: string }[]
}
```

---

## Component State Flow

```
App (Main State)
├── currentStep: 1-5
├── members: Member[]
├── templateImage: string (Base64)
├── namePosition: { x, y }
├── fontFamily: string
├── certificateConfig: CertificateConfig
└── certificates: { member, certificate }[]

Step 1 Input: Excel/CSV
       → Calls onMembersLoaded(members)
       → App stores members
       → Moves to Step 2

Step 2 Input: Template image + position click
       → Calls onTemplateLoaded(imageData, position)
       → App stores template and position
       → Moves to Step 3

Step 3 Input: Font + styling options
       → Calls onFontConfigured(fontFamily, file, config)
       → App stores config
       → Moves to Step 4

Step 4 Input: User clicks "Generate All"
       → Generates certificates locally
       → Calls onCertificatesGenerated(certs)
       → App stores certificates
       → Moves to Step 5

Step 5 Input: Email + API key + send
       → Sends emails via Resend
       → Tracks delivery
       → Shows report
```

---

## Environment Variables

```bash
# .env or .env.production
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
```

Access in code:
```typescript
const apiKey = import.meta.env.VITE_RESEND_API_KEY
```

---

## CSS Class Naming

All styles use CSS Modules:
```typescript
// Structure
filename.module.css

// Usage
import styles from './Component.module.css'
<div className={styles.containerName}>

// BEM-like naming
.container, .card, .button, .input
.error, .success, .warning
.disabled, .active, .completed
```

---

## Error Handling

### Step 1: Member Validation
- Empty names/emails → Flagged in error list
- Invalid email format → Error message shown
- Duplicate emails → Allowed (warning only)

### Step 2: Template Upload
- Invalid image format → Error message
- Missing file → Upload required
- Image load failure → Error shown

### Step 3: Font Upload
- Invalid font format → Error message
- File too large → Error shown
- Load failure → Falls back to system font

### Step 4: Generation
- Canvas error → Error logged, member skipped
- Large image → May cause memory issues
- Font not loaded → Renders with fallback

### Step 5: Email Sending
- Invalid API key → Error shown
- Network error → Retry available
- Invalid email → Marked as failed
- Rate limiting → Retry available

---

## Performance Tips

1. **Certificate Generation:**
   - Max 500 members per batch recommended
   - ~50-100ms per certificate
   - Progress updates every certificate

2. **Memory:**
   - Each certificate ~50KB-200KB as Blob
   - 500 members = ~25-100MB RAM
   - Monitor browser memory usage

3. **File Sizes:**
   - Template image: Keep under 2MB
   - Font file: Keep under 1MB
   - Excel file: No limit (server parsing)

4. **Network:**
   - Email sending: ~200-500ms per recipient
   - 500 members = ~2-4 minutes
   - Progress tracked in real-time

---

## Debugging

### Enable Console Logs
Edit `src/utils/`files:
```typescript
console.log('Debug:', value)
```

### Check Component State
React DevTools:
1. Install React DevTools extension
2. F12 → Components tab
3. Navigate component tree
4. Inspect props and state

### Network Debugging
1. F12 → Network tab
2. Watch Resend API calls
3. Check request/response bodies

### TypeScript Errors
```bash
npx tsc --noEmit
# Shows all type errors
```

---

## Common Customizations

### Change Default Fonts
File: `src/components/Step3FontUpload.tsx`
```typescript
const DEFAULT_FONTS = ['Arial', 'Georgia', ...];
```

### Change Email Domain
File: `src/utils/emailService.ts`
```typescript
formData.append('from', 'noreply@yourdomain.com');
```

### Change UI Colors
File: `src/components/Step*.module.css`
```css
background: #667eea;  /* Change to custom color */
```

### Change Font Size Limits
File: `src/components/Step3FontUpload.tsx`
```typescript
<input type="number" min="8" max="200" />
```

---

## Testing Checklist

- [ ] Upload sample Excel file
- [ ] Validate member parsing
- [ ] Upload certificate template
- [ ] Select name position
- [ ] Try system font
- [ ] Try custom font upload
- [ ] Adjust all styling options
- [ ] Preview updates correctly
- [ ] Generate certificates
- [ ] Email preview shows correctly
- [ ] Test with real Resend API key
- [ ] Monitor delivery status

---

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run lint               # Run ESLint
npm run preview            # Preview production build

# File Structure
npm ls                     # Show dependency tree
npm audit                  # Check for vulnerabilities
npm update                 # Update dependencies

# Debugging
npm run dev -- --host     # Expose to network
npm run build -- --stats  # Show build analysis
```

---

## Links & Resources

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/guide/)
- [Resend API](https://resend.com/docs)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [XLSX Library](https://github.com/SheetJS/sheetjs)

---

**Last Updated:** April 2026  
**Version:** 1.0
