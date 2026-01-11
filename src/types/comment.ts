export interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorId?: string;
  createdAt?: Date | string;
  // Add other comment fields as needed
}

