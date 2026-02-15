'use client';

import type { SlotAvailability } from '@/lib/types';

interface HeatmapGridProps {
  dates: string[];
  timeSlots: Array<{ start: string; end: string; label: string; date: string }>;
  aggregated: SlotAvailability[];
  totalRespondents: number;
  duration: number;
  onSlotClick?: (slot: SlotAvailability) => void;
  selectedSlot?: { slot_start: string; slot_end: string } | null;
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getHeatColor(count: number, total: number): string {
  if (total === 0 || count === 0) return 'bg-gray-50';
  const ratio = count / total;
  if (ratio <= 0.25) return 'bg-emerald-100';
  if (ratio <= 0.5) return 'bg-emerald-300';
  if (ratio <= 0.75) return 'bg-emerald-500';
  return 'bg-emerald-700';
}

function getTextColor(count: number, total: number): string {
  if (total === 0 || count === 0) return 'text-gray-400';
  const ratio = count / total;
  return ratio > 0.5 ? 'text-white' : 'text-gray-700';
}

export function HeatmapGrid({
  dates,
  timeSlots,
  aggregated,
  totalRespondents,
  duration,
  onSlotClick,
  selectedSlot,
}: HeatmapGridProps) {
  const availabilityMap = new Map<string, SlotAvailability>();
  for (const a of aggregated) {
    availabilityMap.set(`${a.slot_start}|${a.slot_end}`, a);
  }

  const slotsByDate = new Map<string, typeof timeSlots>();
  for (const slot of timeSlots) {
    const existing = slotsByDate.get(slot.date) || [];
    existing.push(slot);
    slotsByDate.set(slot.date, existing);
  }

  const timeLabels = slotsByDate.get(dates[0])?.map((s) => s.label) || [];

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-px bg-gray-200 min-w-fit rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `72px repeat(${dates.length}, minmax(90px, 1fr))`,
        }}
      >
        {/* Header */}
        <div className="bg-gray-50 p-2 text-xs font-medium text-gray-500" />
        {dates.map((date) => (
          <div key={date} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-700">
            {formatDateHeader(date)}
          </div>
        ))}

        {/* Data rows */}
        {timeLabels.map((label, rowIdx) => (
          <div key={`row-${rowIdx}`} className="contents">
            <div className="bg-white px-2 py-1 text-xs text-gray-500 flex items-center justify-end pr-3">
              {label}
            </div>
            {dates.map((date) => {
              const slot = slotsByDate.get(date)?.[rowIdx];
              if (!slot) return <div key={`${date}-${rowIdx}`} className="bg-gray-100" />;

              const key = `${slot.start}|${slot.end}`;
              const availability = availabilityMap.get(key);
              const count = availability?.count || 0;
              const respondents = availability?.respondents || [];
              const heatColor = getHeatColor(count, totalRespondents);
              const textColor = getTextColor(count, totalRespondents);
              const isSelected =
                selectedSlot?.slot_start === slot.start && selectedSlot?.slot_end === slot.end;

              return (
                <div
                  key={key}
                  className={`relative flex items-center justify-center transition-all duration-75 ${heatColor} ${textColor} ${
                    onSlotClick ? 'cursor-pointer hover:ring-2 hover:ring-emerald-400 hover:ring-inset' : ''
                  } ${isSelected ? 'ring-2 ring-emerald-600 ring-inset' : ''}`}
                  style={{ minHeight: duration === 60 ? '40px' : duration === 30 ? '32px' : '24px' }}
                  title={
                    count > 0
                      ? `${count}/${totalRespondents} available: ${respondents.join(', ')}`
                      : 'No one available'
                  }
                  onClick={() => {
                    if (onSlotClick && availability) {
                      onSlotClick(availability);
                    }
                  }}
                >
                  {count > 0 && (
                    <span className="text-xs font-medium">{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <span>Less</span>
        <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded" />
        <div className="w-4 h-4 bg-emerald-100 rounded" />
        <div className="w-4 h-4 bg-emerald-300 rounded" />
        <div className="w-4 h-4 bg-emerald-500 rounded" />
        <div className="w-4 h-4 bg-emerald-700 rounded" />
        <span>More</span>
        <span className="ml-auto">
          {totalRespondents} response{totalRespondents !== 1 ? 's' : ''} total
        </span>
      </div>
    </div>
  );
}
