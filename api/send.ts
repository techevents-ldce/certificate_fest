import { Resend } from 'resend';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { to, subject, html, attachment, filename } = req.body;

    if (!to || !subject || !html || !attachment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@certificates.lakshyaldce.in',
      to,
      subject,
      html,
      attachments: [
        {
          filename: filename || 'Certificate.pdf',
          content: attachment, // Base64 content
        },
      ],
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(400).json({
        message: error.message || 'Resend API Error',
        name: error.name
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
