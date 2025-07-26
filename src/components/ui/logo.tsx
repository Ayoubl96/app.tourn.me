'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export function Logo({
  className = '',
  width = 120,
  height = 34,
  showText = true
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={`animate-pulse rounded bg-muted ${className}`}
        style={{ width, height }}
      />
    );
  }

  // Fallback to text logo if image fails or for small sizes
  if (imageError || width < 60) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Trophy
          className='text-primary'
          style={{
            width: Math.min(width / 4, 24),
            height: Math.min(height, 24)
          }}
        />
        {showText && (
          <span
            className='font-bold text-primary'
            style={{ fontSize: Math.min(width / 8, 16) }}
          >
            tourn.me
          </span>
        )}
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';
  const logoSrc = isDark ? '/logo.svg' : '/logo.svg';

  return (
    <Image
      src={logoSrc}
      alt='tourn.me'
      width={width}
      height={height}
      className={`object-contain ${className}`}
      style={{ width: width, height: 'auto' }}
      priority
      onError={() => setImageError(true)}
    />
  );
}

// Simplified logo icon for smaller spaces (like sidebar)
export function LogoIcon({
  className = '',
  size = 24
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Trophy className='text-primary' style={{ width: size, height: size }} />
    </div>
  );
}

// Custom tourn.me branded icon
export function TournMeIcon({
  className = '',
  size = 24
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: '#f6b43c', // Direct brand color
        color: '#ffffff'
      }}
    >
      <Trophy style={{ width: size * 0.6, height: size * 0.6 }} />
    </div>
  );
}

// Simple text logo for when you want styled text
export function TextLogo({
  className = '',
  size = 'base'
}: {
  className?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
}) {
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <span
      className={`font-bold text-primary ${sizeClasses[size]} ${className}`}
    >
      tourn.me
    </span>
  );
}
