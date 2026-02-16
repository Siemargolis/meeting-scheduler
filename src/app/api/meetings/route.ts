import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { validateCreateMeeting } from '@/lib/validators';
import { sendMeetingCreatedEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateCreateMeeting(body);

    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const p = validation.payload!;
    const id = generateId();
    const db = getDb();

    db.prepare(`
      INSERT INTO meetings (id, creator_name, creator_email, title, description,
        duration, date_range_start, date_range_end, time_range_start, time_range_end, timezone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, p.creator_name, p.creator_email, p.title, p.description || '',
      p.duration, p.date_range_start, p.date_range_end,
      p.time_range_start, p.time_range_end, p.timezone
    );

    await sendMeetingCreatedEmail(p.creator_email, p.creator_name, p.title, id);

    return NextResponse.json({ id, shareLink: `/meeting/${id}/respond` }, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
