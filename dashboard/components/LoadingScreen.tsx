export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-grid">
      <div className="relative w-24 h-24">
        {/* Outer ring — indigo */}
        <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '8s' }} viewBox="0 0 100 100">
          <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="#4F46E5" strokeWidth="1" strokeDasharray="20 10" opacity="0.6" />
        </svg>
        {/* Inner ring — cyan */}
        <svg className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} viewBox="0 0 100 100">
          <rect x="15" y="15" width="70" height="70" fill="none" stroke="#06B6D4" strokeWidth="2" opacity="0.8" />
        </svg>
        {/* Cross-hair lines + corner marks */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <line x1="50" y1="20" x2="50" y2="40" stroke="#4F46E5" strokeWidth="2" className="animate-pulse" />
          <line x1="50" y1="60" x2="50" y2="80" stroke="#4F46E5" strokeWidth="2" className="animate-pulse" />
          <line x1="20" y1="50" x2="40" y2="50" stroke="#4F46E5" strokeWidth="2" className="animate-pulse" />
          <line x1="60" y1="50" x2="80" y2="50" stroke="#4F46E5" strokeWidth="2" className="animate-pulse" />
          <path d="M25,35 L25,25 L35,25" fill="none" stroke="#06B6D4" strokeWidth="2" />
          <path d="M65,25 L75,25 L75,35" fill="none" stroke="#06B6D4" strokeWidth="2" />
          <path d="M75,65 L75,75 L65,75" fill="none" stroke="#06B6D4" strokeWidth="2" />
          <path d="M35,75 L25,75 L25,65" fill="none" stroke="#06B6D4" strokeWidth="2" />
          <circle cx="50" cy="50" r="3" fill="#06B6D4" className="animate-ping" style={{ transformOrigin: 'center' }} />
          <circle cx="50" cy="50" r="2" fill="#0A0A0A" />
        </svg>
        {/* Scan line */}
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#06B6D4] to-transparent opacity-60 animate-scan" style={{ top: '50%' }} />
      </div>
      <div className="text-center space-y-1 mt-6">
        <p className="text-[10px] text-eva-green tracking-widest animate-pulse font-mono">INITIALIZING</p>
        <p className="text-xs text-eva-orange font-mono uppercase tracking-wider">Vigil HQ</p>
      </div>
      <div className="w-40 h-1 bg-[rgba(255,255,255,0.08)] overflow-hidden mt-4">
        <div className="h-full w-full bg-gradient-to-r from-[#4F46E5] via-[#06B6D4] to-[#4F46E5] bg-[length:200%_100%] animate-shimmer-gradient" />
      </div>
    </div>
  )
}
