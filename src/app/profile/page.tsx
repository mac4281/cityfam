'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { authManager } from '@/lib/authManager';
import { useProfile } from '@/hooks/useProfile';
import ReceiptsSection from '@/components/ReceiptsSection';
import ProfilePostCard from '@/components/ProfilePostCard';
import EventCard from '@/components/EventCard';
import EventFormView from '@/components/EventFormView';
import BranchSelectorView from '@/components/BranchSelectorView';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const {
    userEvents,
    rsvpdEvents,
    staffEvents,
    userPosts,
    userName,
    profileImageUrl,
    homeBranchName,
    isLoading: profileLoading,
    saveProfile,
    saveHomeBranch,
    deletePost,
    loadAll,
  } = useProfile();

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showHomeBranchSelector, setShowHomeBranchSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userName) {
      setEditedName(userName);
    }
  }, [userName]);

  useEffect(() => {
    if (profileImageUrl) {
      setImagePreview(profileImageUrl);
    }
  }, [profileImageUrl]);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadProfileImage = async (file: File): Promise<string> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    const storageRef = ref(storage, `profile_images/${user.uid}.jpg`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setIsUploading(true);
    try {
      let imageUrl = profileImageUrl;
      
      // Upload new image if selected
      if (selectedImage) {
        imageUrl = await uploadProfileImage(selectedImage);
      }

      // Save profile
      await saveProfile(editedName, imageUrl);
      setIsEditing(false);
      setSelectedImage(null);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(`Error saving profile: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      await authManager.deleteAccount();
      router.push('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setDeleteErrorMessage(error.message || 'Failed to delete account');
      setShowDeleteError(true);
      setShowDeleteAccountConfirm(false);
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getBranchId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedBranchId') || '';
    }
    return '';
  };

  const getBranchName = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedBranchName') || '';
    }
    return '';
  };

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="px-4 py-6">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Please sign in to view your profile
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="px-4 py-6 space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {imagePreview ? (
                <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-700">
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-[120px] h-[120px] rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                  <svg
                    className="w-16 h-16 text-gray-400"
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
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
            >
              {imagePreview ? 'Change Photo' : 'Add Photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageSelect(file);
                }
              }}
            />
          </div>

          {/* User Info Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Home Branch
                </label>
                <button
                  onClick={() => setShowHomeBranchSelector(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                {homeBranchName}
              </div>
            </div>

            {(isEditing || selectedImage) && (
              <button
                onClick={handleSaveProfile}
                disabled={isUploading}
                className="w-full px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Saving...' : 'Save'}
              </button>
            )}

            {!isEditing && !selectedImage && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Receipts Section */}
          <div className="space-y-2">
            <ReceiptsSection userId={user.uid} />
          </div>

          {/* Member Since */}
          {user.metadata?.creationTime && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Member since {formatDate(new Date(user.metadata.creationTime))}
            </p>
          )}

          {/* Events You Created */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Events you created
              </h2>
              <button
                onClick={() => setShowAddEvent(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Event
              </button>
            </div>

            {profileLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            ) : userEvents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You haven't created any events yet
              </p>
            ) : (
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-4">
                  {userEvents.map((event) => (
                    <EventCard
                      key={event.id || `event-${event.title}`}
                      event={event}
                      onClick={() => {
                        if (event.id) {
                          router.push(`/events/${event.id}/organizer`);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Events You're Working */}
          {staffEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Events You're Working
              </h2>
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-4">
                  {staffEvents.map((event) => (
                    <EventCard
                      key={event.id || `staff-event-${event.title}`}
                      event={event}
                      showStar={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Events You're Attending */}
          {rsvpdEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Events You're Attending
              </h2>
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-4">
                  {rsvpdEvents.map((event) => (
                    <EventCard
                      key={event.id || `rsvpd-event-${event.title}`}
                      event={event}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Your Posts */}
          {userPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Your Posts
              </h2>
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <ProfilePostCard
                    key={post.id || `post-${post.content}`}
                    post={post}
                    onDelete={() => {
                      if (post.id) {
                        deletePost(post.id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Settings/Options */}
          <div className="space-y-2">
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-red-600 dark:text-red-400 font-medium">Sign Out</span>
            </button>
            <button
              onClick={() => setShowDeleteAccountConfirm(true)}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <div className="h-full w-full md:max-w-[50vw] md:mx-auto md:w-full">
            <EventFormView
              organizer={user.uid}
              organizerName={userName || user.displayName || user.email?.split('@')[0] || 'User'}
              branchId={getBranchId()}
              branchName={getBranchName()}
              businessEvent={false}
              onClose={() => {
                setShowAddEvent(false);
                loadAll();
              }}
            />
          </div>
        </div>
      )}

      {/* Home Branch Selector */}
      {showHomeBranchSelector && (
        <BranchSelectorView
          isOpen={true}
          currentBranchName={homeBranchName}
          onSelect={async (branchId, branchName) => {
            await saveHomeBranch(branchId, branchName);
            setShowHomeBranchSelector(false);
          }}
          onClose={() => setShowHomeBranchSelector(false)}
        />
      )}

      {/* Sign Out Confirmation */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Sign Out
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to sign out?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await authManager.signOut();
                      router.push('/login');
                    } catch (error) {
                      console.error('Error signing out:', error);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation */}
      {showDeleteAccountConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Delete Account
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will delete your entire account and cannot be reversed. Are you sure you want
                to continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAccountConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Error */}
      {showDeleteError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Error
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {deleteErrorMessage}
              </p>
              <button
                onClick={() => setShowDeleteError(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
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
