import { useState, useRef } from 'react';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function usePostForm() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadPostImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const createPost = async (): Promise<string | null> => {
    if (!content.trim()) {
      setErrorMessage('Please enter some content');
      return null;
    }

    if (!user?.uid) {
      setErrorMessage('You must be signed in to create a post');
      return null;
    }

    // Prevent double submission
    if (isLoading) {
      return null;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Get branch info from localStorage
      const branchId = typeof window !== 'undefined' 
        ? localStorage.getItem('selectedBranchId') || '' 
        : '';
      const branchName = typeof window !== 'undefined' 
        ? localStorage.getItem('selectedBranchName') || '' 
        : '';

      // Get user document for author info
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const authorName = userData?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
      const authorProfileImageUrl = userData?.profileImageUrl || undefined;

      // Upload image if selected
      let imageUrl: string | undefined;
      if (selectedImage) {
        imageUrl = await uploadPostImage(selectedImage);
      }

      // Create post document
      const postData: any = {
        content: content.trim(),
        authorId: user.uid,
        authorName,
        authorProfileImageUrl: imageUrl || authorProfileImageUrl || undefined,
        branchId,
        branchName,
        createdAt: serverTimestamp(),
        isActive: true,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        likes: [],
        views: [],
      };

      if (imageUrl) {
        postData.imageUrl = imageUrl;
      }

      const postRef = await addDoc(collection(db, 'posts'), postData);

      // Reset form
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setIsLoading(false);

      return postRef.id;
    } catch (error: any) {
      console.error('Error creating post:', error);
      setErrorMessage(error.message || 'Failed to create post');
      setIsLoading(false);
      return null;
    }
  };

  return {
    content,
    setContent,
    selectedImage,
    imagePreview,
    handleImageSelect,
    removeImage,
    isLoading,
    errorMessage,
    createPost,
  };
}

