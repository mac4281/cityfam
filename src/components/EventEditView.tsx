'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEventEdit } from '@/hooks/useEventEdit';
import { useAuth } from '@/contexts/AuthContext';
import AttendeeView from './AttendeeView';
import QRCodeScannerView from './QRCodeScannerView';
import { AppUser } from '@/types/user';

interface EventEditViewProps {
  eventId: string;
}

export default function EventEditView({ eventId }: EventEditViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    event,
    attendees,
    checkedInAttendees,
    isLoading,
    errorMessage,
    scannedCode,
    setScannedCode,
    loadEvent,
    loadAttendees,
    updateEvent,
    updateEventImage,
    deleteEvent,
    markAttendance,
    toggleStaffStatus,
    removeAttendee,
    isStaffMember,
    isEventAdmin,
  } = useEventEdit(eventId);

  const [isEditing, setIsEditing] = useState(false);
  const [showingDeleteAlert, setShowingDeleteAlert] = useState(false);
  const [showingScannerSheet, setShowingScannerSheet] = useState(false);
  const [showingScannerAlert, setShowingScannerAlert] = useState(false);
  const [scannerAlertMessage, setScannerAlertMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<AppUser | null>(null);
  const [showingAttendeeActionSheet, setShowingAttendeeActionSheet] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(typeof event.date === 'string' ? event.date : event.date.toISOString().split('T')[0]);
      setLocation(event.location);
    }
  }, [event]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    const success = await updateEventImage(file);
    if (success) {
      setSelectedImage(null);
    }
  };

  const handleSave = async () => {
    const eventDate = new Date(date);
    const success = await updateEvent(title, description, eventDate, location);
    if (success) {
      setIsEditing(false);
      await loadEvent();
    }
  };

  const handleDelete = async () => {
    const success = await deleteEvent();
    if (success) {
      router.back();
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
      setScannerAlertMessage(errorMessage || 'Failed to mark attendance');
      setShowingScannerAlert(true);
    }
  };

  const handleAttendeeAction = async (action: string) => {
    if (!selectedAttendee) return;

    switch (action) {
      case 'message':
        // Navigate to chat with user
        router.push(`/chat?userId=${selectedAttendee.id}`);
        break;
      case 'profile':
        router.push(`/users/${selectedAttendee.id}`);
        break;
      case 'staff':
        await toggleStaffStatus(selectedAttendee);
        break;
      case 'remove':
        await removeAttendee(selectedAttendee);
        await loadAttendees();
        break;
    }
    setShowingAttendeeActionSheet(false);
    setSelectedAttendee(null);
  };

  if (isLoading || !event) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  const admin = isEventAdmin();

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Event Details
          </h2>
          {!isEditing && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
              {/* Menu dropdown */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-20">
                    {admin && (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg transition-colors"
                        >
                          Edit Event
                        </button>
                        <button
                          onClick={() => {
                            setShowingDeleteAlert(true);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          Delete Event
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowingScannerSheet(true);
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        admin ? '' : 'rounded-t-lg'
                      } rounded-b-lg`}
                    >
                      Scan Attendees
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="p-4 space-y-6">
          {/* Event Image */}
          <div className="relative h-48 rounded-xl overflow-hidden">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt="Event preview"
                fill
                className="object-cover"
              />
            ) : event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
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
              </div>
            )}
            {isEditing && (
              <div className="absolute bottom-3 right-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Event Details */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
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
                <span>
                  {typeof event.date === 'string'
                    ? new Date(event.date).toLocaleDateString()
                    : event.date.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
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
            </div>
          )}

          {/* Checked-in Attendees */}
          {checkedInAttendees.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Checked In ({checkedInAttendees.length})
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {checkedInAttendees.map((userId) => {
                  const attendee = attendees.find((a) => a.id === userId);
                  if (!attendee) return null;
                  return (
                    <AttendeeView
                      key={userId}
                      user={attendee}
                      isStaff={isStaffMember(userId)}
                      isCheckedIn={true}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* RSVPs */}
          {attendees.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                RSVPs ({attendees.length})
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {attendees.map((attendee) => (
                  <AttendeeView
                    key={attendee.id}
                    user={attendee}
                    isStaff={isStaffMember(attendee.id)}
                    onClick={() => {
                      setSelectedAttendee(attendee);
                      setShowingAttendeeActionSheet(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Alert */}
      {showingDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Delete Event
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowingDeleteAlert(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                {admin && (
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Sheet */}
      {showingScannerSheet && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowingScannerSheet(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
              >
                Done
              </button>
            </div>
            <QRCodeScannerView
              onScan={handleScanResult}
              onError={(error) => {
                setScannerAlertMessage(error);
                setShowingScannerAlert(true);
              }}
              showSuccessAnimation={showSuccessAnimation}
            />
          </div>
        </div>
      )}

      {/* Scanner Alert */}
      {showingScannerAlert && (
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
                onClick={() => setShowingScannerAlert(false)}
                className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendee Action Sheet */}
      {showingAttendeeActionSheet && selectedAttendee && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 dark:bg-black/70">
          <div className="w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                RSVP Actions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                Choose an action for {selectedAttendee.name}
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={() => handleAttendeeAction('message')}
                className="w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Message {selectedAttendee.name}
              </button>
              <button
                onClick={() => handleAttendeeAction('profile')}
                className="w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={() => handleAttendeeAction('staff')}
                className="w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isStaffMember(selectedAttendee.id)
                  ? 'Remove from Staff'
                  : 'Make Staff Member'}
              </button>
              <button
                onClick={() => handleAttendeeAction('remove')}
                className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Remove RSVP
              </button>
              <button
                onClick={() => {
                  setShowingAttendeeActionSheet(false);
                  setSelectedAttendee(null);
                }}
                className="w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

