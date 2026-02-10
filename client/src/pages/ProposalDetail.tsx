import { useState, useCallback, useRef, useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { 
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  Clock,
  Loader2,
  Upload,
  RefreshCw,
  Calculator,
  MoreVertical,
  FileDown,
  Presentation,
  ChevronDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LiveSlideGeneration } from "@/components/LiveSlideGeneration";

/**
 * Client-side PDF generation: renders each slide HTML in a hidden iframe,
 * captures with html2canvas, and assembles into a PDF with jsPDF.
 */
async function generatePdfClientSide(
  slideHtmlArray: string[],
  onProgress?: (step: string, percent: number) => void
): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  // Use 16:9 custom page size matching slide aspect ratio exactly
  // 1920:1080 = 16:9. In jsPDF, format array is [width, height] of the page.
  // For landscape 16:9, width=338.667mm, height=190.5mm
  const pageWidth = 338.667;
  const pageHeight = 190.5;
  const slideW = 1920;
  const slideH = 1080;

  const pdf = new jsPDF({
    orientation: 'l',
    unit: 'mm',
    format: [pageWidth, pageHeight], // [width, height] for landscape
  });

  // Create a full-size offscreen container (NOT an iframe) for reliable rendering
  // Iframes with left:-9999px don't always render at full width in all browsers
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: ${slideW}px;
    height: ${slideH}px;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    z-index: -9999;
  `;
  document.body.appendChild(wrapper);

  // Still use an iframe inside the wrapper for font isolation
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    width: ${slideW}px;
    height: ${slideH}px;
    border: none;
    display: block;
  `;
  wrapper.appendChild(iframe);

  try {
    for (let i = 0; i < slideHtmlArray.length; i++) {
      if (i > 0) pdf.addPage();

      const pct = Math.round(((i + 1) / slideHtmlArray.length) * 100);
      onProgress?.(`Rendering slide ${i + 1} of ${slideHtmlArray.length}...`, pct);

      // Rewrite CDN URLs to same-origin paths (fixes CORS for existing proposals with old URLs)
      // Replace ALL manuscdn CDN URLs with same-origin paths (fixes CORS for all proposals)
      let slideHtml = slideHtmlArray[i].replace(
        /https:\/\/files\.manuscdn\.com\/[^'"\)\s]+/g,
        (url: string) => {
          // Font files (any extension)
          if (url.match(/\.(ttf|otf|woff2?|eot)/i)) {
            if (/nextsphere|jmxTHIS|BoSrlwm|VKaRCb/i.test(url)) return '/fonts/NextSphere-ExtraBold.ttf';
            if (/generalsans|JAbOMT|KuYDlP|cDkISn|CbDNMz/i.test(url)) return '/fonts/GeneralSans-Regular.otf';
            if (/urbanist.*italic|CVAUXs|yTZAvA|SgyKyT|ekiXxR/i.test(url)) return '/fonts/Urbanist-SemiBoldItalic.ttf';
            if (/urbanist|gqxvhf|qDbgEG|KovhlD|OTIdJM/i.test(url)) return '/fonts/Urbanist-SemiBold.ttf';
            // Fallback: any unknown .otf is GeneralSans, any unknown .ttf is Urbanist
            if (url.endsWith('.otf')) return '/fonts/GeneralSans-Regular.otf';
            return '/fonts/Urbanist-SemiBold.ttf';
          }
          // Image files
          if (url.match(/\.(png|jpg|jpeg|webp|svg)/i)) {
            if (/efFUlW|cover-bg|ctEkQK/i.test(url)) return '/fonts/cover-bg.png';
            return '/fonts/LightningEnergy_Logo_Icon_Aqua.png';
          }
          return url;
        }
      );

      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) continue;

      // Write the full HTML document (includes @font-face, styles, etc.)
      const isFullDoc = slideHtml.includes('<!DOCTYPE html>') || slideHtml.includes('<html');
      iframeDoc.open();
      if (isFullDoc) {
        const overrides = `<style>html,body{width:${slideW}px!important;height:${slideH}px!important;overflow:hidden!important;margin:0!important;padding:0!important;}</style>`;
        iframeDoc.write(slideHtml.replace('</head>', overrides + '</head>'));
      } else {
        iframeDoc.write(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}html,body{width:${slideW}px!important;height:${slideH}px!important;overflow:hidden!important;background:#000;color:#fff;}</style></head><body>${slideHtml}</body></html>`);
      }
      iframeDoc.close();

      // Wait for fonts and images to load (increased for CDN fonts)
      await new Promise(r => setTimeout(r, 1500));

      // Capture the documentElement for full-width rendering
      const captureTarget = iframeDoc.documentElement;
      const canvas = await html2canvas(captureTarget, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        width: slideW,
        height: slideH,
        windowWidth: slideW,
        windowHeight: slideH,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(wrapper);
  }
}

/**
 * SlidePreview renders a single slide HTML inside a scaled container
 * that maintains 16:9 aspect ratio without scrollbars.
 */
function SlidePreview({ html, index, title }: { html: string; index: number; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    
    const doc = iframe.contentDocument;
    if (!doc) return;
    
    // The html from generateSlideHTML is a full document with <!DOCTYPE html>,
    // <head> containing @font-face declarations, and <body> with the slide content.
    // We inject additional overrides to ensure proper scaling and no scrollbars,
    // but we must preserve the original document structure for fonts to load.
    const isFullDocument = html.includes('<!DOCTYPE html>') || html.includes('<html');
    
    doc.open();
    if (isFullDocument) {
      // Insert our override styles just before </head> to ensure they take effect
      const overrideStyles = `
        <style>
          html, body { width: 1920px; height: 1080px; overflow: hidden; margin: 0; padding: 0; }
          ::-webkit-scrollbar { display: none; }
          body { -ms-overflow-style: none; scrollbar-width: none; }
        </style>
      `;
      const modifiedHtml = html.replace('</head>', overrideStyles + '</head>');
      doc.write(modifiedHtml);
    } else {
      // Fallback for raw HTML content without document wrapper
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: 1920px; height: 1080px; overflow: hidden; background: #000000; color: #ffffff; }
            ::-webkit-scrollbar { display: none; }
            body { -ms-overflow-style: none; scrollbar-width: none; }
          </style>
        </head>
        <body>${html}</body>
        </html>
      `);
    }
    doc.close();
  }, [html]);

  return (
    <div 
      ref={containerRef}
      className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden"
    >
      <div 
        className="w-full relative overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      >
        <iframe
          ref={iframeRef}
          className="border-0 origin-top-left"
          title={`Slide ${index + 1}: ${title}`}
          style={{ 
            width: '1920px',
            height: '1080px',
            transform: 'scale(var(--slide-scale, 0.3))',
            transformOrigin: 'top left',
            pointerEvents: 'none',
            display: 'block',
          }}
          sandbox="allow-same-origin"
        />
        {/* Overlay to calculate scale */}
        <ScaleCalculator containerRef={containerRef} />
      </div>
    </div>
  );
}

/**
 * ScaleCalculator observes the container width and sets a CSS variable
 * so the iframe scales correctly to fill the card.
 */
function ScaleCalculator({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const containerWidth = container.clientWidth;
      const scale = containerWidth / 1920;
      container.style.setProperty('--slide-scale', scale.toString());
      // Also set the height of the aspect ratio container
      const aspectContainer = container.querySelector('[style*="aspect-ratio"]') as HTMLElement;
      if (aspectContainer) {
        aspectContainer.style.height = `${1080 * scale}px`;
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef]);

  return null;
}

// Download PDF button - generates and downloads
function DownloadPDFButton({ proposalId, customerName, size = 'default' }: { proposalId: number; customerName: string; size?: 'default' | 'sm' }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const utils = trpc.useUtils();
  
  const handleDownload = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      setCurrentStep('Fetching slides...');
      setProgress(10);
      const slidesResult = await utils.proposals.getSlideHtml.fetch({ proposalId });
      
      if (!slidesResult?.slides || slidesResult.slides.length === 0) {
        throw new Error('No slides generated. Run calculations and generate slides first.');
      }
      
      setProgress(20);
      const slideHtmlArray = slidesResult.slides.map((s: any) => s.html);
      
      const pdfBlob = await generatePdfClientSide(slideHtmlArray, (step, pct) => {
        setCurrentStep(step);
        setProgress(20 + Math.round(pct * 0.7));
      });
      
      setProgress(90);
      setCurrentStep('Preparing download...');
      
      const fileName = `Bill_Analysis_${customerName.replace(/\s+/g, '_')}.pdf`;
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Upload to S3 for storage
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            resolve(base64data);
          };
          reader.readAsDataURL(pdfBlob);
        });
        
        await fetch('/api/upload-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfData: base64,
            fileName: `Bill_Analysis_${customerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
            proposalId: proposalId.toString(),
          }),
        });
      } catch {
        // Upload optional
      }
      
      setProgress(100);
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep('');
    }
  };
  
  return (
    <div className="space-y-2">
      <Button 
        onClick={handleDownload}
        disabled={isGenerating}
        className="bg-[#00EAD3] text-black hover:bg-[#00EAD3]/90 font-semibold"
        size={size}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {Math.round(progress)}%
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download
          </>
        )}
      </Button>
      {isGenerating && (
        <Progress value={progress} className="h-1.5" />
      )}
    </div>
  );
}

