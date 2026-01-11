export interface BusinessHours {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface Business {
  id?: string;
  name: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  phoneNumber?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  hours?: {
    [key: string]: BusinessHours;
  };
  rating?: number;
  numberOfRatings?: number;
  slug?: string;
  ownerId?: string;
  latitude?: number;
  longitude?: number;
  verificationApproved?: boolean;
  verificationRequested?: boolean;
  subscriptionTier?: 'single' | 'all';
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'incomplete';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt?: Date | string;
  isActive?: boolean;
  // Add other business fields as needed
}

