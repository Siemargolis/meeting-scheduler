import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { MeetingRow, ResponseRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

function formatSlot(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const startTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const endTime = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${dateStr}\n${startTime} - ${endTime}`;
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const db = getDb();
  const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(params.id) as MeetingRow | undefined;

  if (!meeting) {
    notFound();
  }

  const responses = db.prepare(
    'SELECT DISTINCT respondent_name, respondent_email FROM responses WHERE meeting_id = ?'
  ).all(meeting.id) as Pick<ResponseRow, 'respondent_name' | 'respondent_email'>[];

  if (!meeting.finalized_slot_start || !meeting.finalized_slot_end) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">{meeting.title}</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            The meeting time hasn&apos;t been finalized yet. The organizer is still collecting responses.
          </p>
        </div>
        <Link
          href={`/meeting/${meeting.id}/respond`}
          className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Submit your availability
        </Link>
      </div>
    );
  }

  const [datePart, timePart] = formatSlot(meeting.finalized_slot_start, meeting.finalized_slot_end).split('\n');

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-1">{meeting.title}</h1>
        <p className="text-gray-600">Meeting time confirmed</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-2">Scheduled For</p>
        <p className="text-xl font-bold text-gray-900">{datePart}</p>
        <p className="text-lg text-emerald-600 font-semibold mt-1">{timePart}</p>
        <p className="text-sm text-gray-500 mt-2">{meeting.timezone}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Organized by</h2>
        <p className="text-gray-900">{meeting.creator_name}</p>
      </div>

      {responses.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Participants</h2>
          <div className="flex flex-wrap gap-2">
            {responses.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
              >
                {r.respondent_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
