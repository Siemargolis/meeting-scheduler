'use client';

import { useState, useCallback, useRef } from 'react';

interface TimeGridProps {
  dates: string[];
  slots: Array<{ start: string; end: string; label: string; date: string }>;
  duration: number;
  onSelectionChange: (selected: Array<{ slot_start: string; slot_end: string }>) => void;
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function TimeGrid({ dates, slots, duration, onSelectionChange }: TimeGridProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isDragging = useRef(false);
  const dragMode = useRef<'select' | 'deselect'>('select');

  const slotsByDate = new Map<string, typeof slots>();
  for (const slot of slots) {
    const existing = slotsByDate.get(slot.date) || [];
    existing.push(slot);
    slotsByDate.set(slot.date, existing);
  }

  const timeLabels = slotsByDate.get(dates[0])?.map((s) => s.label) || [];

  const slotKey = (slot: { start: string; end: string }) => `${slot.start}|${slot.end}`;

  const notifyParent = useCallback(
    (newSelected: Set<string>) => {
      const selectedSlots = Array.from(newSelected).map((k) => {
        const [slot_start, slot_end] = k.split('|');
        return { slot_start, slot_end };
      });
      onSelectionChange(selectedSlots);
    },
    [onSelectionChange]
  );

  const handleMouseDown = useCallback(
    (slot: { start: string; end: string }) => {
      isDragging.current = true;
      const key = slotKey(slot);
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          dragMode.current = 'deselect';
          next.delete(key);
        } else {
          dragMode.current = 'select';
          next.add(key);
        }
        notifyParent(next);
        return next;
      });
    },
    [notifyParent]
  );

  const handleMouseEnter = useCallback(
    (slot: { start: string; end: string }) => {
      if (!isDragging.current) return;
      const key = slotKey(slot);
      setSelected((prev) => {
        const next = new Set(prev);
        if (dragMode.current === 'select') {
          next.add(key);
        } else {
          next.delete(key);
        }
        notifyParent(next);
        return next;
      });
    },
    [notifyParent]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      className="select-none overflow-x-auto"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="grid gap-px bg-gray-200 min-w-fit rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `72px repeat(${dates.length}, minmax(90px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div className="bg-gray-50 p-2 text-xs font-medium text-gray-500" />
        {dates.map((date) => (
          <div
            key={date}
            className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-700"
          >
            {formatDateHeader(date)}
          </div>
        ))}

        {/* Slot rows */}
        {timeLabels.map((label, rowIdx) => (
          <div key={`row-${rowIdx}`} className="contents">
            <div className="bg-white px-2 py-1 text-xs text-gray-500 flex items-center justify-end pr-3">
              {label}
            </div>
            {dates.map((date) => {
              const slot = slotsByDate.get(date)?.[rowIdx];
              if (!slot) return <div key={`${date}-${rowIdx}`} className="bg-gray-100" />;

              const key = slotKey(slot);
              const isSelected = selected.has(key);

              return (
                <div
                  key={key}
                  className={`cursor-pointer transition-colors duration-75 ${
                    isSelected
                      ? 'bg-emerald-400 hover:bg-emerald-500'
                      : 'bg-white hover:bg-emerald-100'
                  }`}
                  style={{ minHeight: duration === 60 ? '40px' : duration === 30 ? '32px' : '24px' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(slot);
                  }}
                  onMouseEnter={() => handleMouseEnter(slot)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-emerald-400 rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-white border border-gray-200 rounded" />
          <span>Not selected</span>
        </div>
        <span className="ml-auto">Click and drag to select</span>
      </div>
    </div>
  );
}
