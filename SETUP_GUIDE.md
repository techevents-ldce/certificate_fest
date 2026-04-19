# E-Certificate Generator — Complete Setup & Usage Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Step-by-Step Usage](#step-by-step-usage)
6. [API Integration](#api-integration)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### One-Command Start
```bash
cd e:\lakshya_certificates
npm run dev
```

Then open your browser to: **http://localhost:5173**

---

## System Requirements

- **Node.js:** 16.0 or higher
- **npm:** 7.0 or higher
- **Resend Account:** Free tier is sufficient
- **Disk Space:** Minimum 1GB for project + dependencies
- **RAM:** Minimum 2GB RAM recommended

### Verify Installation
```bash
node --version  # Should be v16.0.0 or higher
npm --version   # Should be 7.0.0 or higher
```

---

## Installation Steps

### Step 1: Environment Setup (Already Done ✓)
```bash
cd e:\lakshya_certificates
npm install  # All dependencies installed
```

### Step 2: Start Development Server
```bash
npm run dev
```

Expected output:
```
VITE v8.0.8 ready in 604 ms
➜ Local: http://localhost:5173/
```

### Step 3: Open in Browser
Navigate to `http://localhost:5173` or click the link in terminal.

---

## Configuration

### Resend API Setup

1. **Create Account:**
   - Visit [resend.com](https://resend.com)
   - Sign up for free account

2. **Generate API Key:**
   - Go to Dashboard
   - Click "API Keys" or "Tokens"
   - Create new API key
   - Copy the key (starts with `re_`)

3. **Store API Key (Method 1: In-App):**
   - When you reach Step 5 in the app
   - Paste API key directly in the "Resend API Key" field
   - Leave as is if testing

4. **Store API Key (Method 2: Environment File):**
   - Copy `.env.example` to `.env`
   - Add your API key: `VITE_RESEND_API_KEY=your_key_here`
   - Restart dev server: `npm run dev`

### Email Domain Setup
- Free tier sends from: `noreply@resend.dev`
- Custom domain setup available in [resend.com](https://resend.com) dashboard
- Update `emailService.ts` line 8 if needed

---

## Step-by-Step Usage

### Step 1: Upload Member List

**What You Need:**
- Excel file (.xlsx) or CSV with member data
- Two required columns:
  - **Column A:** Full Name (e.g., "John Doe")
  - **Column B:** Email Address (e.g., "john@example.com")
- Optional: Additional columns for roll numbers, categories, etc.

**Example Excel Format:**
```
Full Name          | Email              | Roll No | Event
John Doe           | john@example.com   | 101     | TechFest
Jane Smith         | jane@example.com   | 102     | TechFest
Bob Johnson        | bob@example.com    | 103     | TechFest
```

**Process:**
1. Click upload area
2. Select your Excel/CSV file
3. System validates all entries
4. Review the preview table
5. Proceed if all valid (green checkmark appears)

**Validation Rules:**
- Names cannot be empty
- Emails must be valid format
- Duplicates are allowed
- Invalid rows are highlighted with reasons

---

### Step 2: Upload Certificate Template

**What You Need:**
- Certificate image (PNG or JPG)
- Should include: title, decorative borders, signatures, logos
- Resolution: 1200x800 to 2400x1600 pixels recommended
- File size: Max 10MB

**Process:**
1. Click upload area in Step 2
2. Select certificate template image
3. Image loads in preview
4. **Click on the image** where you want member names
5. Crosshair marker appears at selected position
6. Adjust position by clicking again if needed

**Position Tips:**
- Center of certificate usually best for names
- Leave space for larger names
- Avoid overlapping with existing content

---

### Step 3: Configure Font & Styling

**Font Options:**

Option A: Use System Font
```
Default fonts available:
- Arial (clean, professional)
- Georgia (elegant)
- Times New Roman (formal)
- Courier New (monospace)
- Verdana (web-safe)
```

Option B: Upload Custom Font
```
Supported formats: .ttf, .otf, .woff
Max file size: 5MB
```

**Text Styling Controls:**
1. **Font Size:** 8-200 pixels (default: 48)
2. **Text Color:** Pick any color using color selector
3. **Alignment:** Left, Center (default), or Right
4. **Bold:** Toggle for bold text
5. **Italic:** Toggle for italic text

**Live Preview:**
- Updates as you adjust settings
- Shows sample text on certificate template
- Final appearance matches preview

**Example Configurations:**
- Professional: Arial, 64px, Black, Center, Bold
- Elegant: Georgia, 56px, Dark Blue, Center, Italic
- Classic: Times New Roman, 48px, Black, Center

---

### Step 4: Preview & Generate

**Preview Features:**
1. See certificate with member name rendered
2. Navigate through members (← Previous / Next →)
3. Verify layout and spacing
4. Overall progress shown (e.g., "1 / 50")

**Generation Process:**
1. Click "Generate All Certificates"
2. System creates one image per member
3. Progress bar shows completion
4. Each certificate named as: `MemberName_Certificate.png`

**Output:**
- All certificates stored in memory
- Ready for email delivery
- No files saved to disk (for privacy)

---

### Step 5: Email Delivery

**Email Configuration:**

1. **Subject Line:**
   - Example: "Your Certificate for Lakshya TechFest 2025"
   - Appears in email subject
   - No {{name}} placeholder needed

2. **Email Body:**
   - Example: "Hello {{name}}, Congratulations! Your certificate is attached..."
   - Use {{name}} placeholder to personalize
   - Each member sees their own name
   - Plain text or basic HTML

3. **Resend API Key:**
   - Paste your API key (starts with `re_`)
   - Kept secure during session
   - Not stored after session ends

**Email Preview:**
1. Click "Show Email Preview"
2. See how first member's email looks
3. {{name}} replaced with actual member name
4. Verify subject and message

**Sending Process:**
1. Click "Send Certificates to All Members"
2. Status bar shows progression
3. Each delivery tracked in real-time
4. Shows: Total, Sent Count, Failed Count

**Delivery Status:**
- ✓ **Sent:** Accepted by Resend
- ✗ **Failed:** Error with individual recipient
- Failed reasons: Invalid email, API issues, etc.

**Retry Failed:**
- After sending, "Failed Recipients" list shown
- Click "Retry Failed Recipients"
- System resends to only failed recipients
- Helpful for network issues

---

## API Integration

### Resend Email API

**Endpoint Used:**
```
POST https://api.resend.com/emails
```

**Authentication:**
- Method: Bearer Token
- Header: `Authorization: Bearer {your_api_key}`

**Request Format:**
```javascript
{
  from: "noreply@resend.dev",
  to: "recipient@example.com",
  subject: "Your Certificate",
  html: "<p>Hello John,</p>...",
  attachments: [...]
}
```

**Response Handling:**
- Success: Returns email ID
- Failure: Returns error message
- Retryable errors: 429 (rate limit), 5xx (server)
- Non-retryable: 400 (invalid input), 401 (auth)

---

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Output in: dist/
# File size: ~150-200 KB (gzipped)
```

### Deployment Options

**Option 1: Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option 3: Static Host (GitHub Pages, etc)**
```bash
# Build
npm run build

# Upload 'dist' folder to static hosting
```

### Environment Variables for Production

Create `.env.production`:
```
VITE_RESEND_API_KEY=your_production_key_here
```

**Security Note:**
- Never commit `.env` to git
- Use hosting platform's secret management
- Each session requires fresh API key

---

## Troubleshooting

### Common Issues & Solutions

#### 1. **"Cannot find module 'xlsx'"**
```bash
npm install xlsx
npm run dev
```

#### 2. **"Port 5173 already in use"**
```bash
# Use different port:
npm run dev -- --port 5174
```

#### 3. **Certificate Generation Fails**
- ✓ Ensure template image is PNG or JPG
- ✓ Check font file is valid TTF/OTF/WOFF
- ✓ Verify canvas size isn't too large (>4096 width/height)

#### 4. **Email Not Sending**
- ✓ Verify API key is correct
- ✓ Check email addresses are valid
- ✓ Ensure email body isn't empty
- ✓ Check Resend dashboard for rate limiting

#### 5. **Excel File Not Recognized**
- ✓ Ensure column A is "Full Name"
- ✓ Ensure column B is valid email
- ✓ No blank rows in header
- ✓ File format is .xlsx or .csv

#### 6. **Font Not Loading**
- ✓ Font file size < 5MB
- ✓ Format is .ttf, .otf, or .woff
- ✓ Browser supports web font loading

#### 7. **CORS or Network Errors**
- ✓ Check internet connection
- ✓ Verify Resend API is accessible
- ✓ Check firewall isn't blocking requests

---

## Advanced Usage

### Batch Processing Tips

**For 500+ Members:**
1. Split into multiple batches (Max 200 per batch recommended)
2. Use same template and font for consistency
3. Process one batch at a time
4. Save API calls between batches

### Custom Email Templates

Edit `src/utils/emailService.ts`:
```javascript
// Add HTML formatting
const htmlBody = body
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/__(.*?)__/g, '<em>$1</em>')
```

### Custom Fonts

1. Upload TTF/OTF files (Google Fonts compatible)
2. Applies to all generated certificates
3. Falls back to system font if load fails

---

## Support & Documentation

### Files Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main application component |
| `src/components/Step*.tsx` | Individual step components |
| `src/utils/excelParser.ts` | Excel/CSV parsing |
| `src/utils/certificateGenerator.ts` | Canvas-based generation |
| `src/utils/emailService.ts` | Resend API integration |
| `src/types/index.ts` | TypeScript interfaces |

### Resources

- [Resend Documentation](https://resend.com/docs)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for Lakshya Events**
**Version 1.0 | Last Updated: April 2026**
