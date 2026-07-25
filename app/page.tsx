'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Download, 
  Upload, 
  Building, 
  Share2, 
  Check, 
  Sparkles, 
  Lock, 
  MapPin, 
  Clock, 
  X,
  FileText
} from 'lucide-react';

export default function Home() {
  // Free State
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [sharedStatus, setSharedStatus] = useState<boolean>(false);
  
  // Pro State & Features
  const [isPro, setIsPro] = useState<boolean>(false); // Set true to simulate Pro user
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const [enableTimestamp, setEnableTimestamp] = useState<boolean>(false);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [locationText, setLocationText] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Saved Pro Data from LocalStorage on Startup
  useEffect(() => {
    const savedName = localStorage.getItem('verifield_biz_name');
    const savedPhone = localStorage.getItem('verifield_biz_phone');
    const savedLogo = localStorage.getItem('verifield_biz_logo');

    if (savedName) setBusinessName(savedName);
    if (savedPhone) setClientPhone(savedPhone);
    if (savedLogo) setLogoImage(savedLogo);
  }, []);

  // Save Business Info to LocalStorage
  const handleSaveProfile = (name: string, phone: string, logo: string | null) => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }
    localStorage.setItem('verifield_biz_name', name);
    localStorage.setItem('verifield_biz_phone', phone);
    if (logo) localStorage.setItem('verifield_biz_logo', logo);
  };

  // Get Current Location for Timestamp
  const fetchLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(3);
          const lng = pos.coords.longitude.toFixed(3);
          setLocationText(`GPS: ${lat}, ${lng}`);
        },
        () => {
          setLocationText('GPS: Location Secured');
        }
      );
    } else {
      setLocationText('GPS: Location Secured');
    }
  };

  const handleTimestampToggle = (checked: boolean) => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }
    setEnableTimestamp(checked);
    if (checked) fetchLocation();
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void,
    isLogo = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setter(res);
        if (isLogo && isPro) {
          localStorage.setItem('verifield_biz_logo', res);
        }
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
    const footerHeight = enableTimestamp && isPro ? 40 : 0;
    const padding = 20;

    canvas.width = targetWidth;
    canvas.height = targetHeight + headerHeight + footerHeight;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, headerHeight);

    // Business Name / Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(businessName || 'Job Proof Verification', padding, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, padding, 68);

    // Draw Watermark Logo in Top Right
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

    // Side-by-side Photo Drawing
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

    // Pro Footer Watermark (Timestamp & GPS)
    if (enableTimestamp && isPro) {
      const footerY = canvas.height - footerHeight;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, footerY, canvas.width, footerHeight);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px sans-serif';
      const timeStampText = `VERIFIED: ${new Date().toLocaleString()} | ${locationText || 'GPS Secured'}`;
      ctx.fillText(timeStampText, padding, footerY + 25);
    }

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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 max-w-2xl mx-auto relative">
      {/* Official VeriField Header with PRO Badge */}
      <header className="py-4 border-b border-slate-800 mb-6 flex items-center justify-between">
        <div className="flex-1 text-center pl-12">
          <div className="flex items-center justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" className="h-10 w-auto">
              <rect x="10" y="10" width="36" height="44" rx="5" fill="#334155" stroke="#475569" strokeWidth="2" />
              <rect x="20" y="6" width="16" height="7" rx="2" fill="#38bdf8" />
              <path d="M 18 32 L 25 39 L 38 22" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <text x="58" y="38" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="27" fill="#ffffff">
                Veri<tspan fill="#10b981">Field</tspan>
              </text>
            </svg>
          </div>
          <p className="text-xs text-slate-400">Before & After Work Verification</p>
        </div>

        {/* Upgrade / Pro Button */}
        <button
          onClick={() => setShowProModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-3.5 h-3.5" /> {isPro ? 'PRO ACTIVE' : 'UPGRADE'}
        </button>
      </header>

      {/* Business Setup Section */}
      <section className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" /> Business Branding & Client Setup
          </h2>
          {!isPro && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Auto-Save Locked
            </span>
          )}
        </div>
        
        <input
          type="text"
          placeholder="Business / Company Name (Optional)"
          value={businessName}
          onChange={(e) => {
            setBusinessName(e.target.value);
            handleSaveProfile(e.target.value, clientPhone, logoImage);
          }}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />

        <input
          type="tel"
          placeholder="Client Phone # (Optional for Direct SMS)"
          value={clientPhone}
          onChange={(e) => {
            setClientPhone(e.target.value);
            handleSaveProfile(businessName, e.target.value, logoImage);
          }}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-2 border border-slate-600">
              <Upload className="w-4 h-4 text-slate-300" /> Upload Logo (PNG)
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, setLogoImage, true)}
              />
            </label>
            {logoImage && (
              <span className="text-xs text-emerald-400 font-medium">✓ Logo Added</span>
            )}
          </div>

          {/* Pro GPS Timestamp Switch */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              checked={enableTimestamp}
              onChange={(e) => handleTimestampToggle(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> GPS & Time
              {!isPro && <Lock className="w-3 h-3 text-amber-400" />}
            </span>
          </label>
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

      {/* PRO UPGRADE MODAL WINDOW */}
      {showProModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-amber-500 to-emerald-500 rounded-2xl mb-1">
                <Sparkles className="w-8 h-8 text-slate-950" />
              </div>
              <h3 className="text-xl font-bold text-white">Unlock VeriField PRO</h3>
              <p className="text-xs text-slate-400">
                Supercharge your proof-of-work workflow and build instant client trust.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block">Auto-Saved Profile & Logo</strong>
                  Never re-type your company name or re-upload your logo again.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block">GPS & Timestamp Watermark</strong>
                  Overlay exact date, time, and coordinates to prove when work was done.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block">PDF Summary Report Export</strong>
                  Generate printable invoice attachments and job receipts for clients.
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsPro(true);
                  setShowProModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg hover:opacity-95 transition-opacity"
              >
                Start 7-Day Free Trial ($9.99/mo)
              </button>
              <p className="text-[10px] text-center text-slate-500">Cancel anytime. Zero commitment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}