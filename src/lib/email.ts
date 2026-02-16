import { Resend } from 'resend';

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL DEBUG] RESEND_API_KEY not set');
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const baseUrl = () => process.env.BASE_URL || 'http://localhost:3000';

async function sendMail(to: string, subject: string, html: string, text: string) {
  const resend = getResend();
  if (!resend) {
    console.log(`[EMAIL SKIPPED - no API key] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const fromAddr = process.env.EMAIL_FROM || 'MeetSync <onboarding@resend.dev>';
    console.log(`[EMAIL] Sending to: ${to} | From: ${fromAddr} | Subject: ${subject}`);
    const { data, error } = await resend.emails.send({
      from: fromAddr,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error(`[EMAIL ERROR] To: ${to} | Subject: ${subject}`, error);
    } else {
      console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject} | Id: ${data?.id}`);
    }
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
