export interface SupportingCompany {
  id?: string;
  businessId: string;
  ownerId: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  url?: string;
  address?: string;
  imageUrl?: string;
  subscriptionTier: 'single' | 'all';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'incomplete';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  dateCreated: Date | string;
  views: number;
  linkClicks: number;
  likes: number;
  isActive: boolean;
  // Optional social media fields
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

