import { getDb } from '@/lib/db';
import { generateTimeSlots, getDateRange } from '@/lib/utils';
import { CopyButton } from '@/components/CopyButton';
import { DashboardClient } from '@/components/DashboardClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { MeetingRow, ResponseRow, AvailabilitySlotRow, SlotAvailability } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function MeetingDetailPage({ params }: { params: { id: string } }) {
  const db = getDb();
  const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(params.id) as MeetingRow | undefined;

  if (!meeting) {
    notFound();
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const shareLink = `${baseUrl}/meeting/${meeting.id}/respond`;

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
    meeting.date_range_start,
    meeting.date_range_end,
    meeting.time_range_start,
    meeting.time_range_end,
    meeting.duration
  );

  const dates = getDateRange(meeting.date_range_start, meeting.date_range_end);

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

  if (meeting.finalized_slot_start) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">{meeting.title}</h1>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mt-4">
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">Meeting Finalized</h2>
          <p className="text-emerald-700">
            This meeting has been scheduled. View the details on the{' '}
            <Link href={`/meeting/${meeting.id}/results`} className="underline font-medium">
              results page
            </Link>.
          </p>
        </div>
      </div>
    );
  }

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
        </div>
      </div>

      {/* Bookmark reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Bookmark this page!</span> This is your organizer dashboard &mdash; you&apos;ll need this link to check responses and review availability.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <code className="text-xs text-amber-700 bg-amber-100 px-3 py-1.5 rounded flex-1 overflow-x-auto">
            {`${baseUrl}/meeting/${meeting.id}`}
          </code>
          <CopyButton text={`${baseUrl}/meeting/${meeting.id}`} />
        </div>
      </div>

      {/* Share link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-800 font-medium mb-1">Share this link with participants:</p>
        <div className="flex items-center gap-3">
          <code className="text-sm text-blue-700 bg-blue-100 px-3 py-1.5 rounded flex-1 overflow-x-auto">
            {shareLink}
          </code>
          <CopyButton text={shareLink} />
        </div>
      </div>

      {/* Responses list */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Responses ({responses.length})
        </h2>
        {responses.length === 0 ? (
          <p className="text-gray-500 text-sm">No responses yet. Share the link above to get started.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {responses.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
              >
                {r.respondent_name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Heatmap + finalize */}
      {responses.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Availability Heatmap</h2>
          <p className="text-sm text-gray-600 mb-4">
            Darker cells mean more people are available. Click a slot to select it for finalization.
          </p>
          <DashboardClient
            meetingId={meeting.id}
            dates={dates}
            timeSlots={allSlots}
            aggregated={aggregated}
            totalRespondents={responses.length}
            duration={meeting.duration}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          The availability heatmap will appear here once participants respond.
        </div>
      )}
    </div>
  );
}
