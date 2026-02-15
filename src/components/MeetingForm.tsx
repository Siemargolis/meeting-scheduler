'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
];

export function MeetingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [form, setForm] = useState({
    creator_name: '',
    creator_email: '',
    title: '',
    description: '',
    duration: 30,
    date_range_start: '',
    date_range_end: '',
    time_range_start: '09:00',
    time_range_end: '17:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || [data.error || 'Something went wrong.']);
        return;
      }

      router.push(`/meeting/${data.id}`);
    } catch {
      setErrors(['Network error. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          {errors.map((err, i) => (
            <p key={i} className="text-red-700 text-sm">{err}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Your Name</label>
          <input
            type="text"
            required
            className={inputClass}
            value={form.creator_name}
            onChange={(e) => update('creator_name', e.target.value)}
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className={labelClass}>Your Email</label>
          <input
            type="email"
            required
            className={inputClass}
            value={form.creator_email}
            onChange={(e) => update('creator_email', e.target.value)}
            placeholder="jane@example.com"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Meeting Title</label>
        <input
          type="text"
          required
          className={inputClass}
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Team Sync"
        />
      </div>

      <div>
        <label className={labelClass}>Description (optional)</label>
        <textarea
          className={inputClass}
          rows={2}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Brief description of the meeting..."
        />
      </div>

      <div>
        <label className={labelClass}>Duration</label>
        <div className="flex gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => update('duration', d.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                form.duration === d.value
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            required
            className={inputClass}
            value={form.date_range_start}
            onChange={(e) => update('date_range_start', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input
            type="date"
            required
            className={inputClass}
            value={form.date_range_end}
            onChange={(e) => update('date_range_end', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Earliest Time</label>
          <input
            type="time"
            required
            className={inputClass}
            value={form.time_range_start}
            onChange={(e) => update('time_range_start', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Latest Time</label>
          <input
            type="time"
            required
            className={inputClass}
            value={form.time_range_end}
            onChange={(e) => update('time_range_end', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Timezone</label>
        <input
          type="text"
          readOnly
          className={`${inputClass} bg-gray-50`}
          value={form.timezone}
        />
        <p className="text-xs text-gray-500 mt-1">Automatically detected from your browser</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Meeting'}
      </button>
    </form>
  );
}
