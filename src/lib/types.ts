export interface MeetingRow {
  id: string;
  creator_name: string;
  creator_email: string;
  title: string;
  description: string;
  duration: 15 | 30 | 60;
  date_range_start: string;
  date_range_end: string;
  time_range_start: string;
  time_range_end: string;
  timezone: string;
  created_at: string;
  finalized_slot_start: string | null;
  finalized_slot_end: string | null;
}

export interface ResponseRow {
  id: string;
  meeting_id: string;
  respondent_name: string;
  respondent_email: string;
  created_at: string;
}

export interface AvailabilitySlotRow {
  id: number;
  response_id: string;
  slot_start: string;
  slot_end: string;
}

export interface CreateMeetingPayload {
  creator_name: string;
  creator_email: string;
  title: string;
  description?: string;
  duration: 15 | 30 | 60;
  date_range_start: string;
  date_range_end: string;
  time_range_start: string;
  time_range_end: string;
  timezone: string;
}

export interface SubmitResponsePayload {
  respondent_name: string;
  respondent_email: string;
  slots: Array<{ slot_start: string; slot_end: string }>;
}

export interface FinalizePayload {
  slot_start: string;
  slot_end: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  label: string;
  date: string;
}

export interface SlotAvailability {
  slot_start: string;
  slot_end: string;
  count: number;
  respondents: string[];
}

export interface MeetingWithResponses extends MeetingRow {
  responses: Array<ResponseRow & { slots: AvailabilitySlotRow[] }>;
  aggregated: SlotAvailability[];
}
