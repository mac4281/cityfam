'use client';

import Image from 'next/image';
import { AppUser } from '@/types/user';

interface ScannerOverlayViewProps {
  showSuccessAnimation: boolean;
  recentCheckedInAttendees: AppUser[];
}

export default function ScannerOverlayView({
  showSuccessAnimation,
  recentCheckedInAttendees,
}: ScannerOverlayViewProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Success checkmark animation */}
      {showSuccessAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform transition-all duration-300 scale-100 opacity-80 animate-in zoom-in duration-300">
            <svg
              className="w-24 h-24 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Recent check-ins list */}
      {recentCheckedInAttendees.length > 0 && (
        <div 
          className="absolute bottom-0 left-0 right-0 pointer-events-auto"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="bg-black/70 backdrop-blur-sm">
            <div className="px-4 pt-4 pb-4">
              <h3 className="text-base font-semibold text-white mb-3 flex-shrink-0">
                Recent Check-ins
              </h3>
              <div 
                className="overflow-y-auto overscroll-contain space-y-3 touch-pan-y" 
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  maxHeight: '200px',
                  minHeight: '60px'
                }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {recentCheckedInAttendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 flex-shrink-0"
                  >
                    {/* Profile image */}
                    {attendee.profileImageUrl ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={attendee.profileImageUrl}
                          alt={attendee.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Name and status */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {attendee.name}
                      </p>
                      <p className="text-xs text-white/70">
                        Just checked in
                      </p>
                    </div>

                    {/* Checkmark icon */}
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

