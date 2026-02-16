import { getDb } from '@/lib/db';
import { generateTimeSlots, getDateRange } from '@/lib/utils';
import { RespondForm } from '@/components/RespondForm';
import { notFound, redirect } from 'next/navigation';
import type { MeetingRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function RespondPage({ params }: { params: { id: string } }) {
  const db = getDb();
  const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(params.id) as MeetingRow | undefined;

  if (!meeting) {
    notFound();
  }

  if (meeting.finalized_slot_start) {
    redirect(`/meeting/${params.id}/results`);
  }

  const slots = generateTimeSlots(
    meeting.date_range_start,
    meeting.date_range_end,
    meeting.time_range_start,
    meeting.time_range_end,
    meeting.duration
  );

  const dates = getDateRange(meeting.date_range_start, meeting.date_range_end);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{meeting.title}</h1>
        {meeting.description && (
          <p className="text-gray-600 mt-1">{meeting.description}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {meeting.duration} min slots
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {meeting.timezone}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Created by {meeting.creator_name}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <RespondForm
          meetingId={meeting.id}
          dates={dates}
          slots={slots}
          duration={meeting.duration}
        />
      </div>
    </div>
  );
}
