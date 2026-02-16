import nodemailer from 'nodemailer';

function getTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL DEBUG] Missing creds: SMTP_USER=${process.env.SMTP_USER ? 'set' : 'unset'} SMTP_PASS=${process.env.SMTP_PASS ? 'set' : 'unset'}`);
    return null;
  }
  console.log(`[EMAIL DEBUG] Creating Gmail transporter for user: ${process.env.SMTP_USER}`);
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const baseUrl = () => process.env.BASE_URL || 'http://localhost:3000';

async function sendMail(to: string, subject: string, html: string, text: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[EMAIL SKIPPED - no SMTP configured] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL DEBUG] SMTP_HOST=${process.env.SMTP_HOST} SMTP_USER=${process.env.SMTP_USER ? 'set' : 'unset'}`);
    return;
  }
  try {
    const fromAddr = (process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com').replace(/^["']|["']$/g, '');
    const info = await transporter.sendMail({
      from: fromAddr,
      to,
      subject,
      html,
      text,
    });
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject} | MessageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] To: ${to} | Subject: ${subject}`, err);
  }
}

export async function sendMeetingCreatedEmail(
  creatorEmail: string,
  creatorName: string,
  meetingTitle: string,
  meetingId: string
): Promise<void> {
  const shareLink = `${baseUrl()}/meeting/${meetingId}/respond`;
  const detailLink = `${baseUrl()}/meeting/${meetingId}`;

  await sendMail(
    creatorEmail,
    `Meeting Created: ${meetingTitle}`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Your meeting has been created!</h2>
        <p>Hi ${creatorName},</p>
        <p>Your meeting <strong>"${meetingTitle}"</strong> is ready. Share this link with participants so they can mark their availability:</p>
        <p style="background: #f0fdf4; padding: 12px; border-radius: 8px; word-break: break-all;">
          <a href="${shareLink}" style="color: #059669;">${shareLink}</a>
        </p>
        <p>View responses and pick a final time:</p>
        <p><a href="${detailLink}" style="color: #059669;">${detailLink}</a></p>
      </div>
    `,
    `Your meeting "${meetingTitle}" has been created.\n\nShare link: ${shareLink}\nView responses: ${detailLink}`
  );
}

export async function sendNewResponseEmail(
  creatorEmail: string,
  creatorName: string,
  respondentName: string,
  meetingTitle: string,
  meetingId: string
): Promise<void> {
  const detailLink = `${baseUrl()}/meeting/${meetingId}`;

  await sendMail(
    creatorEmail,
    `New Response: ${respondentName} responded to "${meetingTitle}"`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New availability response!</h2>
        <p>Hi ${creatorName},</p>
        <p><strong>${respondentName}</strong> has submitted their availability for <strong>"${meetingTitle}"</strong>.</p>
        <p><a href="${detailLink}" style="color: #059669;">View all responses</a></p>
      </div>
    `,
    `${respondentName} responded to "${meetingTitle}".\nView responses: ${detailLink}`
  );
}

export async function sendFinalizedEmail(
  recipientEmail: string,
  recipientName: string,
  meetingTitle: string,
  meetingId: string,
  finalTime: string
): Promise<void> {
  const resultsLink = `${baseUrl()}/meeting/${meetingId}/results`;

  await sendMail(
    recipientEmail,
    `Meeting Confirmed: ${meetingTitle}`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Meeting time confirmed!</h2>
        <p>Hi ${recipientName},</p>
        <p>The meeting <strong>"${meetingTitle}"</strong> has been scheduled for:</p>
        <p style="background: #f0fdf4; padding: 12px; border-radius: 8px; font-size: 18px; font-weight: bold; color: #059669;">
          ${finalTime}
        </p>
        <p><a href="${resultsLink}" style="color: #059669;">View details</a></p>
      </div>
    `,
    `Meeting "${meetingTitle}" confirmed for ${finalTime}.\nDetails: ${resultsLink}`
  );
}
