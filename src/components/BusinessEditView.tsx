'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Business, BusinessHours } from '@/types/business';
import DayHoursView from './DayHoursView';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

interface BusinessEditViewProps {
  business: Business;
}

interface HoursForm {
  mondayOpen: string;
  mondayClose: string;
  mondayClosed: boolean;
  tuesdayOpen: string;
  tuesdayClose: string;
  tuesdayClosed: boolean;
  wednesdayOpen: string;
  wednesdayClose: string;
  wednesdayClosed: boolean;
  thursdayOpen: string;
  thursdayClose: string;
  thursdayClosed: boolean;
  fridayOpen: string;
  fridayClose: string;
  fridayClosed: boolean;
  saturdayOpen: string;
  saturdayClose: string;
  saturdayClosed: boolean;
  sundayOpen: string;
  sundayClose: string;
  sundayClosed: boolean;
}

export default function BusinessEditView({ business }: BusinessEditViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hoursForm, setHoursForm] = useState<HoursForm>({
    mondayOpen: '',
    mondayClose: '',
    mondayClosed: false,
    tuesdayOpen: '',
    tuesdayClose: '',
    tuesdayClosed: false,
    wednesdayOpen: '',
    wednesdayClose: '',
    wednesdayClosed: false,
    thursdayOpen: '',
    thursdayClose: '',
    thursdayClosed: false,
    fridayOpen: '',
    fridayClose: '',
    fridayClosed: false,
    saturdayOpen: '',
    saturdayClose: '',
    saturdayClosed: false,
    sundayOpen: '',
    sundayClose: '',
    sundayClosed: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    initializeWithBusiness();
  }, [business]);

  const initializeWithBusiness = () => {
    setName(business.name || '');
    setDescription(business.description || '');
    setPhoneNumber(business.phoneNumber || '');
    setEmail(business.email || '');
    setWebsite(business.website || '');
    setFacebook(business.facebook || '');
    setInstagram(business.instagram || '');
    setTwitter(business.twitter || '');
    setLinkedin(business.linkedin || '');

    // Parse address
    if (business.address) {
      const addressParts = business.address.split(',');
      if (addressParts.length >= 3) {
        setStreetAddress(addressParts[0].trim());
        setCity(addressParts[1].trim());
        const stateZip = addressParts[2].trim().split(' ');
        setState(stateZip[0] || '');
        setZipCode(stateZip[1] || '');
      } else {
        setStreetAddress(business.address);
      }
    }

    // Initialize hours
    if (business.hours) {
      setHoursForm({
        mondayOpen: business.hours.monday?.open || '',
        mondayClose: business.hours.monday?.close || '',
        mondayClosed: business.hours.monday?.isClosed || false,
        tuesdayOpen: business.hours.tuesday?.open || '',
        tuesdayClose: business.hours.tuesday?.close || '',
        tuesdayClosed: business.hours.tuesday?.isClosed || false,
        wednesdayOpen: business.hours.wednesday?.open || '',
        wednesdayClose: business.hours.wednesday?.close || '',
        wednesdayClosed: business.hours.wednesday?.isClosed || false,
        thursdayOpen: business.hours.thursday?.open || '',
        thursdayClose: business.hours.thursday?.close || '',
        thursdayClosed: business.hours.thursday?.isClosed || false,
        fridayOpen: business.hours.friday?.open || '',
        fridayClose: business.hours.friday?.close || '',
        fridayClosed: business.hours.friday?.isClosed || false,
        saturdayOpen: business.hours.saturday?.open || '',
        saturdayClose: business.hours.saturday?.close || '',
        saturdayClosed: business.hours.saturday?.isClosed || false,
        sundayOpen: business.hours.sunday?.open || '',
        sundayClose: business.hours.sunday?.close || '',
        sundayClosed: business.hours.sunday?.isClosed || false,
      });
    }
  };

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBusiness = async () => {
    if (!business.id) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const businessRef = doc(db, 'businesses', business.id);
      const updateData: any = {
        name,
        description,
        phoneNumber,
        email,
        website,
        facebook,
        instagram,
        twitter,
        linkedin,
      };

      // Build address
      const addressParts = [streetAddress, city, `${state} ${zipCode}`].filter(Boolean);
      if (addressParts.length > 0) {
        updateData.address = addressParts.join(', ');
      }

      // Build hours
      const hours: { [key: string]: BusinessHours } = {};
      if (!hoursForm.mondayClosed) {
        hours.monday = {
          open: hoursForm.mondayOpen,
          close: hoursForm.mondayClose,
          isClosed: false,
        };
      } else {
        hours.monday = { open: '', close: '', isClosed: true };
      }
      if (!hoursForm.tuesdayClosed) {
        hours.tuesday = {
          open: hoursForm.tuesdayOpen,
          close: hoursForm.tuesdayClose,
          isClosed: false,
        };
      } else {
        hours.tuesday = { open: '', close: '', isClosed: true };
      }
      if (!hoursForm.wednesdayClosed) {
        hours.wednesday = {
          open: hoursForm.wednesdayOpen,
          close: hoursForm.wednesdayClose,
          isClosed: false,
        };
      } else {
        hours.wednesday = { open: '', close: '', isClosed: true };
      }
      if (!hoursForm.thursdayClosed) {
        hours.thursday = {
          open: hoursForm.thursdayOpen,
          close: hoursForm.thursdayClose,
          isClosed: false,
        };
      } else {
        hours.thursday = { open: '', close: '', isClosed: true };
      }
      if (!hoursForm.fridayClosed) {
        hours.friday = {
          open: hoursForm.fridayOpen,
          close: hoursForm.fridayClose,
          isClosed: false,
        };
      } else {
        hours.friday = { open: '', close: '', isClosed: true };
      }
      if (!hoursForm.saturdayClosed) {
        hours.saturday = {
          open: hoursForm.saturdayOpen,
          close: hoursForm.saturdayClose,
          isClosed: false,
        };
      } else {
        hours.saturday = { open: '', close: '', isClosed: true };
      }
      if (!hoursForm.sundayClosed) {
        hours.sunday = {
          open: hoursForm.sundayOpen,
          close: hoursForm.sundayClose,
          isClosed: false,
        };
      } else {
        hours.sunday = { open: '', close: '', isClosed: true };
      }
      updateData.hours = hours;

      // Handle image upload
      if (imagePreview && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const imageRef = ref(storage, `business_images/${business.id}_${Date.now()}.jpg`);
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);
        updateData.imageUrl = imageUrl;
      }

      await updateDoc(businessRef, updateData);

      // Also update the corresponding supportingCompany document
      try {
        const supportingCompaniesRef = collection(db, 'supportingCompanies');
        const q = query(
          supportingCompaniesRef,
          where('businessId', '==', business.id)
        );
        const supportingCompanySnapshot = await getDocs(q);
        
        if (!supportingCompanySnapshot.empty) {
          const supportingCompanyRef = doc(db, 'supportingCompanies', supportingCompanySnapshot.docs[0].id);
          const supportingCompanyUpdateData: any = {
            name: updateData.name,
            description: updateData.description,
            email: updateData.email,
            phone: updateData.phoneNumber,
            url: updateData.website,
            address: updateData.address,
            imageUrl: updateData.imageUrl,
            facebook: updateData.facebook,
            instagram: updateData.instagram,
            twitter: updateData.twitter,
            linkedin: updateData.linkedin,
          };
          
          // Only include imageUrl if it was updated
          if (!updateData.imageUrl) {
            delete supportingCompanyUpdateData.imageUrl;
          }
          
          await updateDoc(supportingCompanyRef, supportingCompanyUpdateData);
        }
      } catch (error) {
        console.error('Error updating supporting company:', error);
        // Don't fail the whole update if supporting company update fails
      }
      router.back();
    } catch (error: any) {
      console.error('Error updating business:', error);
      setErrorMessage(error.message || 'Failed to update business');
      setShowError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header with Cancel and Save buttons */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
        >
          Cancel
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Edit Business
        </h2>
        <button
          onClick={updateBusiness}
          disabled={isSaving}
          className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
      </div>

      <form className="space-y-6 p-4" onSubmit={(e) => { e.preventDefault(); updateBusiness(); }}>
        {/* Business Image Section */}
        <section className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Business Image
          </h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelection}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full relative h-48 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Business preview"
                fill
                className="object-cover"
              />
            ) : business.imageUrl ? (
              <Image
                src={business.imageUrl}
                alt="Business image"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Change Image
                </p>
              </div>
            )}
          </button>
        </section>

        {/* Basic Information Section */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Basic Information
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Business Name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Street Address"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="ZIP Code"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
            />
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Contact Information
          </h3>
          <div className="space-y-3">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoCapitalize="none"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Website"
              autoCapitalize="none"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
        </section>

        {/* Social Media Section */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Social Media
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="Facebook Profile"
                autoCapitalize="none"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Instagram Profile"
                autoCapitalize="none"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="Twitter Profile"
                autoCapitalize="none"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="LinkedIn Profile"
                autoCapitalize="none"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>
        </section>

        {/* Business Hours Section */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Business Hours
          </h3>
          <div className="space-y-4">
            {[
              { day: 'Monday', key: 'monday' },
              { day: 'Tuesday', key: 'tuesday' },
              { day: 'Wednesday', key: 'wednesday' },
              { day: 'Thursday', key: 'thursday' },
              { day: 'Friday', key: 'friday' },
              { day: 'Saturday', key: 'saturday' },
              { day: 'Sunday', key: 'sunday' },
            ].map(({ day, key }) => (
              <DayHoursView
                key={key}
                dayName={day}
                openTime={hoursForm[`${key}Open` as keyof HoursForm] as string}
                closeTime={hoursForm[`${key}Close` as keyof HoursForm] as string}
                isClosed={hoursForm[`${key}Closed` as keyof HoursForm] as boolean}
                onOpenTimeChange={(value) =>
                  setHoursForm((prev) => ({ ...prev, [`${key}Open`]: value }))
                }
                onCloseTimeChange={(value) =>
                  setHoursForm((prev) => ({ ...prev, [`${key}Close`]: value }))
                }
                onIsClosedChange={(value) =>
                  setHoursForm((prev) => ({ ...prev, [`${key}Closed`]: value }))
                }
              />
            ))}
          </div>
        </section>
      </form>

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="text-gray-900 dark:text-gray-100">Saving...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {showError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Error
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {errorMessage || 'Unknown error occurred'}
              </p>
              <button
                onClick={() => setShowError(false)}
                className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

