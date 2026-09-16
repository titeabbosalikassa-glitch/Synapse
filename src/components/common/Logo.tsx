import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = false }) => {
  const dimensions = size === 'sm' ? 28 : size === 'lg' ? 48 : size === 'xl' ? 64 : 36;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={dimensions}
        height={dimensions}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="blueTerm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="greenTerm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="ringGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* Circular Ring */}
        <circle
          cx="256"
          cy="256"
          r="210"
          stroke="url(#ringGrad)"
          strokeWidth="36"
          strokeLinecap="round"
          strokeDasharray="340 90"
          transform="rotate(-45 256 256)"
        />

        {/* Upper Blue Synaptic Terminal */}
        <path
          d="M130 110 C 130 110, 190 80, 255 155 C 320 230, 395 175, 395 175 L 420 200 C 420 200, 385 260, 315 225 C 245 190, 200 235, 175 205 L 130 110 Z"
          fill="url(#blueTerm)"
          className="drop-shadow"
        />
        <path
          d="M160 135 L 350 200 C 375 210, 380 240, 355 250 C 295 275, 220 255, 180 215 Z"
          fill="#38bdf8"
          opacity="0.85"
        />

        {/* Lower Green Synaptic Terminal */}
        <path
          d="M382 402 C 382 402, 322 432, 257 357 C 192 282, 117 337, 117 337 L 92 312 C 92 312, 127 252, 197 287 C 267 322, 312 277, 337 307 L 382 402 Z"
          fill="url(#greenTerm)"
          className="drop-shadow"
        />

        {/* Neurotransmitter vesicles (dots) in synaptic cleft */}
        <circle cx="230" cy="230" r="15" fill="#38bdf8" />
        <circle cx="265" cy="255" r="19" fill="#0284c7" />
        <circle cx="285" cy="220" r="13" fill="#fbbf24" />
        <circle cx="240" cy="280" r="17" fill="#10b981" />
        <circle cx="275" cy="295" r="13" fill="#34d399" />
        <circle cx="305" cy="265" r="15" fill="#3b82f6" />
        <circle cx="220" cy="255" r="11" fill="#facc15" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-900 tracking-tight text-base">SYNAPSE COACH</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
            Sciences & Langues
          </span>
        </div>
      )}
    </div>
  );
};
