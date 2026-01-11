import { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc, setDoc, updateDoc, serverTimestamp, increment, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Event } from '@/types/event';
import { Business } from '@/types/business';
import { useAuth } from '@/contexts/AuthContext';

interface UseEventFormProps {
  event?: Event | null;
  business?: Business | null;
  businessEvent?: boolean;
  isPro?: boolean;
}

export function useEventForm({
  event,
  business,
  businessEvent = false,
  isPro = false,
}: UseEventFormProps) {
  const { user } = useAuth();
  
  // Parse location from existing event
  const parseLocation = () => {
    if (event?.location) {
      const components = event.location.split(', ');
      if (components.length >= 4) {
        return {
          streetAddress: components[0],
          city: components[1],
          state: components[2],
          zipCode: components[3],
        };
      }
    }
    return { streetAddress: '', city: '', state: '', zipCode: '' };
  };

  const initialLocation = parseLocation();
  
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(
    event?.date ? (typeof event.date === 'string' ? new Date(event.date) : event.date) : new Date()
  );
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [streetAddress, setStreetAddress] = useState(initialLocation.streetAddress);
  const [city, setCity] = useState(initialLocation.city);
  const [state, setState] = useState(initialLocation.state);
  const [zipCode, setZipCode] = useState(initialLocation.zipCode);
  const [link, setLink] = useState(event?.link || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(event?.imageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formattedAddress = [streetAddress, city, state, zipCode]
    .filter((part) => part.trim() !== '')
    .join(', ');

  const formatTimeRange = (): string => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const start = formatter.format(startTime);
    const end = formatter.format(endTime);
    return `${start} - ${end}`;
  };

  const isValid = (): boolean => {
    return (
      title.trim() !== '' &&
      description.trim() !== '' &&
      streetAddress.trim() !== '' &&
      city.trim() !== '' &&
      state.trim() !== '' &&
      zipCode.trim() !== '' &&
      endTime > startTime
    );
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadEventImage = async (file: File): Promise<string> => {
    const path = business ? `business_images/${Date.now()}_${file.name}` : `events/${Date.now()}_${file.name}`;
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  const createEvent = async (
    organizer: string,
    organizerName: string,
    branchId: string,
    branchName: string
  ): Promise<string | null> => {
    if (!isValid()) {
      setErrorMessage('Please fill in all required fields');
      return null;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const eventData: any = {
        title: title.trim(),
        description: description.trim(),
        date,
        time: formatTimeRange(),
        location: formattedAddress,
        organizerId: organizer,
        organizerName: organizerName,
        branchId,
        branchName,
        businessId: businessEvent ? organizer : branchId,
        businessName: businessEvent ? organizerName : branchName,
        createdAt: serverTimestamp(),
        isActive: true,
        attendeeCount: 0,
        attendees: [],
        eventAdmin: user?.uid || '',
        isGlobal: isPro,
      };

      if (link.trim()) {
        eventData.link = link.trim();
      }

      // Upload image if selected
      if (selectedImage) {
        const imageUrl = await uploadEventImage(selectedImage);
        eventData.imageUrl = imageUrl;

        // Update business or user images array
        if (businessEvent && business?.id) {
          await updateDoc(doc(db, 'businesses', business.id), {
            images: arrayUnion(imageUrl),
          });
        } else if (user?.uid) {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              images: arrayUnion(imageUrl),
            },
            { merge: true }
          );
        }
      }

      // Create event document
      const eventRef = await addDoc(collection(db, 'events'), eventData);

      // Update analytics
      const analyticsRef = doc(db, 'analytics', 'global');
      await setDoc(
        analyticsRef,
        {
          events: increment(1),
        },
        { merge: true }
      );

      setIsLoading(false);
      return eventRef.id;
    } catch (error: any) {
      console.error('Error creating event:', error);
      setErrorMessage(error.message || 'Failed to create event');
      setIsLoading(false);
      return null;
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    streetAddress,
    setStreetAddress,
    city,
    setCity,
    state,
    setState,
    zipCode,
    setZipCode,
    link,
    setLink,
    selectedImage,
    imagePreview,
    handleImageSelect,
    isLoading,
    errorMessage,
    isValid,
    createEvent,
    formattedAddress,
  };
}

