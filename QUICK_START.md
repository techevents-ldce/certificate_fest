# 🚀 Quick Start Checklist

Complete this checklist to get the E-Certificate Generator running in 5 minutes!

---

## ✅ Pre-Flight Check (2 min)

- [ ] You have Node.js installed (run `node --version`)
- [ ] You have npm installed (run `npm --version`)
- [ ] You have a sample Excel file with names and emails
- [ ] You have a certificate template image (PNG or JPG)
- [ ] You have a Resend account (sign up at resend.com)

---

## ✅ Launch the Application (1 min)

### Terminal
```bash
cd e:\lakshya_certificates
npm run dev
```

### Browser
```
Open: http://localhost:5173
```

✓ You should see the 5-step progress tracker and the app is ready!

---

## ✅ Test the Flow (2 min)

### Step 1: Upload Members
1. Prepare Excel file with:
   - Column A: Full Name (e.g., "John Doe")
   - Column B: Email (e.g., "john@example.com")
2. Click upload area
3. Select your Excel file
4. Verify preview shows members

### Step 2: Upload Template
1. Click upload area
2. Select certificate template image
3. Click on image where you want the name
4. See crosshair marker appear

### Step 3: Configure Font
1. Choose a system font OR upload custom font
2. Adjust font size, color, alignment
3. Click toggles for Bold/Italic
4. See live preview update

### Step 4: Generate & Preview
1. Navigate through member previews
2. Click "Generate All Certificates"
3. Watch progress bar complete
4. Proceed to Step 5

### Step 5: Send Emails
1. Configure email subject and body
2. Use {{name}} placeholder in body
3. Enter your Resend API key
4. Click "Show Email Preview" to verify
5. Click "Send Certificates to All Members"
6. Monitor delivery status
7. Track failures and retry if needed

---

## 📋 Test Data

### Sample Excel Format
```
Full Name          | Email
John Doe           | john@test.com
Jane Smith         | jane@test.com
Bob Johnson        | bob@test.com
```

### Sample Certificate Image
- Size: 1200x800 pixels minimum
- Format: PNG or JPG
- Should include space for name in center

### Sample Email Body
```
Dear {{name}},

We're pleased to present you with your certificate 
for participating in Lakshya TechFest 2025.

Thank you for your participation!

Best regards,
The Lakshya Team
```

---

## 🔧 Configuration

### Get Resend API Key

1. Visit [resend.com](https://resend.com)
2. Sign up (Free tier available)
3. Go to "API Tokens" or "Developer" section
4. Click "Create API Token"
5. Copy the token (starts with `re_`)
6. Use in Step 5 of the app

### Optional: .env File
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your API key
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx

# Restart: npm run dev
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | Run `npm install` first |
| Port 5173 in use | Run `npm run dev -- --port 5174` |
| Email not sending | Check API key in Step 5 |
| Certificate looks wrong | Verify position click in Step 2 |
| Font not loading | Ensure file is .ttf, .otf, or .woff |
| Excel not recognized | Check Column A (Name), Column B (Email) |

---

## 📱 What to Expect

### Successful Flow
1. ✅ Excel loaded → Members display
2. ✅ Template uploaded → Position selected
3. ✅ Font configured → Preview updates
4. ✅ Certificates generated → Progress bar fills
5. ✅ Emails sent → Delivery status shown

### Success Indicators
- ✓ Green checkmarks on completed steps
- ✓ "Step X / 5" updates as you progress
- ✓ Live preview updates when you make changes
- ✓ Progress bars appear during generation
- ✓ Delivery report shows at the end

---

## 🎯 Next Steps After First Test

### If Everything Works:
1. ✅ Prepare your actual member list (Excel)
2. ✅ Design your certificate template (PNG/JPG)
3. ✅ Run through the full flow with real data
4. ✅ Send test batch to yourself
5. ✅ Verify delivery in your email

### Ready for Production:
1. Run: `npm run build`
2. Deploy to hosting (Vercel, Netlify, etc.)
3. Create account for your team
4. Process unlimited batches!

---

## 📞 Common Questions

### Q: Is my data stored anywhere?
**A:** No. All processing happens in your browser. No data sent except emails through Resend.

### Q: Can I process 500+ members?
**A:** Yes! System can handle up to 500+ members per batch.

### Q: What file formats are supported?
**A:** 
- Excel: .xlsx, .csv
- Images: .png, .jpg, .jpeg
- Fonts: .ttf, .otf, .woff

### Q: Can I customize the emails?
**A:** Yes! Use {{name}} placeholder and customize subject/body for each batch.

### Q: What if email sending fails?
**A:** Failed recipients are identified and you can retry them without regenerating certificates.

### Q: Can I use this on mobile?
**A:** Not recommended for best experience, but the app is responsive.

---

## 🎓 Learning Resources

- **SETUP_GUIDE.md** — Detailed setup instructions
- **README.md** — Feature overview
- **DEVELOPER_REFERENCE.md** — For developers
- **PROJECT_CHECKLIST.md** — What's included
- **IMPLEMENTATION_SUMMARY.md** — Architecture overview

---

## ⏱️ Quick Time Estimates

| Task | Time |
|------|------|
| Installation | 0 min (already done) |
| First Launch | 1 min |
| Test Flow | 5 min |
| Prepare Real Data | 10-20 min |
| First Production Run | 5-30 min (depending on batch size) |

---

## ✨ You're All Set!

Your E-Certificate Generator is ready to use. 

**Start here:**
```bash
npm run dev
# Then visit http://localhost:5173
```

**Questions?** Check the documentation files or refer to the Resend API docs.

---

**Happy certificate generating! 🎓**

---

*Last Updated: April 2026*  
*Version: 1.0 - Production Ready*
