'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Logo from './Logo';
import HourRow from './HourRow';
import { useBusinessDetail } from '@/hooks/useBusinessDetail';
import { Business } from '@/types/business';

interface BusinessDetailViewProps {
  businessId: string;
}

export default function BusinessDetailView({ businessId }: BusinessDetailViewProps) {
  const router = useRouter();
  const { business, events, jobs, isLoading } = useBusinessDetail(businessId);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (business?.address) {
      geocodeAddress(business.address);
    } else if (business?.latitude && business?.longitude) {
      setMapLocation({ lat: business.latitude, lng: business.longitude });
    }
  }, [business]);

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setMapLocation({ lat: location.lat, lng: location.lng });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const openInMaps = () => {
    if (!business?.address) return;
    const addressString = encodeURIComponent(business.address);
    const url = `https://maps.google.com/?q=${addressString}`;
    window.open(url, '_blank');
  };

  const callPhone = (phone: string) => {
    const phoneNumber = phone.replace(/\s/g, '');
    window.location.href = `tel:${phoneNumber}`;
  };

  const sendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const openWebsite = (website: string) => {
    let url = website;
    if (!url.toLowerCase().startsWith('http')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  };

  const formatSocialUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  if (isLoading || !business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="flex flex-col">
        {/* Business Image */}
        {business.imageUrl && (
          <div className="relative w-full h-64 sm:h-80">
            <Image
              src={business.imageUrl}
              alt={business.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        )}

        {/* Business Info */}
        <div className="px-4 py-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {business.name}
                </h1>
                {business.rating && business.numberOfRatings !== undefined && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {business.rating.toFixed(1)}
                    </span>
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({business.numberOfRatings})
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowShareSheet(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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

            {business.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {business.description}
              </p>
            )}

            {/* Map View */}
            {mapLocation && (
              <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${mapLocation.lat},${mapLocation.lng}&zoom=15`}
                />
              </div>
            )}

            {/* Address Button */}
            {business.address && (
              <button
                onClick={openInMaps}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm font-semibold">{business.address}</span>
              </button>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            {business.phoneNumber && (
              <button
                onClick={() => callPhone(business.phoneNumber!)}
                className="w-full flex items-center gap-3 text-left text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm">{business.phoneNumber}</span>
              </button>
            )}

            {business.email && (
              <button
                onClick={() => sendEmail(business.email!)}
                className="w-full flex items-center gap-3 text-left text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">{business.email}</span>
              </button>
            )}

            {business.website && (
              <button
                onClick={() => openWebsite(business.website!)}
                className="w-full flex items-center gap-3 text-left text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <span className="text-sm">{business.website}</span>
              </button>
            )}
          </div>

          {/* Social Media Links */}
          {(business.facebook || business.instagram || business.twitter || business.linkedin) && (
            <div className="flex items-center gap-5">
              {business.facebook && (
                <a
                  href={formatSocialUrl(business.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {business.instagram && (
                <a
                  href={formatSocialUrl(business.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {business.twitter && (
                <a
                  href={formatSocialUrl(business.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              )}
              {business.linkedin && (
                <a
                  href={formatSocialUrl(business.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* Hours of Operation */}
          {business.hours && Object.keys(business.hours).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Hours of Operation
              </h3>
              <div className="space-y-2">
                {business.hours.monday && (
                  <HourRow day="Monday" hours={business.hours.monday} />
                )}
                {business.hours.tuesday && (
                  <HourRow day="Tuesday" hours={business.hours.tuesday} />
                )}
                {business.hours.wednesday && (
                  <HourRow day="Wednesday" hours={business.hours.wednesday} />
                )}
                {business.hours.thursday && (
                  <HourRow day="Thursday" hours={business.hours.thursday} />
                )}
                {business.hours.friday && (
                  <HourRow day="Friday" hours={business.hours.friday} />
                )}
                {business.hours.saturday && (
                  <HourRow day="Saturday" hours={business.hours.saturday} />
                )}
                {business.hours.sunday && (
                  <HourRow day="Sunday" hours={business.hours.sunday} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Events Section */}
        {events.length > 0 && (
          <div className="px-4 py-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Events</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={event.id ? `/events/${event.id}` : '#'}
                  className="flex-shrink-0 w-44"
                >
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-44">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {typeof event.date === 'string'
                        ? new Date(event.date).toLocaleDateString()
                        : event.date.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                      {event.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Jobs Section */}
        {jobs.length > 0 && (
          <div className="px-4 py-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jobs</h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={job.id ? `/jobs/${job.id}` : '#'}
                  className="block p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {job.type}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {job.location}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {business.images && business.images.length > 0 && (
          <div className="px-4 py-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Photos</h2>
            <div className="grid grid-cols-3 gap-1">
              {business.images.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={imageUrl}
                    alt={`${business.name} photo ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    sizes="33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Sheet Modal */}
      {showShareSheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 dark:bg-black/70">
          <div className="w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Share Business
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: business.name,
                      text: business.description,
                      url: `${window.location.origin}/businesses/${business.slug || business.id}`,
                    });
                  } else {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/businesses/${business.slug || business.id}`
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
    </div>
  );
}

