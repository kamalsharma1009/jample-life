import { Link } from 'react-router-dom'
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 shadow-sm">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <span className="text-sm font-bold uppercase tracking-widest text-jample-burgundy mb-2">
        Error 404
      </span>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Page Not Found
      </h1>
      <p className="text-slate-600 max-w-md mx-auto mb-8 text-base">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-jample-burgundy text-white font-semibold hover:bg-jample-burgundy/90 transition shadow-md shadow-jample-burgundy/20"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  )
}
