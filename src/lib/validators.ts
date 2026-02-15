import type { CreateMeetingPayload } from './types';

export function validateCreateMeeting(data: unknown): {
  valid: boolean;
  errors: string[];
  payload?: CreateMeetingPayload;
} {
  const errors: string[] = [];
  const d = data as Record<string, unknown>;

  if (!d.creator_name || typeof d.creator_name !== 'string' || d.creator_name.trim().length === 0) {
    errors.push('Creator name is required.');
  }
  if (!d.creator_email || typeof d.creator_email !== 'string' || !isEmail(d.creator_email)) {
    errors.push('A valid creator email is required.');
  }
  if (!d.title || typeof d.title !== 'string' || d.title.trim().length === 0) {
    errors.push('Meeting title is required.');
  }
  if (![15, 30, 60].includes(Number(d.duration))) {
    errors.push('Duration must be 15, 30, or 60 minutes.');
  }
  if (!d.date_range_start || !isDateString(d.date_range_start as string)) {
    errors.push('Valid start date required (YYYY-MM-DD).');
  }
  if (!d.date_range_end || !isDateString(d.date_range_end as string)) {
    errors.push('Valid end date required (YYYY-MM-DD).');
  }
  if (d.date_range_start && d.date_range_end && d.date_range_start > d.date_range_end) {
    errors.push('Start date must be before or equal to end date.');
  }
  if (!d.time_range_start || !isTimeString(d.time_range_start as string)) {
    errors.push('Valid start time required (HH:MM).');
  }
  if (!d.time_range_end || !isTimeString(d.time_range_end as string)) {
    errors.push('Valid end time required (HH:MM).');
  }
  if (d.time_range_start && d.time_range_end && d.time_range_start >= d.time_range_end) {
    errors.push('Start time must be before end time.');
  }
  if (!d.timezone || typeof d.timezone !== 'string') {
    errors.push('Timezone is required.');
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    errors: [],
    payload: {
      creator_name: (d.creator_name as string).trim(),
      creator_email: (d.creator_email as string).trim().toLowerCase(),
      title: (d.title as string).trim(),
      description: ((d.description as string) || '').trim(),
      duration: Number(d.duration) as 15 | 30 | 60,
      date_range_start: d.date_range_start as string,
      date_range_end: d.date_range_end as string,
      time_range_start: d.time_range_start as string,
      time_range_end: d.time_range_end as string,
      timezone: d.timezone as string,
    },
  };
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isDateString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

function isTimeString(s: string): boolean {
  return /^\d{2}:\d{2}$/.test(s);
}
