'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEventEdit } from '@/hooks/useEventEdit';
import { useAuth } from '@/contexts/AuthContext';
import AttendeeView from './AttendeeView';
import QRCodeScannerView from './QRCodeScannerView';
import { AppUser } from '@/types/user';

interface OrganizerManagementViewProps {
  eventId: string;
}

export default function OrganizerManagementView({ eventId }: OrganizerManagementViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    event,
    attendees,
    checkedInAttendees,
    staffMembers,
    isLoading,
    isEventAdmin,
    toggleStaffStatus,
    markAttendance,
    errorMessage,
  } = useEventEdit(eventId);

  const [selectedAttendee, setSelectedAttendee] = useState<AppUser | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [scannerAlertMessage, setScannerAlertMessage] = useState('');
  const [showScannerAlert, setShowScannerAlert] = useState(false);

  if (isLoading || !event) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Check if user is the organizer
  if (!isEventAdmin() && user?.uid !== event.organizerId) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-2">
            Access Denied
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You must be the organizer to view this page.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { dateStyle: 'long' });
  };

  const handleAttendeeClick = (attendee: AppUser) => {
    setSelectedAttendee(attendee);
    setShowActionSheet(true);
  };

  const handleMarkCheckIn = async () => {
    if (selectedAttendee) {
      await markAttendance(selectedAttendee.id);
      setShowActionSheet(false);
      setSelectedAttendee(null);
    }
  };

  const handleToggleOrganizer = async () => {
    if (selectedAttendee) {
      await toggleStaffStatus(selectedAttendee);
      setShowActionSheet(false);
      setSelectedAttendee(null);
    }
  };

  const handleScanResult = async (code: string) => {
    const success = await markAttendance(code);
    if (success) {
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 1000);
    } else {
      setScannerAlertMessage(errorMessage || 'Failed to mark attendance. User may not be in the RSVP list.');
      setShowScannerAlert(true);
    }
  };

  const isCheckedIn = (userId: string) => checkedInAttendees.includes(userId);
  const isStaff = (userId: string) => staffMembers.includes(userId);

  // Separate attendees into checked-in and not checked-in
  const checkedInList = attendees.filter((a) => isCheckedIn(a.id));
  const notCheckedInList = attendees.filter((a) => !isCheckedIn(a.id));

  // Get recent checked-in attendees (most recent first)
  // The checkedInAttendees array is ordered with most recent at the beginning
  const getRecentCheckedInAttendees = (): AppUser[] => {
    return checkedInAttendees
      .map((userId) => attendees.find((a) => a.id === userId))
      .filter((attendee): attendee is AppUser => attendee !== undefined)
      .slice(0, 10); // Limit to 10 most recent
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
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
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Event Management
          </h1>
          <div className="w-6" /> {/* Spacer */}
        </div>

        <div className="p-4 space-y-6">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}

          {/* Event Info */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {event.title}
            </h2>
            {event.date && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(event.date)}
              </p>
            )}
          </div>

          {/* QR Scanner Button */}
          <button
            onClick={() => setShowScanner(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
            <span>Scan QR Code to Check In</span>
          </button>

          {/* Checked In Section */}
          {checkedInList.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Checked In ({checkedInList.length})
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {checkedInList.map((attendee) => (
                  <div key={attendee.id} className="flex-shrink-0">
                    <AttendeeView
                      user={attendee}
                      isStaff={isStaff(attendee.id)}
                      isCheckedIn={true}
                      onClick={() => handleAttendeeClick(attendee)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RSVPs Section */}
          {attendees.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                RSVPs ({attendees.length})
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {attendees.map((attendee) => (
                  <div key={attendee.id} className="flex-shrink-0">
                    <AttendeeView
                      user={attendee}
                      isStaff={isStaff(attendee.id)}
                      isCheckedIn={isCheckedIn(attendee.id)}
                      onClick={() => handleAttendeeClick(attendee)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {attendees.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                No attendees yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Sheet Modal */}
      {showActionSheet && selectedAttendee && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 dark:bg-black/70">
          <div className="w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              {selectedAttendee.profileImageUrl ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedAttendee.profileImageUrl}
                    alt={selectedAttendee.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-gray-400"
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
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {selectedAttendee.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {selectedAttendee.email || 'No email'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {!isCheckedIn(selectedAttendee.id) && (
                <button
                  onClick={handleMarkCheckIn}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Mark as Checked In</span>
                </button>
              )}

              <button
                onClick={handleToggleOrganizer}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isStaff(selectedAttendee.id)
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>
                  {isStaff(selectedAttendee.id)
                    ? 'Remove as Organizer'
                    : 'Make Organizer'}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowActionSheet(false);
                  setSelectedAttendee(null);
                }}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
              >
                Done
              </button>
            </div>
            <QRCodeScannerView
              onScan={handleScanResult}
              onError={(error) => {
                setScannerAlertMessage(error);
                setShowScannerAlert(true);
              }}
              showSuccessAnimation={showSuccessAnimation}
              recentCheckedInAttendees={getRecentCheckedInAttendees()}
            />
          </div>
        </div>
      )}

      {/* Scanner Alert */}
      {showScannerAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Scan Error
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {scannerAlertMessage}
              </p>
              <button
                onClick={() => setShowScannerAlert(false)}
                className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

