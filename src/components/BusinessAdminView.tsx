'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Business } from '@/types/business';
import { useBusinessAdmin } from '@/hooks/useBusinessAdmin';
import EventRowView from './EventRowView';
import JobRowView from './JobRowView';
import AdminPhotoGridView from './AdminPhotoGridView';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';

interface BusinessAdminViewProps {
  business: Business;
  isPro?: boolean; // Subscription status
}

export default function BusinessAdminView({
  business,
  isPro = false,
}: BusinessAdminViewProps) {
  const router = useRouter();
  const {
    events,
    jobs,
    deleteEvent,
    deleteJob,
    deleteBusiness: deleteBusinessAction,
    refreshBusiness,
  } = useBusinessAdmin(business.id || null);

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddContent = isPro;

  const handleDeleteBusiness = async () => {
    try {
      await deleteBusinessAction(business);
      router.back();
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !business.id) return;

    const storageRef = ref(storage, `business_images/`);
    const businessRef = doc(db, 'businesses', business.id);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        // Create unique filename
        const filename = `${business.id}_${Date.now()}_${i}.jpg`;
        const imageRef = ref(storage, `business_images/${filename}`);

        // Upload image
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);

        // Add to images array
        await updateDoc(businessRef, {
          images: arrayUnion(imageUrl),
        });
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    await refreshBusiness();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto">
        {/* Business Info Section */}
        <section className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {business.name}
              </h2>
              {business.address && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {business.address}
                </p>
              )}
            </div>
            <Link
              href={`/businesses/${business.id}/edit`}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* Events Section */}
        <section className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Events
          </h3>
          <div className="space-y-1">
            {events.map((event) => (
              <div key={event.id} className="relative group">
                <EventRowView
                  event={event}
                  business={business}
                  isPro={isPro}
                  onDelete={() => deleteEvent(event)}
                />
                {isPro && (
                  <button
                    onClick={() => deleteEvent(event)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                    aria-label="Delete event"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {canAddContent ? (
              <button
                onClick={() => setShowAddEvent(true)}
                className="w-full flex items-center gap-2 p-4 text-blue-500 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add New Event</span>
              </button>
            ) : (
              <button
                onClick={() => setShowSubscriptionAlert(true)}
                className="w-full flex items-center justify-between p-4 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Add New Event</span>
                </div>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* Jobs Section */}
        <section className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Jobs
          </h3>
          <div className="space-y-1">
            {jobs.map((job) => (
              <div key={job.id} className="relative group">
                <JobRowView
                  job={job}
                  business={business}
                  isPro={isPro}
                  onDelete={() => deleteJob(job)}
                />
                {isPro && (
                  <button
                    onClick={() => deleteJob(job)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                    aria-label="Delete job"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {canAddContent ? (
              <button
                onClick={() => setShowAddJob(true)}
                className="w-full flex items-center gap-2 p-4 text-blue-500 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add New Job</span>
              </button>
            ) : (
              <button
                onClick={() => setShowSubscriptionAlert(true)}
                className="w-full flex items-center justify-between p-4 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Add New Job</span>
                </div>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* Photo Gallery Section */}
        <section className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Photo Gallery
          </h3>
          {business.images && business.images.length > 0 && (
            <div className="mb-4 h-[300px] overflow-y-auto">
              <AdminPhotoGridView
                images={business.images}
                business={business}
                onImagesUpdated={refreshBusiness}
              />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 p-4 text-blue-500 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add Photos</span>
          </button>
        </section>

        {/* Danger Zone Section */}
        <section className="p-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Danger Zone
            </h3>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Delete Business</span>
            </button>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Delete Business?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will permanently delete this business and all associated events
                and jobs. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBusiness}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Alert Modal */}
      {showSubscriptionAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Add Your Business
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                To add events and jobs, please add your business on CityFam.com.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubscriptionAlert(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    window.open('https://cityfam.com', '_blank');
                    setShowSubscriptionAlert(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Visit CityFam.com
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

