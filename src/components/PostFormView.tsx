'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePostForm } from '@/hooks/usePostForm';

interface PostFormViewProps {
  onPostCreated?: () => void;
  onClose?: () => void;
}

export default function PostFormView({ onPostCreated, onClose }: PostFormViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    content,
    setContent,
    imagePreview,
    handleImageSelect,
    removeImage,
    isLoading,
    errorMessage,
    createPost,
  } = usePostForm();

  const handleSubmit = async () => {
    const postId = await createPost();
    if (postId) {
      if (onPostCreated) {
        onPostCreated();
      }
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const isFormValid = content.trim().length > 0 && !isLoading;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black md:mx-auto md:max-w-[50vw] md:w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          New Post
        </h2>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="text-blue-500 dark:text-blue-400 font-medium hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Content Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            disabled={isLoading}
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={imagePreview}
                  alt="Post preview"
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              <button
                onClick={removeImage}
                disabled={isLoading}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors disabled:opacity-50"
                aria-label="Remove image"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Image Picker Button */}
          {!imagePreview && (
            <button
              onClick={handleImageClick}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">Add Photo</span>
            </button>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Creating post...</p>
          </div>
        </div>
      )}
    </div>
  );
}

