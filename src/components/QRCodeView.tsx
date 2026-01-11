'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeViewProps {
  userId: string;
  eventTitle: string;
}

export default function QRCodeView({ userId, eventTitle }: QRCodeViewProps) {
  return (
    <div className="flex flex-col items-center gap-5 p-4">
      {/* QR Code */}
      <div className="w-[300px] h-[300px] flex items-center justify-center bg-white p-4 rounded-lg">
        <QRCodeSVG
          value={userId}
          size={300}
          level="H"
          includeMargin={false}
          className="w-full h-full"
        />
      </div>

      {/* Event Title */}
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
        Check-in code for {eventTitle}
      </p>

      {/* User ID */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {userId}
      </p>
    </div>
  );
}

