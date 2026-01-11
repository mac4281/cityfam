'use client';

import { useState, useEffect, useRef } from 'react';

interface QRCodeScannerViewProps {
  onScan: (code: string) => void;
  onError: (error: string) => void;
  showSuccessAnimation: boolean;
}

export default function QRCodeScannerView({
  onScan,
  onError,
  showSuccessAnimation,
}: QRCodeScannerViewProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Request camera permission
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        setHasPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
        setHasPermission(false);
        onError('Camera access denied. Please enable camera permissions.');
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Note: For actual QR code scanning, you would need to install a library like:
  // npm install html5-qrcode
  // This is a placeholder implementation

  if (hasPermission === false) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Camera access is required to scan QR codes.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Please enable camera permissions in your browser settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {showSuccessAnimation && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-semibold">
              ✓ Check-in Successful!
            </div>
          </div>
        )}
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-white rounded-lg" />
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Point your camera at a QR code to check in
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
          Note: QR code scanning requires html5-qrcode library to be installed
        </p>
      </div>
    </div>
  );
}

