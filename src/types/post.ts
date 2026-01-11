export interface Post {
  id?: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  authorId?: string;
  authorProfileImageUrl?: string;
  likeCount: number;
  likes: string[]; // Array of user IDs who liked
  viewCount: number;
  commentCount: number;
  createdAt?: Date | string;
  branchId?: string;
  isActive?: boolean;
  // Add other post fields as needed
}

