'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import QRCodeView from './QRCodeView';
import GroupMessageView from './GroupMessageView';
import OrganizerView from './OrganizerView';
import ReportButton from './ReportButton';
import { useEventDetail } from '@/hooks/useEventDetail';
import { useAuth } from '@/contexts/AuthContext';

interface EventDetailViewProps {
  eventId: string;
}

export default function EventDetailView({ eventId }: EventDetailViewProps) {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const {
    event,
    isAttending,
    comments,
    organizerName,
    organizerImageUrl,
    isOrganizerBusiness,
    isLoading,
    toggleAttendance,
  } = useEventDetail(eventId);

  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showingMessages, setShowingMessages] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { dateStyle: 'long' });
  };

  const formatShortDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading || !event) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black">
        {/* Header - Back Button */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="relative w-full h-64 sm:h-80">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              {/* Attendance count overlay */}
              {event.attendeeCount && event.attendeeCount > 0 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-black/60 rounded-full">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="text-sm font-medium text-white">
                    {event.attendeeCount}
                  </span>
                </div>
              )}
              {/* Date overlay */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-full">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-white">{formatDate(event.date)}</span>
              </div>
            </div>
          )}

          <div className="px-4 py-6 space-y-6">
            {/* Title and Description */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {event.title}
                    </h1>
                    {event.isOnline && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg shadow-sm">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-semibold">
                          Virtual Event
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowShareSheet(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>

              {event.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event.description}
                </p>
              )}
            </div>

            {/* Event Details */}
            <div className="space-y-3">
              {event.date && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{formatShortDate(event.date)}</span>
                </div>
              )}

              {event.isOnline ? (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Online Event</span>
                </div>
              ) : (
                event.location && event.location !== 'Online Event' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                )
              )}

              {event.time && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{event.time}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isSignedIn ? (
              <div className="space-y-3">
                {isAttending && user && (
                  <button
                    onClick={() => setShowQRCode(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <span>Show Check-in Code</span>
                  </button>
                )}

                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                      event.isOnline
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                    }`}
                  >
                    {event.isOnline ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Join Online Event</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        <span>Find out more</span>
                      </>
                    )}
                  </a>
                )}

                <button
                  onClick={toggleAttendance}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium border-2 transition-colors ${
                    isAttending
                      ? 'bg-white dark:bg-gray-900 border-green-500 text-green-600 dark:text-green-400'
                      : 'bg-white dark:bg-gray-900 border-blue-500 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {isAttending ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  )}
                  <span>{isAttending ? "I'm Going!" : "I'm Going"}</span>
                </button>

                {event.attendeeCount !== undefined && event.attendeeCount > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {event.attendeeCount} {event.attendeeCount === 1 ? 'person' : 'people'} going
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 text-center text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Login to save this event!
                </Link>
                {event.attendeeCount !== undefined && event.attendeeCount > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {event.attendeeCount} {event.attendeeCount === 1 ? 'person' : 'people'} going
                  </p>
                )}
              </div>
            )}

            {/* Organizer Section */}
            {event.organizerId && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
                  Organized by
                </p>
                <OrganizerView
                  organizerId={event.organizerId}
                  organizerName={organizerName}
                  organizerImageUrl={organizerImageUrl}
                  isBusiness={isOrganizerBusiness}
                  eventId={event.id}
                />
              </div>
            )}

            {/* Report Button */}
            {event.id && (
              <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-800">
                <ReportButton
                  itemId={event.id}
                  itemType="event"
                  ownerId={event.businessId}
                />
              </div>
            )}
          </div>
        </div>

        {/* Comments Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <button
            onClick={() => {
              if (isSignedIn) {
                setShowingMessages(true);
              } else {
                setShowLoginAlert(true);
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>View Comments</span>
            {comments.length > 0 && (
              <span className="text-sm">({comments.length})</span>
            )}
          </button>
        </div>
      </div>

      {/* Share Sheet Modal */}
      {showShareSheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 dark:bg-black/70">
          <div className="w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Share Event
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: event.title,
                      text: event.description,
                      url: `${window.location.origin}/events/${event.slug || event.id}`,
                    });
                  } else {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/events/${event.slug || event.id}`
                    );
                  }
                  setShowShareSheet(false);
                }}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Share Link
              </button>
              <button
                onClick={() => setShowShareSheet(false)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && user && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowQRCode(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
              >
                Done
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <QRCodeView userId={user.uid} eventTitle={event.title} />
            </div>
          </div>
        </div>
      )}

      {/* Messages Modal */}
      {showingMessages && event.id && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <div className="h-full w-full md:max-w-[50vw] md:mx-auto md:w-full">
            <GroupMessageView groupId={event.id} groupType="event" />
          </div>
        </div>
      )}

      {/* Login Alert Modal */}
      {showLoginAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Sign In Required
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please sign in to view and post comments
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLoginAlert(false);
                    router.push('/login');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowLoginAlert(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

