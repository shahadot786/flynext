import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md text-center max-w-md w-full">
        <div className="h-16 w-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 shadow-sm">
          <svg className="h-8 w-8 animate-bounce-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6 font-semibold">
          Oops! The page you are looking for doesn&apos;t exist or has been moved to a new destination. Let&apos;s get you back on track.
        </p>

        <Link
          href="/"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase shadow-md transition-all text-center inline-block cursor-pointer"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
