import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateTimeSlots } from '@/lib/utils';
import type { MeetingRow, ResponseRow, AvailabilitySlotRow, SlotAvailability } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(id) as MeetingRow | undefined;

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const responses = db.prepare(
      'SELECT * FROM responses WHERE meeting_id = ? ORDER BY created_at ASC'
    ).all(meeting.id) as ResponseRow[];

    const responsesWithSlots = responses.map((r) => {
      const slots = db.prepare(
        'SELECT * FROM availability_slots WHERE response_id = ?'
      ).all(r.id) as AvailabilitySlotRow[];
      return { ...r, slots };
    });

    const allSlots = generateTimeSlots(
      meeting.date_range_start, meeting.date_range_end,
      meeting.time_range_start, meeting.time_range_end,
      meeting.duration
    );

    const aggregated: SlotAvailability[] = allSlots.map((slot) => {
      const matchingRespondents = responsesWithSlots
        .filter((r) => r.slots.some((s) => s.slot_start === slot.start && s.slot_end === slot.end))
        .map((r) => r.respondent_name);

      return {
        slot_start: slot.start,
        slot_end: slot.end,
        count: matchingRespondents.length,
        respondents: matchingRespondents,
      };
    });

    return NextResponse.json({
      ...meeting,
      responses: responsesWithSlots,
      aggregated,
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json({ error: 'Failed to fetch meeting' }, { status: 500 });
  }
}
