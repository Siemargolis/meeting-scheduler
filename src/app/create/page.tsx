import { MeetingForm } from '@/components/MeetingForm';

export default function CreatePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">Create a New Meeting</h1>
      <p className="text-gray-600 mb-8">
        Set up your meeting details and share the link with participants.
      </p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <MeetingForm />
      </div>
    </div>
  );
}
