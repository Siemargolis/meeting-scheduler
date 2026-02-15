'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SlotAvailability } from '@/lib/types';

interface SlotPickerProps {
  meetingId: string;
  selectedSlot: SlotAvailability | null;
}

function formatSlot(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const startTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const endTime = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${dateStr}, ${startTime} - ${endTime}`;
}

export function SlotPicker({ meetingId, selectedSlot }: SlotPickerProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!selectedSlot) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
        Click a time slot on the heatmap above to select it for finalization.
      </div>
    );
  }

  const handleFinalize = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/meetings/${meetingId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_start: selectedSlot.slot_start,
          slot_end: selectedSlot.slot_end,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to finalize.');
        return;
      }

      router.push(`/meeting/${meetingId}/results`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
      <h3 className="font-semibold text-emerald-800 mb-2">Selected Time Slot</h3>
      <p className="text-emerald-700 font-medium">
        {formatSlot(selectedSlot.slot_start, selectedSlot.slot_end)}
      </p>
      <p className="text-emerald-600 text-sm mt-1">
        {selectedSlot.count} participant{selectedSlot.count !== 1 ? 's' : ''} available
        {selectedSlot.respondents.length > 0 && (
          <span>: {selectedSlot.respondents.join(', ')}</span>
        )}
      </p>

      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="mt-3 bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Finalize This Time
        </button>
      ) : (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleFinalize}
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Finalizing...' : 'Confirm'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-gray-600 text-sm hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
