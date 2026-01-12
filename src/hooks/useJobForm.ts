import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Job } from '@/types/job';
import { Business } from '@/types/business';
import { useAuth } from '@/contexts/AuthContext';

interface UseJobFormProps {
  job?: Job | null;
  business?: Business | null;
}

export function useJobForm({ job, business }: UseJobFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load job data if editing
  useEffect(() => {
    if (job) {
      setTitle(job.title || '');
      setType(job.type || '');
      setLocation(job.location || '');
      setDescription(job.description || '');
      setSalary(job.salary || '');
      setApplicationLink(job.applicationLink || '');
    }
  }, [job]);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadJobImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `job_images/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const isValid = (): boolean => {
    return !!(title.trim() && type.trim() && location.trim());
  };

  const createJob = async (businessId: string, businessName: string): Promise<string | null> => {
    if (!isValid()) {
      setErrorMessage('Please fill in all required fields (title, type, location)');
      return null;
    }

    if (!user?.uid) {
      setErrorMessage('You must be signed in to create a job');
      return null;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const jobData: any = {
        title: title.trim(),
        type: type.trim(),
        location: location.trim(),
        businessId,
        businessName,
        createdAt: serverTimestamp(),
        isActive: true,
      };

      // Only add optional fields if they have values
      if (description.trim()) {
        jobData.description = description.trim();
      }
      if (salary.trim()) {
        jobData.salary = salary.trim();
      }
      if (applicationLink.trim()) {
        jobData.applicationLink = applicationLink.trim();
      }

      // Upload image if selected
      if (selectedImage) {
        const imageUrl = await uploadJobImage(selectedImage);
        jobData.imageUrl = imageUrl;
      }

      // Create job document
      const jobRef = await addDoc(collection(db, 'jobs'), jobData);

      // Update analytics
      const analyticsRef = doc(db, 'analytics', 'global');
      await updateDoc(analyticsRef, {
        jobs: increment(1),
      });

      setIsLoading(false);
      return jobRef.id;
    } catch (error: any) {
      console.error('Error creating job:', error);
      setErrorMessage(error.message || 'Failed to create job');
      setIsLoading(false);
      return null;
    }
  };

  const updateJob = async (): Promise<boolean> => {
    if (!job?.id) {
      setErrorMessage('Job ID is required');
      return false;
    }

    if (!isValid()) {
      setErrorMessage('Please fill in all required fields (title, type, location)');
      return false;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const jobData: any = {
        title: title.trim(),
        type: type.trim(),
        location: location.trim(),
      };

      // Only add optional fields if they have values
      if (description.trim()) {
        jobData.description = description.trim();
      }
      if (salary.trim()) {
        jobData.salary = salary.trim();
      }
      if (applicationLink.trim()) {
        jobData.applicationLink = applicationLink.trim();
      }

      // Upload image if selected
      if (selectedImage) {
        const imageUrl = await uploadJobImage(selectedImage);
        jobData.imageUrl = imageUrl;
      }

      // Update job document
      await updateDoc(doc(db, 'jobs', job.id), jobData);

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Error updating job:', error);
      setErrorMessage(error.message || 'Failed to update job');
      setIsLoading(false);
      return false;
    }
  };

  return {
    title,
    setTitle,
    type,
    setType,
    location,
    setLocation,
    description,
    setDescription,
    salary,
    setSalary,
    applicationLink,
    setApplicationLink,
    imagePreview,
    handleImageSelect,
    isLoading,
    errorMessage,
    isValid,
    createJob,
    updateJob,
  };
}

