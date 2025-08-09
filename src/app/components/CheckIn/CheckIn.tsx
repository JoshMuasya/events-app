'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeResult } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { RsvpDetails } from '@/lib/types';

const CheckIn = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [rsvpDetails, setRsvpDetails] = useState<RsvpDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedInCount, setCheckedInCount] = useState<number | ''>('');

  const startScanning = async () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode('reader');
    }
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    const onScanSuccess = async (decodedText: string) => {
      await stopScanning();           // stop scanning immediately on success
      setResult(decodedText);
      setCheckedInCount('');           // reset input for new scan
      setError(null);
    };

    const onScanError = (err: string) => console.warn('QR Scan error:', err);

    try {
      await html5QrCodeRef.current.start({ facingMode: 'environment' }, config, onScanSuccess, onScanError);
      setIsScanning(true);
    } catch (err) {
      console.error('Failed to start QR scanner:', err);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop QR scanner:', err);
      }
    }
  };

  const fetchRsvpDetails = async (qrCode: string) => {
    setLoading(true);
    try {
      setError(null);
      const response = await fetch('/api/checkin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentNumber: qrCode }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Normalize createdAt to string if timestamp
        const rsvp = data.rsvp;
        setRsvpDetails({
          ...rsvp,
          createdAt: rsvp.createdAt?.seconds
            ? new Date(rsvp.createdAt.seconds * 1000).toLocaleString()
            : rsvp.createdAt,
        });
      } else {
        setError(data.error || 'No RSVP found for this QR code');
        setRsvpDetails(null);
      }
    } catch {
      setError('Failed to fetch RSVP details');
      setRsvpDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch RSVP when result changes
  useEffect(() => {
    if (result) {
      fetchRsvpDetails(result);
    }
  }, [result]);

  // Handle recording check-in count to Firebase
  const recordCheckIn = async () => {
    if (!rsvpDetails) return;
    if (checkedInCount === '' || checkedInCount <= 0) {
      setError('Please enter a valid number of guests checking in.');
      return;
    }
    if (checkedInCount > Number(rsvpDetails.numberofAttendees)) {
      setError(`Cannot check in more than ${rsvpDetails.numberofAttendees} guests.`);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentNumber: result,
          checkedInCount,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to record check-in');

      alert(`Successfully checked in ${checkedInCount} guests for ${rsvpDetails.fullName}`);

      // Reset for next scan
      setResult(null);
      setRsvpDetails(null);
      setCheckedInCount('');
      setError(null);
      startScanning();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <motion.div
        className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
        variants={{
          hidden: { opacity: 0, height: 0 },
          visible: { opacity: 1, height: 'auto', transition: { opacity: { duration: 0.3 }, height: { duration: 0.4, ease: 'easeOut' } } },
          exit: { opacity: 0, height: 0, transition: { opacity: { duration: 0.2 }, height: { duration: 0.3, ease: 'easeIn' } } },
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="region"
        aria-labelledby="qr-scanner-title"
      >
        <h2 className="text-3xl font-bold text-center mb-4">Scan to Check In Guests</h2>
        <h3 id="qr-scanner-title" className="text-lg font-medium mb-2">QR Code Scanner</h3>
        <div className="p-4 mb-4 rounded-lg">
          <div id="reader" className="w-64 h-64 bg-[rgb(160,140,29)] mx-auto rounded-lg"></div>

          <div className="mt-4 flex space-x-4 justify-center">
            <button onClick={startScanning} disabled={isScanning} className={`btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}>Start Scanning</button>
            <button onClick={stopScanning} disabled={!isScanning} className={`btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] ${!isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}>Stop Scanning</button>
          </div>

          {result && (
            <>
              <p className="mt-4 font-medium">Scanned QR Code: {result}</p>
              {loading && <p className="text-lg mt-2">Fetching RSVP details...</p>}
              {error && <p className="text-red-600 mt-2">{error}</p>}
              {rsvpDetails && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-lg font-medium">RSVP Details:</h4>
                  <p>Full Name: {rsvpDetails.fullName}</p>
                  <p>Email: {rsvpDetails.emailAddress}</p>
                  <p>Event ID: {rsvpDetails.eventId}</p>
                  <p>Number of Attendees (RSVPed): {rsvpDetails.numberofAttendees}</p>
                  <p>
                    Created At:{' '}
                    {typeof rsvpDetails.createdAt === 'string'
                      ? rsvpDetails.createdAt
                      : new Date(rsvpDetails.createdAt.seconds * 1000).toLocaleString()}
                  </p>
                  <p>Document Number: {rsvpDetails.documentNumber}</p>

                  <label htmlFor="checkinCount" className="block font-medium mt-4">
                    Number of Guests Checking In:
                  </label>
                  <input
                    id="checkinCount"
                    type="number"
                    min={1}
                    max={rsvpDetails.numberofAttendees}
                    value={checkedInCount}
                    onChange={(e) => setCheckedInCount(Number(e.target.value))}
                    className="border border-gray-400 rounded px-2 py-1 w-20"
                  />

                  <button
                    onClick={recordCheckIn}
                    disabled={loading || checkedInCount === '' || checkedInCount <= 0}
                    className="mt-3 btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                  >
                    {loading ? 'Recording...' : 'Record Check-In'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CheckIn;