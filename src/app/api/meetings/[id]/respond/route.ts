import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { sendNewResponseEmail } from '@/lib/email';
import type { MeetingRow } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { respondent_name, respondent_email, slots } = body;

    if (!respondent_name || typeof respondent_name !== 'string' || respondent_name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    if (!respondent_email || typeof respondent_email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }
    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: 'Please select at least one available time slot.' }, { status: 400 });
    }

    const db = getDb();
    const { id } = params;
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(id) as MeetingRow | undefined;

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const responseId = generateId();

    const insertResponse = db.prepare(
      'INSERT INTO responses (id, meeting_id, respondent_name, respondent_email) VALUES (?, ?, ?, ?)'
    );
    const insertSlot = db.prepare(
      'INSERT INTO availability_slots (response_id, slot_start, slot_end) VALUES (?, ?, ?)'
    );

    const transaction = db.transaction(() => {
      insertResponse.run(responseId, id, respondent_name.trim(), respondent_email.trim().toLowerCase());
      for (const slot of slots) {
        insertSlot.run(responseId, slot.slot_start, slot.slot_end);
      }
    });

    transaction();

    await sendNewResponseEmail(
      meeting.creator_email, meeting.creator_name,
      respondent_name.trim(), meeting.title, meeting.id
    );

    return NextResponse.json({ success: true, responseId }, { status: 201 });
  } catch (error) {
    console.error('Error submitting response:', error);
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
}
