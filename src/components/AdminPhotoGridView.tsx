'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Business } from '@/types/business';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

interface AdminPhotoGridViewProps {
  images: string[];
  business: Business;
  onImagesUpdated: () => void;
}

export default function AdminPhotoGridView({
  images,
  business,
  onImagesUpdated,
}: AdminPhotoGridViewProps) {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setShowActionSheet(true);
  };

  const setAsMainImage = async (imageUrl: string) => {
    if (!business.id) return;

    const businessRef = doc(db, 'businesses', business.id);

    try {
      await updateDoc(businessRef, {
        imageUrl: imageUrl,
      });
      setAlertMessage('Main image updated successfully');
      setShowSuccessAlert(true);
      setShowActionSheet(false);
      onImagesUpdated();
    } catch (error) {
      console.error('Error updating main image:', error);
      setAlertMessage('Failed to update main image');
      setShowSuccessAlert(true);
    }
  };

  const deleteImage = async (imageUrl: string) => {
    if (!business.id) return;

    // Don't allow deletion if it's the main image
    if (imageUrl === business.imageUrl) {
      setAlertMessage('Cannot delete the main image');
      setShowSuccessAlert(true);
      setShowDeleteConfirmation(false);
      setShowActionSheet(false);
      return;
    }

    const businessRef = doc(db, 'businesses', business.id);

    try {
      // Remove from images array
      await updateDoc(businessRef, {
        images: arrayRemove([imageUrl]),
      });

      // Delete from Storage
      try {
        // Extract path from URL
        const urlParts = imageUrl.split('business_images/');
        if (urlParts.length > 1) {
          const pathParts = urlParts[1].split('?');
          const imagePath = `business_images/${pathParts[0]}`;
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
        }
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue even if storage deletion fails
      }

      setAlertMessage('Image deleted successfully');
      setShowSuccessAlert(true);
      setShowDeleteConfirmation(false);
      setShowActionSheet(false);
      onImagesUpdated();
    } catch (error) {
      console.error('Error deleting image:', error);
      setAlertMessage('Failed to delete image');
      setShowSuccessAlert(true);
    }
  };

  return (
    <>
      <div className="px-4">
        <div className="grid grid-cols-3 gap-0.5">
          {images.map((imageUrl) => (
            <div
              key={imageUrl}
              className="relative aspect-square bg-gray-200 dark:bg-gray-800 cursor-pointer"
              onClick={() => handleImageClick(imageUrl)}
            >
              {!imageErrors.has(imageUrl) ? (
                <Image
                  src={imageUrl}
                  alt="Business photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 33vw"
                  onLoad={() => {
                    setImageLoading((prev) => {
                      const next = new Set(prev);
                      next.delete(imageUrl);
                      return next;
                    });
                  }}
                  onError={() => {
                    setImageErrors((prev) => new Set(prev).add(imageUrl));
                    setImageLoading((prev) => {
                      const next = new Set(prev);
                      next.delete(imageUrl);
                      return next;
                    });
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              {imageLoading.has(imageUrl) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Sheet Modal */}
      {showActionSheet && selectedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 dark:bg-black/70">
          <div className="w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                Image Options
              </h3>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  setAsMainImage(selectedImageUrl);
                }}
                className="w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Set as Main Image
              </button>
              <button
                onClick={() => {
                  setShowImageViewer(true);
                  setShowActionSheet(false);
                }}
                className="w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                View Image
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(true);
                  setShowActionSheet(false);
                }}
                className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Delete Image
              </button>
              <button
                onClick={() => {
                  setShowActionSheet(false);
                  setSelectedImageUrl(null);
                }}
                className="w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && selectedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Delete Image?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete this image? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    deleteImage(selectedImageUrl);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setSelectedImageUrl(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert Modal */}
      {showSuccessAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Success
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {alertMessage}
              </p>
              <button
                onClick={() => {
                  setShowSuccessAlert(false);
                  setSelectedImageUrl(null);
                }}
                className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && selectedImageUrl && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4">
              <button
                onClick={() => {
                  setShowImageViewer(false);
                  setSelectedImageUrl(null);
                }}
                className="px-4 py-2 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
                <Image
                  src={selectedImageUrl}
                  alt="Full size image"
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

