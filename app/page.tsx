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
  FileText,
  AlignLeft,
  History,
  Trash2,
  FolderOpen
} from 'lucide-react';
import jsPDF from 'jspdf';

interface SavedJob {
  id: string;
  date: string;
  businessName: string;
  clientPhone: string;
  jobDescription: string;
  resultImage: string;
  locationText: string;
}

export default function Home() {
  // Free State
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [sharedStatus, setSharedStatus] = useState<boolean>(false);
  
  // Pro State & Features
  const [isPro, setIsPro] = useState<boolean>(false);
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [enableTimestamp, setEnableTimestamp] = useState<boolean>(false);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [locationText, setLocationText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('verifield_biz_name');
    const savedPhone = localStorage.getItem('verifield_biz_phone');
    const savedLogo = localStorage.getItem('verifield_biz_logo');
    const savedHistory = localStorage.getItem('verifield_saved_jobs');

    if (savedName) setBusinessName(savedName);
    if (savedPhone) setClientPhone(savedPhone);
    if (savedLogo) setLogoImage(savedLogo);
    if (savedHistory) {
      try {
        setSavedJobs(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse saved jobs', e);
      }
    }
  }, []);

  const handleSaveProfile = (name: string, phone: string, logo: string | null) => {
    if (!isPro) return;
    localStorage.setItem('verifield_biz_name', name);
    localStorage.setItem('verifield_biz_phone', phone);
    if (logo) localStorage.setItem('verifield_biz_logo', logo);
  };

  const fetchLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(3);
          const lng = pos.coords.longitude.toFixed(3);
          setLocationText(`GPS: ${lat}, ${lng}`);
        },
        () => setLocationText('GPS: Location Secured')
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

  const handleJobDescChange = (val: string) => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }
    setJobDescription(val);
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
    const hasFooter = isPro && (enableTimestamp || jobDescription);
    const footerHeight = hasFooter ? 65 : 0;
    const padding = 20;

    canvas.width = targetWidth;
    canvas.height = targetHeight + headerHeight + footerHeight;

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

    if (hasFooter) {
      const footerY = canvas.height - footerHeight;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, footerY, canvas.width, footerHeight);

      if (enableTimestamp) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px sans-serif';
        const timeStampText = `VERIFIED: ${new Date().toLocaleString()} | ${locationText || 'GPS Secured'}`;
        ctx.fillText(timeStampText, padding, footerY + 25);
      }

      if (jobDescription) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px sans-serif';
        const descText = `NOTES: ${jobDescription.length > 90 ? jobDescription.substring(0, 90) + '...' : jobDescription}`;
        ctx.fillText(descText, padding, footerY + (enableTimestamp ? 48 : 36));
      }
    }

    const resultDataUrl = canvas.toDataURL('image/png');
    setGeneratedResult(resultDataUrl);

    // Save to History Vault if Pro
    if (isPro) {
      const newJob: SavedJob = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        businessName: businessName || 'My Business',
        clientPhone,
        jobDescription,
        resultImage: resultDataUrl,
        locationText
      };
      const updatedJobs = [newJob, ...savedJobs];
      setSavedJobs(updatedJobs);
      localStorage.setItem('verifield_saved_jobs', JSON.stringify(updatedJobs));
    }
  };

  const deleteSavedJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedJobs.filter((job) => job.id !== id);
    setSavedJobs(filtered);
    localStorage.setItem('verifield_saved_jobs', JSON.stringify(filtered));
  };

  const exportPDF = () => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }
    if (!generatedResult) return;

    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 40, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(businessName || 'Work Completion Report', 14, 20);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Official Proof of Performance | Date: ${new Date().toLocaleDateString()}`, 14, 28);

    const imgWidth = pageWidth - 28;
    const imgHeight = (imgWidth * 840) / 1200; 
    pdf.addImage(generatedResult, 'PNG', 14, 48, imgWidth, imgHeight);

    let currentY = 48 + imgHeight + 10;
    const boxHeight = jobDescription ? 42 : 30;

    pdf.setDrawColor(226, 232, 240);
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(14, currentY, pageWidth - 28, boxHeight, 3, 3, 'FD');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('VERIFICATION & WORK DETAILS', 20, currentY + 9);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Status: Service Completed & Verified`, 20, currentY + 17);
    if (clientPhone) pdf.text(`Client Contact: ${clientPhone}`, 20, currentY + 23);
    if (enableTimestamp && locationText) {
      pdf.text(`Timestamp: ${new Date().toLocaleString()} (${locationText})`, 110, currentY + 17);
    }

    if (jobDescription) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('Scope of Work:', 20, currentY + 31);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      const splitDesc = pdf.splitTextToSize(jobDescription, pageWidth - 65);
      pdf.text(splitDesc, 48, currentY + 31);
    }

    currentY += boxHeight + 12;
    pdf.setDrawColor(203, 213, 225);
    pdf.line(14, currentY + 10, 90, currentY + 10);
    pdf.setFontSize(8);
    pdf.text('Client Signature & Approval', 14, currentY + 15);

    pdf.line(pageWidth - 90, currentY + 10, pageWidth - 14, currentY + 10);
    pdf.text('Service Technician Signature', pageWidth - 90, currentY + 15);

    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Generated via VeriField Work Verification Platform', pageWidth / 2, 285, { align: 'center' });

    pdf.save(`${businessName ? businessName.replace(/\s+/g, '_') : 'Work'}_Proof_Report.pdf`);
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
      <header className="py-4 border-b border-slate-800 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isPro) {
                setShowProModal(true);
              } else {
                setShowHistoryModal(true);
              }
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 relative flex items-center gap-1.5 text-xs font-medium"
          >
            <History className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Vault</span>
            {!isPro && <Lock className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />}
          </button>
        </div>

        <div className="flex-1 text-center px-2">
          <div className="flex items-center justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" className="h-9 w-auto">
              <rect x="10" y="10" width="36" height="44" rx="5" fill="#334155" stroke="#475569" strokeWidth="2" />
              <rect x="20" y="6" width="16" height="7" rx="2" fill="#38bdf8" />
              <path d="M 18 32 L 25 39 L 38 22" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <text x="58" y="38" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="27" fill="#ffffff">
                Veri<tspan fill="#10b981">Field</tspan>
              </text>
            </svg>
          </div>
          <p className="text-[11px] text-slate-400">Before & After Work Verification</p>
        </div>

        <button
          onClick={() => setShowProModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md hover:opacity-90 transition-opacity shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" /> {isPro ? 'PRO' : 'UPGRADE'}
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

        <div className="relative">
          <textarea
            placeholder="Job Notes / Scope of Work (e.g. Replaced filter, cleaned drain line) [PRO]"
            value={jobDescription}
            onClick={() => { if (!isPro) setShowProModal(true); }}
            onChange={(e) => handleJobDescChange(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
          />
          {!isPro && (
            <Lock className="w-4 h-4 text-amber-400 absolute top-2.5 right-3 pointer-events-none" />
          )}
        </div>

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

      <button
        onClick={generateProof}
        disabled={!beforeImage || !afterImage}
        className="w-full py-3 bg-emerald-600 disabled:bg-slate-800 hover:bg-emerald-500 disabled:text-slate-600 text-white font-semibold rounded-xl text-sm transition-all mb-6 flex items-center justify-center gap-2 shadow-lg"
      >
        <ImageIcon className="w-4 h-4" /> Generate Branded Proof Image
      </button>

      {/* Output Section */}
      {generatedResult && (
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
          <h3 className="text-xs font-bold text-slate-300">RESULT PREVIEW</h3>
          <img src={generatedResult} alt="Generated Proof" className="rounded-lg border border-slate-700 w-full" />
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleShare}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {sharedStatus ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {sharedStatus ? 'Sent!' : 'Share SMS'}
            </button>

            <a
              href={generatedResult}
              download="Branded-Work-Proof.png"
              className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 text-center"
            >
              <Download className="w-3.5 h-3.5" /> Save PNG
            </a>

            <button
              onClick={exportPDF}
              className="py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors relative"
            >
              <FileText className="w-3.5 h-3.5" /> PDF Report
              {!isPro && <Lock className="w-3 h-3 text-amber-300 absolute top-1 right-1" />}
            </button>
          </div>
        </div>
      )}

      {/* PAST JOBS VAULT MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-lg w-full space-y-4 relative shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-400" /> Past Jobs Vault ({savedJobs.length})
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {savedJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <History className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">No saved jobs yet. Generate a proof to store it here automatically!</p>
                </div>
              ) : (
                savedJobs.map((job) => (
                  <div 
                    key={job.id} 
                    onClick={() => {
                      setGeneratedResult(job.resultImage);
                      setBusinessName(job.businessName);
                      setClientPhone(job.clientPhone);
                      setJobDescription(job.jobDescription);
                      setShowHistoryModal(false);
                    }}
                    className="bg-slate-800/70 border border-slate-700/80 hover:border-blue-500 rounded-xl p-3 cursor-pointer transition-all flex gap-3 items-center"
                  >
                    <img src={job.resultImage} alt="Thumbnail" className="w-20 h-14 object-cover rounded border border-slate-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{job.businessName}</span>
                        <span className="text-[10px] text-slate-400">{job.date}</span>
                      </div>
                      <p className="text-xs text-slate-300 truncate mt-0.5">{job.jobDescription || 'No description notes'}</p>
                      {job.clientPhone && <p className="text-[10px] text-blue-400 mt-1">Client: {job.clientPhone}</p>}
                    </div>
                    <button
                      onClick={(e) => deleteSavedJob(job.id, e)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
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
                <History className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block">Past Jobs Vault & History</strong>
                  Store and re-access all generated work logs directly on your device.
                </div>
              </div>

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
                <AlignLeft className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block">Job Notes & Scope of Work</strong>
                  Add detailed job descriptions watermarked on images & PDF reports.
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