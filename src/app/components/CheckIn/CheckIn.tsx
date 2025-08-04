'use client';

import React, { useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeResult } from 'html5-qrcode';
import { motion } from 'framer-motion';

const CheckIn = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const formVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        opacity: { duration: 0.3 },
        height: { duration: 0.4, ease: 'easeOut' },
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3, ease: 'easeIn' },
      },
    },
  };

  const startScanning = async () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode('reader');
    }
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    };

    const onScanSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
      console.log('QR Code result:', decodedResult);
      setResult(decodedText);
    };

    const onScanError = (error: string) => {
      console.error('QR Code scan error:', error);
    };

    try {
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        onScanSuccess,
        onScanError
      );
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

  return (
    <div>
      <motion.div
        className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="region"
        aria-labelledby="qr-scanner-title"
      >
        <h3 id="qr-scanner-title" className="text-lg font-medium mb-2">
          QR Code Scanner
        </h3>
        <div className="p-4 mb-4 rounded-lg">
          <div id="reader" className="w-64 h-64 bg-[rgb(160,140,29)] mx-auto rounded-lg"></div>
          <div className="mt-4 flex space-x-4 justify-center">
            <button
              onClick={startScanning}
              disabled={isScanning}
              className={`btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] mt-4 ${
                isScanning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Start QR code scanning"
            >
              Start Scanning
            </button>
            <button
              onClick={stopScanning}
              disabled={!isScanning}
              className={`btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] ${
                !isScanning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Stop QR code scanning"
            >
              Stop Scanning
            </button>
          </div>
          {result && (
            <div className="mt-4 p-4 bg-white rounded shadow">
              <p className="text-lg text-[#6A0DAD]">Scanned Result: {result}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CheckIn;