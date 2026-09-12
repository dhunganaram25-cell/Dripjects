import React from 'react';

interface DripjectsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const DripjectsLogo: React.FC<DripjectsLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', badge: 'text-[9px] px-1.5 py-0.2' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', badge: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl', badge: 'text-xs px-2.5 py-0.5' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', badge: 'text-sm px-3 py-1' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Visual Emblem Icon */}
      <div className={`relative shrink-0 ${currentSize.icon}`}>
        <img
          src="/logo.svg"
          alt="Dripjects Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)] select-none"
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className={`font-extrabold tracking-tight text-white font-['Space_Grotesk',sans-serif] ${currentSize.text}`}>
              DRIP<span className="text-emerald-400">JECTS</span>
            </span>
            <span className={`uppercase font-bold tracking-wider rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${currentSize.badge}`}>
              Vault
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:block -mt-0.5">
            Minecraft Builds & Maps
          </span>
        </div>
      )}
    </div>
  );
};
