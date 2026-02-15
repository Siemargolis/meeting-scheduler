import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendFinalizedEmail } from '@/lib/email';
import { formatSlotDisplay } from '@/lib/utils';
import type { MeetingRow, ResponseRow } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { slot_start, slot_end } = body;

    if (!slot_start || !slot_end) {
      return NextResponse.json({ error: 'slot_start and slot_end are required.' }, { status: 400 });
    }

    const db = getDb();
    const { id } = params;
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(id) as MeetingRow | undefined;

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    if (meeting.finalized_slot_start) {
      return NextResponse.json({ error: 'Already finalized.' }, { status: 400 });
    }

    db.prepare(
      'UPDATE meetings SET finalized_slot_start = ?, finalized_slot_end = ? WHERE id = ?'
    ).run(slot_start, slot_end, id);

    const responses = db.prepare(
      'SELECT DISTINCT respondent_name, respondent_email FROM responses WHERE meeting_id = ?'
    ).all(meeting.id) as Pick<ResponseRow, 'respondent_name' | 'respondent_email'>[];

    const finalTimeDisplay = formatSlotDisplay(slot_start, slot_end);

    const emailPromises = [
      ...responses.map((r) =>
        sendFinalizedEmail(r.respondent_email, r.respondent_name, meeting.title, meeting.id, finalTimeDisplay)
      ),
      sendFinalizedEmail(meeting.creator_email, meeting.creator_name, meeting.title, meeting.id, finalTimeDisplay),
    ];
    Promise.all(emailPromises).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error finalizing meeting:', error);
    return NextResponse.json({ error: 'Failed to finalize meeting' }, { status: 500 });
  }
}
