'use client';

import { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';

interface ContentCardViewProps {
  imageUrl?: string | null;
  title: string;
  subtitle?: string | null;
  children: ReactNode;
}

export default function ContentCardView({
  imageUrl,
  title,
  subtitle,
  children,
}: ContentCardViewProps) {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Reset states when imageUrl changes
    if (imageUrl) {
      setImageLoadError(false);
      setImageLoaded(false);
    } else {
      setImageLoadError(true);
    }
  }, [imageUrl]);

  return (
    <div className="relative w-full h-[280px] bg-gray-200 dark:bg-gray-800 overflow-hidden rounded-xl">
      {/* Background Image */}
      {imageUrl && !imageLoadError ? (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className={`object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoadError(true);
              setImageLoaded(false);
            }}
            sizes="100vw"
            priority={false}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
          {imageLoadError ? (
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ) : (
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-white/80">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}

