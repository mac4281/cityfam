export interface Job {
  id?: string;
  title: string;
  type: string;
  location: string;
  description?: string;
  salary?: string;
  applicationLink?: string;
  imageUrl?: string;
  businessId: string;
  businessName?: string;
  createdAt?: Date | string;
  isActive?: boolean;
  // Add other job fields as needed
}

