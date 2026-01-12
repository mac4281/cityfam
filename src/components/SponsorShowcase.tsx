'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSponsorCompany } from '@/hooks/useSponsorCompany';

export default function SponsorShowcase() {
  const { sponsorCompany, isLoading, incrementViews } = useSponsorCompany();

  useEffect(() => {
    if (sponsorCompany) {
      incrementViews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sponsorCompany?.id]);

  if (isLoading || !sponsorCompany) {
    return null;
  }

  const businessDetailUrl = sponsorCompany.businessId ? `/businesses/${sponsorCompany.businessId}` : '#';

  return (
    <Link
      href={businessDetailUrl}
      className="w-full py-4 border-t border-b border-gray-200 dark:border-gray-800 block hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
    >
      <div className="flex items-center justify-center gap-4">
        {sponsorCompany.imageUrl && (
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={sponsorCompany.imageUrl}
              alt={sponsorCompany.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
        <p className="text-xs md:text-base text-gray-700 dark:text-gray-300 text-left flex-1">
          <span className="font-semibold">{sponsorCompany.name}</span>
          {' '}is a proud sponsor of CityFam.
          <br />
          Support them as they help keep CityFam free for everyone.
        </p>
        <span className="text-blue-600 dark:text-blue-400 hover:underline text-sm md:text-base flex-shrink-0 font-medium">
          Learn More
        </span>
      </div>
    </Link>
  );
}

