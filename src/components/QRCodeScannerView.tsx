'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import ScannerOverlayView from './ScannerOverlayView';
import { AppUser } from '@/types/user';

interface QRCodeScannerViewProps {
  onScan: (code: string) => void;
  onError: (error: string) => void;
  showSuccessAnimation: boolean;
  recentCheckedInAttendees?: AppUser[];
}

export default function QRCodeScannerView({
  onScan,
  onError,
  showSuccessAnimation,
  recentCheckedInAttendees = [],
}: QRCodeScannerViewProps) {
  const [isScanning, setIsScanning] = useState(false);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerIdRef = useRef(`qr-reader-${Math.random().toString(36).substr(2, 9)}`);
  const lastScannedCode = useRef<string | null>(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onScanRef.current = onScan;
    onErrorRef.current = onError;
  }, [onScan, onError]);

  useEffect(() => {
    const startScanning = async () => {
      if (!scannerContainerRef.current || qrCodeRef.current) return;

      if (!scannerContainerRef.current) return;

      try {
        const html5QrCode = new Html5Qrcode(scannerIdRef.current);
        qrCodeRef.current = html5QrCode;

        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          // Try to use rear camera first, fallback to first available
          const rearCamera = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
          const cameraId = rearCamera?.id || devices[0].id;

          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              // Prevent duplicate scans of the same code
              if (lastScannedCode.current === decodedText) {
                return;
              }
              lastScannedCode.current = decodedText;

              // QR code scanned successfully
              console.log('QR Code scanned:', decodedText);
              onScanRef.current(decodedText);

              // Reset after 2 seconds to allow scanning the same code again if needed
              setTimeout(() => {
                lastScannedCode.current = null;
              }, 2000);
            },
            (errorMessage) => {
              // Scan error - ignore common "not found" errors
              if (
                !errorMessage.includes('No QR code found') &&
                !errorMessage.includes('NotFoundException') &&
                !errorMessage.includes('QR code parse error')
              ) {
                console.debug('QR scan error:', errorMessage);
              }
            }
          );

          setIsScanning(true);
        } else {
          onErrorRef.current('No camera found. Please connect a camera and try again.');
        }
      } catch (error: any) {
        console.error('Error starting QR scanner:', error);
        let errorMessage = 'Failed to start camera. Please check permissions.';
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please enable camera permissions in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        }
        onErrorRef.current(errorMessage);
      }
    };

    startScanning();

    return () => {
      if (qrCodeRef.current && isScanning) {
        qrCodeRef.current
          .stop()
          .then(() => {
            qrCodeRef.current?.clear();
            qrCodeRef.current = null;
            setIsScanning(false);
          })
          .catch((err) => {
            console.error('Error stopping QR scanner:', err);
            qrCodeRef.current = null;
            setIsScanning(false);
          });
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex-1 relative overflow-hidden">
        {/* QR Code Scanner Container */}
        <div
          ref={scannerContainerRef}
          id={scannerIdRef.current}
          className="w-full h-full"
        />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Starting camera...</p>
            </div>
          </div>
        )}
        {/* Scanner Overlay with success animation and recent check-ins */}
        <ScannerOverlayView
          showSuccessAnimation={showSuccessAnimation}
          recentCheckedInAttendees={recentCheckedInAttendees}
        />
      </div>
      <div className="p-4 bg-white dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Point your camera at a QR code to check in
        </p>
      </div>
    </div>
  );
}

