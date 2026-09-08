/**
 * Full-screen loading screen shown during auth initialization.
 * Prevents UI flash before we know if user is logged in.
 */
export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-jample-light">
      <div className="flex flex-col items-center gap-6">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-jample-gradient flex items-center justify-center shadow-jample-lg">
          <span className="text-white font-black text-2xl">JL</span>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-jample-dark">Jample Life</h1>
          <p className="text-sm text-gray-500 mt-0.5">Rich World Healthy World</p>
        </div>

        {/* Spinner */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-jample-burgundy animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
