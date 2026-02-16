import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Find the <span className="text-emerald-600">perfect time</span> to meet
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Create a meeting poll, share the link, and let everyone mark when they&apos;re free.
          See availability at a glance and pick the best slot.
        </p>
        <div className="mt-10">
          <Link
            href="/create"
            className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            Create a Meeting
          </Link>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-xl font-bold">1</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Create</h3>
          <p className="text-gray-600 text-sm">
            Set your meeting title, pick a date range and time window, and choose a duration.
          </p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-xl font-bold">2</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Share</h3>
          <p className="text-gray-600 text-sm">
            Send the link to participants. They click and drag to mark when they&apos;re available.
          </p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-xl font-bold">3</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Pick</h3>
          <p className="text-gray-600 text-sm">
            View a heatmap of everyone&apos;s availability and pick the best time to send out your invite.
          </p>
        </div>
      </div>
    </div>
  );
}
