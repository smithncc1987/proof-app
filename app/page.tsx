'use client';

import React, { useState, useRef } from 'react';

export default function Home() {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('My Service Co.');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle uploading or capturing an image via device camera
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Merge images into a single side-by-side photo report
  const generateCombinedImage = () => {
    if (!beforeImage || !afterImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img1 = new Image();
    const img2 = new Image();

    img1.src = beforeImage;
    img1.onload = () => {
      img2.src = afterImage;
      img2.onload = () => {
        // Standardize output canvas size (1200x650)
        const width = 1200;
        const height = 650;
        const halfWidth = width / 2;
        const imageHeight = 600;

        canvas.width = width;
        canvas.height = height;

        // Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Header Text / Business Branding
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(companyName.toUpperCase(), 30, 35);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(new Date().toLocaleDateString(), width - 150, 35);

        // Draw Before & After Photos
        ctx.drawImage(img1, 0, 50, halfWidth, imageHeight);
        ctx.drawImage(img2, halfWidth, 50, halfWidth, imageHeight);

        // Draw Center Divider Line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(halfWidth, 50);
        ctx.lineTo(halfWidth, height);
        ctx.stroke();

        // Overlay Labels
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(20, 70, 140, 40);
        ctx.fillRect(halfWidth + 20, 70, 140, 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('BEFORE', 50, 96);
        ctx.fillText('AFTER', halfWidth + 55, 96);
      };
    };
  };

  // Download compiled image
  const downloadReport = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `proof-report-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 max-w-md mx-auto">
      <header className="py-4 border-b border-slate-800 mb-6 text-center">
        <h1 className="text-2xl font-bold text-blue-500">VeriField</h1>
        <p className="text-xs text-slate-400">Before & After Work Verification</p>
      </header>

      <div className="space-y-4">
        {/* Business Name Input */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Company Branding Label</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Before Photo Input */}
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-800/50">
          <p className="font-semibold text-sm mb-2">1. Before Photo</p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleImageUpload(e, setBeforeImage)}
            className="hidden"
            id="before-upload"
          />
          <label
            htmlFor="before-upload"
            className="inline-block bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            {beforeImage ? '✓ Photo Selected (Tap to Change)' : '📷 Snap / Upload Before'}
          </label>
        </div>

        {/* After Photo Input */}
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-800/50">
          <p className="font-semibold text-sm mb-2">2. After Photo</p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleImageUpload(e, setAfterImage)}
            className="hidden"
            id="after-upload"
          />
          <label
            htmlFor="after-upload"
            className="inline-block bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            {afterImage ? '✓ Photo Selected (Tap to Change)' : '📷 Snap / Upload After'}
          </label>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateCombinedImage}
          disabled={!beforeImage || !afterImage}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 py-3 rounded-xl font-bold text-sm transition"
        >
          Generate Side-by-Side Proof
        </button>

        {/* Canvas Display */}
        <div className="mt-6 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-lg border border-slate-800 bg-slate-950 min-h-[150px]"
          />
          
          <button
            onClick={downloadReport}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold text-sm transition"
          >
            ⬇ Download Proof Image
          </button>
        </div>
      </div>
    </main>
  );
}