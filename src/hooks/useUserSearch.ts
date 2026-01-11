import { useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppUser } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

export function useUserSearch() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchUsers = async (queryText: string) => {
    if (!queryText.trim() || !user?.uid) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Firestore doesn't support case-insensitive search, so we search for names starting with the query
      const q = query(
        usersRef,
        where('name', '>=', queryText),
        where('name', '<=', queryText + '\uf8ff'),
        limit(20)
      );

      const snapshot = await getDocs(q);

      const filteredUsers: AppUser[] = snapshot.docs
        .filter((doc) => doc.id !== user.uid) // Don't include current user
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: (data.name as string) || '',
            email: data.email as string | undefined,
            profileImageUrl: data.profileImageUrl as string | undefined,
            homeBranchId: data.homeBranchId as string | undefined,
            homeBranchName: data.homeBranchName as string | undefined,
          };
        });

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    searchUsers,
  };
}

