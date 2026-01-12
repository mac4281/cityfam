export interface Event {
  id?: string;
  title: string;
  description?: string;
  date: Date | string;
  time?: string;
  location: string;
  imageUrl?: string;
  link?: string;
  businessId?: string;
  businessName?: string;
  organizerId?: string;
  organizerName?: string;
  attendeeCount?: number;
  attendees?: string[];
  slug?: string;
  isOnline?: boolean;
  isActive?: boolean;
  createdAt?: Date | string;
  // Add other event fields as needed
}

