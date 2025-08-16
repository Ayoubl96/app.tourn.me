'use client';

import { Logo } from '@/components/ui/logo';
import { useState, useEffect } from 'react';

// Padel-specific images
const PADEL_IMAGES = [
  {
    src: '/tourn-me-padel-tournament.webp',
    alt: 'Padel tournament excitement'
  },
  {
    src: 'https://pplx-res.cloudinary.com/image/upload/v1755360128/pplx_project_search_images/c31a868c6bb9473401c86de669fde12937c84c33.png',
    alt: 'Padel players in action'
  },
  {
    src: 'https://pplx-res.cloudinary.com/image/upload/v1755360241/pplx_project_search_images/2531b95a72bd3e0b40003029347b6add3b2952c2.png',
    alt: 'Intense padel match moment'
  },
  {
    src: 'https://pplx-res.cloudinary.com/image/upload/v1755360241/pplx_project_search_images/cbe20c50556bfee14f4cedcbbd0c3a276f1bdb52.png',
    alt: 'Padel doubles team'
  }
];

interface AuthSideImageProps {
  className?: string;
}

export default function AuthSideImage({ className = '' }: AuthSideImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Change image every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % PADEL_IMAGES.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const currentImage = PADEL_IMAGES[currentImageIndex];

  return (
    <div
      className={`relative hidden h-full flex-col p-10 text-white dark:border-r lg:flex ${className}`}
    >
      {/* Background Image with Overlay */}
      <div className='absolute inset-0'>
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className={`h-full w-full object-cover transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
        {/* Dark overlay for text readability */}
        <div className='absolute inset-0 bg-black/60' />
        {/* Gradient overlay for better text contrast */}
        <div className='absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60' />
      </div>

      {/* Logo at top */}
      <div className='relative z-20 flex items-center text-lg font-medium'>
        <Logo width={120} height={32} className='mr-2 drop-shadow-lg' />
      </div>

      {/* Image indicator dots at bottom */}
      <div className='relative z-20 mt-auto'>
        <div className='flex justify-center space-x-2'>
          {PADEL_IMAGES.map((_, index: number) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? 'scale-110 bg-white'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
