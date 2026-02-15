import crypto from 'node:crypto';

export function generateId(): string {
  return crypto.randomUUID();
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatTime(hour: number, min: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${pad(min)} ${period}`;
}

export function generateTimeSlots(
  dateStart: string,
  dateEnd: string,
  timeStart: string,
  timeEnd: string,
  durationMinutes: number
): Array<{ start: string; end: string; label: string; date: string }> {
  const slots: Array<{ start: string; end: string; label: string; date: string }> = [];
  const dates = getDateRange(dateStart, dateEnd);

  for (const dateStr of dates) {
    const [startHour, startMin] = timeStart.split(':').map(Number);
    const [endHour, endMin] = timeEnd.split(':').map(Number);
    const dayStartMinutes = startHour * 60 + startMin;
    const dayEndMinutes = endHour * 60 + endMin;

    for (let m = dayStartMinutes; m + durationMinutes <= dayEndMinutes; m += durationMinutes) {
      const slotStartHour = Math.floor(m / 60);
      const slotStartMin = m % 60;
      const slotEndTotal = m + durationMinutes;
      const slotEndHour = Math.floor(slotEndTotal / 60);
      const slotEndMin = slotEndTotal % 60;

      const start = `${dateStr}T${pad(slotStartHour)}:${pad(slotStartMin)}:00`;
      const end = `${dateStr}T${pad(slotEndHour)}:${pad(slotEndMin)}:00`;

      slots.push({
        start,
        end,
        label: formatTime(slotStartHour, slotStartMin),
        date: dateStr,
      });
    }
  }
  return slots;
}

export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (current <= last) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatSlotDisplay(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
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
