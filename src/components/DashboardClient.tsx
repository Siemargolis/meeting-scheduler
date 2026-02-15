'use client';

import { useState, useCallback } from 'react';
import { HeatmapGrid } from './HeatmapGrid';
import { SlotPicker } from './SlotPicker';
import type { SlotAvailability, TimeSlot } from '@/lib/types';

interface DashboardClientProps {
  meetingId: string;
  dates: string[];
  timeSlots: Array<{ start: string; end: string; label: string; date: string }>;
  aggregated: SlotAvailability[];
  totalRespondents: number;
  duration: number;
}

export function DashboardClient({
  meetingId,
  dates,
  timeSlots,
  aggregated,
  totalRespondents,
  duration,
}: DashboardClientProps) {
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailability | null>(null);

  const handleSlotClick = useCallback((slot: SlotAvailability) => {
    setSelectedSlot((prev) =>
      prev?.slot_start === slot.slot_start && prev?.slot_end === slot.slot_end ? null : slot
    );
  }, []);

  return (
    <div className="space-y-6">
      <HeatmapGrid
        dates={dates}
        timeSlots={timeSlots}
        aggregated={aggregated}
        totalRespondents={totalRespondents}
        duration={duration}
        onSlotClick={handleSlotClick}
        selectedSlot={
          selectedSlot
            ? { slot_start: selectedSlot.slot_start, slot_end: selectedSlot.slot_end }
            : null
        }
      />
      <SlotPicker meetingId={meetingId} selectedSlot={selectedSlot} />
    </div>
  );
}
