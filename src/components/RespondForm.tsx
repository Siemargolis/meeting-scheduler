'use client';

import { useState, useCallback, FormEvent } from 'react';
import { TimeGrid } from './TimeGrid';

interface RespondFormProps {
  meetingId: string;
  dates: string[];
  slots: Array<{ start: string; end: string; label: string; date: string }>;
  duration: number;
}

export function RespondForm({ meetingId, dates, slots, duration }: RespondFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Array<{ slot_start: string; slot_end: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSelectionChange = useCallback(
    (selected: Array<{ slot_start: string; slot_end: string }>) => {
      setSelectedSlots(selected);
    },
    []
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (selectedSlots.length === 0) {
      setError('Please select at least one time slot.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondent_name: name.trim(),
          respondent_email: email.trim(),
          slots: selectedSlots,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Availability Submitted!</h2>
        <p className="text-gray-600">
          Thanks, {name}! The meeting organizer will be notified and will pick a final time.
        </p>
      </div>
    );
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm';

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input
            type="text"
            required
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
          <input
            type="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select your available times ({selectedSlots.length} selected)
        </label>
        <TimeGrid
          dates={dates}
          slots={slots}
          duration={duration}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Availability'}
      </button>
    </form>
  );
}
