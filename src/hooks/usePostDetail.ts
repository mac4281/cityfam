import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/types/post';

export function usePostDetail(postId: string | null) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const listenerRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!postId) {
      setIsLoading(false);
      return;
    }

    console.log('🔵 usePostDetail: Starting post observer for:', postId);

    const postRef = doc(db, 'posts', postId);

    const unsubscribe = onSnapshot(
      postRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const postData: Post = {
            id: snapshot.id,
            content: data.content || '',
            imageUrl: data.imageUrl || undefined,
            authorName: data.authorName || 'Unknown',
            authorId: data.authorId || undefined,
            authorProfileImageUrl: data.authorProfileImageUrl || undefined,
            likeCount: data.likeCount || 0,
            likes: data.likes || [],
            viewCount: data.viewCount || 0,
            commentCount: data.commentCount || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            branchId: data.branchId || undefined,
            isActive: data.isActive !== false,
          };
          setPost(postData);
          console.log('✅ usePostDetail: Post loaded:', postData);
        } else {
          console.log('⚠️ usePostDetail: Post not found');
          setPost(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('❌ usePostDetail: Error loading post:', error);
        setIsLoading(false);
      }
    );

    listenerRef.current = unsubscribe;

    return () => {
      console.log('🛑 usePostDetail: Stopping post observer');
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
    };
  }, [postId]);

  return {
    post,
    isLoading,
  };
}