// Update & Publish - recalculates, regenerates, then downloads
function UpdateAndPublishButton({ proposalId, customerName, onComplete }: { proposalId: number; customerName: string; onComplete: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  
  const calculateMutation = trpc.proposals.calculate.useMutation();
  const generateProgressiveMutation = trpc.proposals.generateProgressive.useMutation();
  const utils = trpc.useUtils();
  
  const handleUpdateAndPublish = async () => {
    setIsProcessing(true);
    setProgress(0);
    try {
      setCurrentStep('Recalculating...');
      setProgress(10);
      await calculateMutation.mutateAsync({ proposalId });
      setProgress(20);
      
      setCurrentStep('Generating LLM slides...');
      setProgress(30);
      await generateProgressiveMutation.mutateAsync({ proposalId });
      setProgress(40);
      
      setCurrentStep('Fetching slide data...');
      setProgress(45);
      const slidesResult = await utils.proposals.getSlideHtml.fetch({ proposalId });
      
      if (!slidesResult?.slides || slidesResult.slides.length === 0) {
        throw new Error('No slides generated');
      }
      setProgress(50);
      
      setCurrentStep('Creating PDF...');
      const slideHtmlArray = slidesResult.slides.map((s: any) => s.html);
      
      const pdfBlob = await generatePdfClientSide(slideHtmlArray, (step, pct) => {
        setCurrentStep(step);
        setProgress(50 + Math.round(pct * 0.45));
      });
      
      setProgress(95);
      setCurrentStep('Uploading PDF...');
      const fileName = `Bill_Analysis_${customerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          resolve(base64data);
        };
        reader.readAsDataURL(pdfBlob);
      });
      
      const uploadResponse = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfData: base64,
          fileName,
          proposalId: proposalId.toString(),
        }),
      });
      
      // Always download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setProgress(100);
      toast.success('Proposal updated and PDF generated!');
      onComplete();
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
      setProgress(0);
    }
  };
  
  return (
    <div className="space-y-2">
      <Button 
        onClick={handleUpdateAndPublish}
        disabled={isProcessing}
        variant="outline"
        className="border-[#00EAD3]/30 text-[#00EAD3] hover:bg-[#00EAD3]/10 hover:border-[#00EAD3] font-semibold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {currentStep} ({progress}%)
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update & Publish
          </>
        )}
      </Button>
      {isProcessing && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-[#808285] text-center">{progress}% Complete</p>
        </div>
      )}
    </div>
  );
}


// Export dropdown with PDF, PPTX, and HTML PDF options
function ExportDropdown({ proposalId, customerName }: { proposalId: number; customerName: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  const exportPptxMutation = trpc.proposals.exportPptx.useMutation();
  const exportNativePdfMutation = trpc.proposals.exportNativePdf.useMutation();
  const generateSlideContentMutation = trpc.proposals.generateSlideContent.useMutation();
  const utils = trpc.useUtils();
  const [slideContentUrl, setSlideContentUrl] = useState<string | null>(null);
  
  const handleExportPptx = async () => {
    setIsExporting(true);
    setExportType('pptx');
    setProgress(10);
    setCurrentStep('Generating PowerPoint...');
    try {
      setProgress(30);
      const result = await exportPptxMutation.mutateAsync({ proposalId });
      setProgress(80);
      setCurrentStep('Downloading...');
      if (result.fileUrl) {
        const link = document.createElement('a');
        link.href = result.fileUrl;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setProgress(100);
      toast.success('PowerPoint exported successfully!');
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setProgress(0);
      setCurrentStep('');
    }
  };
  
  const handleExportNativePdf = async () => {
    setIsExporting(true);
    setExportType('pdf');
    setProgress(10);
    setCurrentStep('Fetching slides...');
    try {
      // Use the HTML-based slides (all 22 slides with narratives) for the PDF
      const slidesResult = await utils.proposals.getSlideHtml.fetch({ proposalId });
      if (!slidesResult?.slides || slidesResult.slides.length === 0) {
        throw new Error('No slides generated. Please generate the proposal first.');
      }
      setProgress(15);
      setCurrentStep(`Rendering ${slidesResult.slides.length} slides...`);
      const slideHtmlArray = slidesResult.slides.map((s: any) => s.html);
      const pdfBlob = await generatePdfClientSide(slideHtmlArray, (step, pct) => {
        setCurrentStep(step);
        setProgress(15 + Math.round(pct * 0.65));
      });
      setProgress(80);
      setCurrentStep('Uploading PDF...');

      // Upload to S3 for persistent URL
      const fileName = `proposal-${proposalId}-${customerName.replace(/\s+/g, '_')}-${Date.now()}.pdf`;
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(pdfBlob);
      });
      const uploadResponse = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfData: base64, fileName: `exports/${fileName}` }),
      });
      const uploadResult = await uploadResponse.json();

      setProgress(90);
      setCurrentStep('Downloading...');

      // Also trigger local download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bill_Analysis_${customerName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast.success('PDF exported successfully!');
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setProgress(0);
      setCurrentStep('');
    }
  };
  
  const handlePrepareSlides = async () => {
    setIsExporting(true);
    setExportType('slides');
    setProgress(10);
    setCurrentStep('Preparing slide content...');
    try {
      setProgress(30);
      setCurrentStep('Generating strategic analysis...');
      const result = await generateSlideContentMutation.mutateAsync({ proposalId });
      setProgress(70);
      setCurrentStep('Uploading content...');
      if (result.fileUrl) {
        setSlideContentUrl(result.fileUrl);
        // Also download the markdown file
        const link = document.createElement('a');
        link.href = result.fileUrl;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setProgress(100);
      toast.success(`Slide content prepared! ${result.slideCount} slides ready for Manus Slides rendering.`);
    } catch (error: any) {
      toast.error(`Preparation failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const handleExportHtmlPdf = async () => {
    setIsExporting(true);
    setExportType('html-pdf');
    setProgress(10);
    setCurrentStep('Fetching slides...');
    try {
      const slidesResult = await utils.proposals.getSlideHtml.fetch({ proposalId });
      if (!slidesResult?.slides || slidesResult.slides.length === 0) {
        throw new Error('No slides generated.');
      }
      setProgress(20);
      const slideHtmlArray = slidesResult.slides.map((s: any) => s.html);
      const pdfBlob = await generatePdfClientSide(slideHtmlArray, (step, pct) => {
        setCurrentStep(step);
        setProgress(20 + Math.round(pct * 0.7));
      });
      setProgress(90);
      setCurrentStep('Preparing download...');
      const fileName = `Bill_Analysis_${customerName.replace(/\s+/g, '_')}.pdf`;
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setProgress(100);
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setProgress(0);
      setCurrentStep('');
    }
  };
  
  if (isExporting) {
    return (
      <div className="flex items-center gap-3">
        <div className="space-y-1.5 min-w-[180px]">
          <Button disabled className="bg-[#00EAD3] text-black font-semibold w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {currentStep || 'Exporting...'}
          </Button>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#00EAD3] text-black hover:bg-[#00EAD3]/90 font-semibold">
          <Download className="mr-2 h-4 w-4" />
          Export
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-[#1a1a1a] w-56">
        <DropdownMenuItem
          onClick={handleExportNativePdf}
          className="text-white hover:text-white focus:text-white cursor-pointer py-2.5"
        >
          <FileDown className="mr-3 h-4 w-4 text-[#f36710]" />
          <div>
            <div className="font-medium" style={{ fontFamily: "'Urbanist', sans-serif" }}>PDF</div>
            <div className="text-[10px] text-[#808285]">Full proposal with all slides</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportPptx}
          className="text-white hover:text-white focus:text-white cursor-pointer py-2.5"
        >
          <Presentation className="mr-3 h-4 w-4 text-[#00EAD3]" />
          <div>
            <div className="font-medium" style={{ fontFamily: "'Urbanist', sans-serif" }}>PowerPoint</div>
            <div className="text-[10px] text-[#808285]">Editable .pptx file</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportHtmlPdf}
          className="text-white hover:text-white focus:text-white cursor-pointer py-2.5"
        >
          <FileText className="mr-3 h-4 w-4 text-[#808285]" />
          <div>
            <div className="font-medium" style={{ fontFamily: "'Urbanist', sans-serif" }}>HTML PDF</div>
            <div className="text-[10px] text-[#808285]">Browser-rendered slides</div>
          </div>
        </DropdownMenuItem>
        <div className="h-px bg-[#1a1a1a] my-1" />
        <DropdownMenuItem
          onClick={handlePrepareSlides}
          className="text-white hover:text-white focus:text-white cursor-pointer py-2.5"
        >
          <Presentation className="mr-3 h-4 w-4 text-[#00EAD3]" />
          <div>
            <div className="font-medium text-[#00EAD3]" style={{ fontFamily: "'Urbanist', sans-serif" }}>Manus Slides</div>
            <div className="text-[10px] text-[#808285]">Pixel-perfect image slides</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Prominent export button component — large, visible, with inline progress
function ExportButton({ type, label, description, icon, color, proposalId, customerName }: {
  type: 'pdf' | 'pptx' | 'html-pdf' | 'slides';
  label: string;
  description: string;
  icon: React.ReactNode;
  color: 'aqua' | 'orange' | 'grey';
  proposalId: number;
  customerName: string;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  const exportPptxMutation = trpc.proposals.exportPptx.useMutation();
  const generateSlideContentMutation = trpc.proposals.generateSlideContent.useMutation();
  const utils = trpc.useUtils();
  
  const colorMap = {
    aqua: { bg: 'bg-[#00EAD3]', hover: 'hover:bg-[#00EAD3]/90', text: 'text-black', border: 'border-[#00EAD3]/30', iconColor: 'text-[#00EAD3]' },
    orange: { bg: 'bg-[#f36710]', hover: 'hover:bg-[#f36710]/90', text: 'text-white', border: 'border-[#f36710]/30', iconColor: 'text-[#f36710]' },
    grey: { bg: 'bg-[#808285]/20', hover: 'hover:bg-[#808285]/30', text: 'text-white', border: 'border-[#808285]/30', iconColor: 'text-[#808285]' },
  };
  const c = colorMap[color];
  
  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    try {
      if (type === 'pdf' || type === 'html-pdf') {
        setCurrentStep('Fetching slides...');
        setProgress(10);
        const slidesResult = await utils.proposals.getSlideHtml.fetch({ proposalId });
        if (!slidesResult?.slides || slidesResult.slides.length === 0) {
          throw new Error('No slides generated. Please generate the proposal first.');
        }
        setProgress(15);
        setCurrentStep(`Rendering ${slidesResult.slides.length} slides...`);
        const slideHtmlArray = slidesResult.slides.map((s: any) => s.html);
        const pdfBlob = await generatePdfClientSide(slideHtmlArray, (step, pct) => {
          setCurrentStep(step);
          setProgress(15 + Math.round(pct * 0.65));
        });
        setProgress(85);
        setCurrentStep('Preparing download...');
        const fileName = `Bill_Analysis_${customerName.replace(/\s+/g, '_')}.pdf`;
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        // Upload to S3 for storage
        try {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(pdfBlob);
          });
          await fetch('/api/upload-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfData: base64, fileName: `exports/proposal-${proposalId}-${Date.now()}.pdf` }),
          });
        } catch { /* upload optional */ }
        toast.success('PDF downloaded successfully!');
      } else if (type === 'pptx') {
        setCurrentStep('Generating PowerPoint...');
        setProgress(30);
        const result = await exportPptxMutation.mutateAsync({ proposalId });
        setProgress(80);
        setCurrentStep('Downloading...');
        if (result.fileUrl) {
          const link = document.createElement('a');
          link.href = result.fileUrl;
          link.download = result.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        toast.success('PowerPoint exported successfully!');
      } else if (type === 'slides') {
        setCurrentStep('Preparing slide content...');
        setProgress(30);
        const result = await generateSlideContentMutation.mutateAsync({ proposalId });
        setProgress(80);
        if (result.fileUrl) {
          const link = document.createElement('a');
          link.href = result.fileUrl;
          link.download = result.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        toast.success(`Slide content prepared! ${result.slideCount} slides ready.`);
      }
      setProgress(100);
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setProgress(0);
      setCurrentStep('');
    }
  };
  
  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border transition-all duration-200 ${isExporting ? 'opacity-80 cursor-wait' : 'cursor-pointer hover:scale-[1.02]'} ${c.border} bg-[#111] hover:bg-[#1a1a1a]`}
    >
      {isExporting ? (
        <>
          <Loader2 className={`h-6 w-6 animate-spin ${c.iconColor}`} />
          <span className="text-xs text-[#808285] text-center" style={{ fontFamily: "'General Sans', sans-serif" }}>
            {currentStep || 'Exporting...'}
          </span>
          <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full ${c.bg} rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <div className={`${c.iconColor}`}>{icon}</div>
          <span 
            className="text-sm text-white font-semibold uppercase tracking-wide"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            {label}
          </span>
          <span className="text-[10px] text-[#808285]" style={{ fontFamily: "'General Sans', sans-serif" }}>
            {description}
          </span>
        </>
      )}
    </button>
  );
}

export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const proposalId = parseInt(params.id || '0');
  const [showLiveGeneration, setShowLiveGeneration] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  
  const { data: proposal, isLoading, refetch } = trpc.proposals.get.useQuery({ id: proposalId });
  const { data: slidesData, isLoading: slidesLoading } = trpc.proposals.getSlideHtml.useQuery(
    { proposalId },
    { enabled: !!proposal && (proposal.status === 'generated' || proposal.status === 'exported') }
  );
  
  // Auto-trigger LLM progressive generation when proposal has calculations but no slides
  useEffect(() => {
    if (!proposal || autoTriggered || showLiveGeneration) return;
    const hasCalculations = !!(proposal as any).calculations;
    const isNotGenerated = proposal.status === 'draft' || proposal.status === 'calculating';
    if (hasCalculations && isNotGenerated) {
      setAutoTriggered(true);
      setShowLiveGeneration(true);
    }
  }, [proposal, autoTriggered, showLiveGeneration]);
  
  const calculateMutation = trpc.proposals.calculate.useMutation({
    onSuccess: () => {
      toast.success('Calculations completed!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Calculation failed: ${error.message}`);
    }
  });
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!proposal) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto mb-4 text-[#808285] opacity-50" />
          <h2 className="text-xl" style={{ fontFamily: "'Next Sphere', sans-serif" }}>Proposal Not Found</h2>
          <p className="text-[#808285] mb-4 mt-2" style={{ fontFamily: "'General Sans', sans-serif" }}>The proposal you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/proposals')} variant="outline" className="border-[#808285]/30">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const customerName = (proposal as any).customer?.fullName || 'Customer';
  const customerAddress = (proposal as any).customer?.address || '';
  const slides = slidesData?.slides || [];
  const hasSlides = slides.length > 0;
  
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Back button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/proposals')}
            className="text-[#808285] hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Page Title - BILL ANALYSIS in NextSphere */}
        <div>
          <h1 
            className="text-4xl md:text-5xl tracking-tight text-white uppercase"
            style={{ fontFamily: "'Next Sphere', sans-serif" }}
          >
            Bill Analysis
          </h1>
          <p className="text-[#808285] mt-2" style={{ fontFamily: "'General Sans', sans-serif" }}>
            View and download your electricity bill analysis
          </p>
        </div>
        
        {/* Document Card - Dark card with file info + Open */}
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#00EAD3]/10 border border-[#00EAD3]/20">
                <FileText className="h-6 w-6 text-[#00EAD3]" />
              </div>
              <div>
                <h2 
                  className="text-lg text-white uppercase tracking-wide"
                  style={{ fontFamily: "'Next Sphere', sans-serif" }}
                >
                  Bill Analysis
                </h2>
                <p className="text-sm text-[#808285]" style={{ fontFamily: "'General Sans', sans-serif" }}>
                  {customerName} — {slides.length} slides
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Open in new tab */}
              {hasSlides && (
                <Button
                  variant="ghost"
                  className="text-[#00EAD3] hover:text-[#00EAD3] hover:bg-[#00EAD3]/10 font-semibold"
                  onClick={() => {
                    const win = window.open('', '_blank');
                    if (win && slides[0]) {
                      win.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head><title>Bill Analysis - ${customerName}</title></head>
                        <body style="margin:0;background:#000;display:flex;flex-direction:column;align-items:center;">
                          ${slides.map((s: any, i: number) => `
                            <div style="width:1120px;max-width:100%;margin:0 auto;${i > 0 ? 'margin-top:4px;' : ''}">
                              ${s.html}
                            </div>
                          `).join('')}
                        </body>
                        </html>
                      `);
                      win.document.close();
                    }
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </Button>
              )}

              {/* Admin actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#808285] hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <DropdownMenuItem
                    onClick={() => calculateMutation.mutate({ proposalId })}
                    disabled={calculateMutation.isPending}
                    className="text-[#808285] hover:text-white focus:text-white cursor-pointer"
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Recalculate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowLiveGeneration(true)}
                    className="text-[#808285] hover:text-white focus:text-white cursor-pointer"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Slides
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* DOWNLOAD & EXPORT — Prominent buttons always visible when slides exist */}
        {hasSlides && (
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <h3 
              className="text-lg text-white uppercase tracking-wide mb-4"
              style={{ fontFamily: "'Next Sphere', sans-serif" }}
            >
              Download & Export
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ExportButton
                type="pdf"
                label="Download PDF"
                description="Full proposal with all slides"
                icon={<FileDown className="h-5 w-5" />}
                color="aqua"
                proposalId={proposalId}
                customerName={customerName}
              />
              <ExportButton
                type="pptx"
                label="PowerPoint"
                description="Editable .pptx file"
                icon={<Presentation className="h-5 w-5" />}
                color="orange"
                proposalId={proposalId}
                customerName={customerName}
              />
              <ExportButton
                type="html-pdf"
                label="HTML PDF"
                description="Browser-rendered slides"
                icon={<FileText className="h-5 w-5" />}
                color="grey"
                proposalId={proposalId}
                customerName={customerName}
              />
              <ExportButton
                type="slides"
                label="Manus Slides"
                description="Pixel-perfect image slides"
                icon={<Presentation className="h-5 w-5" />}
                color="aqua"
                proposalId={proposalId}
                customerName={customerName}
              />
            </div>
          </div>
        )}
        
        {/* Live Generation View — auto-starts when proposal has calculations but no slides */}
        {showLiveGeneration && (
          <LiveSlideGeneration
            proposalId={proposalId}
            autoStart={autoTriggered}
            onComplete={() => {
              setShowLiveGeneration(false);
              refetch();
            }}
            onCancel={() => setShowLiveGeneration(false)}
          />
        )}
        
        {/* If no slides yet, show generation actions */}
        {!hasSlides && !showLiveGeneration && (
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-[#808285]/50" />
            <h3 
              className="text-xl text-white mb-2 uppercase"
              style={{ fontFamily: "'Next Sphere', sans-serif" }}
            >
              No Slides Generated Yet
            </h3>
            <p className="text-[#808285] mb-6" style={{ fontFamily: "'General Sans', sans-serif" }}>
              Click below to automatically calculate and generate the bill analysis slides.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => setShowLiveGeneration(true)}
                disabled={calculateMutation.isPending}
                className="bg-[#00EAD3] text-black hover:bg-[#00EAD3]/90 font-semibold"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Slides
              </Button>
            </div>
          </div>
        )}
        
        {/* Slide Preview - Clean scaled slide cards without scrollbars */}
        {hasSlides && (
          <div className="space-y-4">
            {slides.map((slide: any, index: number) => (
              <SlidePreview
                key={slide.id || index}
                html={slide.html}
                index={index}
                title={slide.title || `Slide ${index + 1}`}
              />
            ))}
          </div>
        )}
        
        {/* Loading state for slides */}
        {slidesLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#00EAD3]" />
            <span className="ml-3 text-[#808285]" style={{ fontFamily: "'General Sans', sans-serif" }}>Loading slides...</span>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center text-xs text-[#808285]/60 pt-4 border-t border-[#1a1a1a]" style={{ fontFamily: "'General Sans', sans-serif" }}>
          COPYRIGHT Lightning Energy — Architect George Fotopoulos
        </div>
      </div>
    </DashboardLayout>
  );
}
