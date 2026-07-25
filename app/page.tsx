'use client';

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Download, Upload, Building, Share2, Check } from 'lucide-react';

export default function Home() {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [sharedStatus, setSharedStatus] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to draw full images without cropping or stretching (contain fit)
  const drawContainImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    ctx.fillStyle = '#020617';
    ctx.fillRect(x, y, w, h);

    const imgAspect = img.width / img.height;
    const boxAspect = w / h;
    let renderW, renderH, offsetX, offsetY;

    if (imgAspect > boxAspect) {
      renderW = w;
      renderH = w / imgAspect;
      offsetX = x;
      offsetY = y + (h - renderH) / 2;
    } else {
      renderW = h * imgAspect;
      renderH = h;
      offsetX = x + (w - renderW) / 2;
      offsetY = y;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  };

  const generateProof = async () => {
    if (!beforeImage || !afterImage) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgBefore = new Image();
    const imgAfter = new Image();
    const imgLogo = logoImage ? new Image() : null;

    imgBefore.src = beforeImage;
    imgAfter.src = afterImage;
    if (imgLogo) imgLogo.src = logoImage!;

    await Promise.all([
      new Promise((resolve) => (imgBefore.onload = resolve)),
      new Promise((resolve) => (imgAfter.onload = resolve)),
      imgLogo ? new Promise((resolve) => (imgLogo.onload = resolve)) : Promise.resolve(),
    ]);

    const targetWidth = 1200;
    const targetHeight = 800;
    const headerHeight = 90;
    const padding = 20;

    canvas.width = targetWidth;
    canvas.height = targetHeight + headerHeight;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, headerHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(businessName || 'Job Proof Verification', padding, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, padding, 68);

    if (imgLogo) {
      const logoMaxHeight = 60;
      const logoAspect = imgLogo.width / imgLogo.height;
      const logoWidth = logoMaxHeight * logoAspect;
      ctx.drawImage(
        imgLogo,
        canvas.width - logoWidth - padding,
        (headerHeight - logoMaxHeight) / 2,
        logoWidth,
        logoMaxHeight
      );
    }

    const imgW = (targetWidth - padding * 3) / 2;
    const imgH = targetHeight - padding * 2;
    const topOffset = headerHeight + padding;

    drawContainImage(ctx, imgBefore, padding, topOffset, imgW, imgH);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.fillRect(padding + 10, topOffset + 10, 100, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('BEFORE', padding + 25, topOffset + 34);

    const afterX = padding * 2 + imgW;
    drawContainImage(ctx, imgAfter, afterX, topOffset, imgW, imgH);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
    ctx.fillRect(afterX + 10, topOffset + 10, 100, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('AFTER', afterX + 30, topOffset + 34);

    setGeneratedResult(canvas.toDataURL('image/png'));
  };

  const handleShare = async () => {
    if (!generatedResult) return;

    try {
      const response = await fetch(generatedResult);
      const blob = await response.blob();
      const file = new File([blob], 'Work-Proof-Verification.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Work Verification Proof',
          text: `Here is the before & after work verification proof from ${businessName || 'our team'}!`,
          files: [file],
        });
        setSharedStatus(true);
        setTimeout(() => setSharedStatus(false), 3000);
      } else if (clientPhone) {
        const smsMsg = encodeURIComponent(`Here is your work proof image from ${businessName || 'our team'}!`);
        window.open(`sms:${clientPhone}?body=${smsMsg}`, '_self');
      } else {
        alert('Web Share is not supported on this browser. You can use the Download button to save and send manually.');
      }
    } catch (err) {
      console.error('Error sharing image:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 max-w-2xl mx-auto">
      {/* Official VeriField Header with Inline SVG Branding */}
      <header className="py-4 border-b border-slate-800 mb-6 text-center">
        <div className="flex items-center justify-center mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" className="h-10 w-auto">
            {/* Clipboard Body */}
            <rect x="10" y="10" width="36" height="44" rx="5" fill="#334155" stroke="#475569" strokeWidth="2" />
            {/* Clipboard Top Clip */}
            <rect x="20" y="6" width="16" height="7" rx="2" fill="#38bdf8" />
            {/* Bold Verification Check */}
            <path d="M 18 32 L 25 39 L 38 22" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {/* VeriField Typography */}
            <text x="58" y="38" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="27" fill="#ffffff">
              Veri<tspan fill="#10b981">Field</tspan>
            </text>
          </svg>
        </div>
        <p className="text-xs text-slate-400">Before & After Work Verification</p>
      </header>

      {/* Branding & Client Contact Section */}
      <section className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 mb-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" /> Business Branding & Client Setup
        </h2>
        
        <input
          type="text"
          placeholder="Business / Company Name (Optional)"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />

        <input
          type="tel"
          placeholder="Client Phone # (Optional for Direct SMS)"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />

        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-2 border border-slate-600">
            <Upload className="w-4 h-4 text-slate-300" /> Upload Logo (PNG)
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, setLogoImage)}
            />
          </label>
          {logoImage && (
            <span className="text-xs text-emerald-400 font-medium">✓ Logo Added</span>
          )}
        </div>
      </section>

      {/* Photo Upload Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Before */}
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-center">
          <p className="text-xs font-semibold text-slate-400 mb-2">BEFORE PHOTO</p>
          {beforeImage ? (
            <img src={beforeImage} alt="Before" className="h-32 w-full object-cover rounded-lg mb-2" />
          ) : (
            <div className="h-32 bg-slate-900/80 rounded-lg border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 mb-2">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-xs">No image</span>
            </div>
          )}
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-1 w-full">
            <Upload className="w-3.5 h-3.5" /> Upload Before
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setBeforeImage)} />
          </label>
        </div>

        {/* After */}
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-center">
          <p className="text-xs font-semibold text-slate-400 mb-2">AFTER PHOTO</p>
          {afterImage ? (
            <img src={afterImage} alt="After" className="h-32 w-full object-cover rounded-lg mb-2" />
          ) : (
            <div className="h-32 bg-slate-900/80 rounded-lg border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 mb-2">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-xs">No image</span>
            </div>
          )}
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-1 w-full">
            <Upload className="w-3.5 h-3.5" /> Upload After
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setAfterImage)} />
          </label>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={generateProof}
        disabled={!beforeImage || !afterImage}
        className="w-full py-3 bg-emerald-600 disabled:bg-slate-800 hover:bg-emerald-500 disabled:text-slate-600 text-white font-semibold rounded-xl text-sm transition-all mb-6 flex items-center justify-center gap-2 shadow-lg"
      >
        <ImageIcon className="w-4 h-4" /> Generate Branded Proof Image
      </button>

      {/* Output Preview */}
      {generatedResult && (
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
          <h3 className="text-xs font-bold text-slate-300">RESULT PREVIEW</h3>
          <img src={generatedResult} alt="Generated Proof" className="rounded-lg border border-slate-700 w-full" />
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {sharedStatus ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {sharedStatus ? 'Sent!' : 'Share to Client SMS/Email'}
            </button>

            <a
              href={generatedResult}
              download="Branded-Work-Proof.png"
              className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-2 text-center"
            >
              <Download className="w-4 h-4" /> Download Image
            </a>
          </div>
        </div>
      )}
    </div>
  );
}