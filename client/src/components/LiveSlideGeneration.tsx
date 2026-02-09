/**
 * LiveSlideGeneration - Split-screen real-time slide generation preview
 * Left panel: Progress tracker with slide status indicators
 * Right panel: Live slide preview that updates as each slide completes
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Play,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface LiveSlideGenerationProps {
  proposalId: number;
  onComplete: () => void;
  onCancel: () => void;
}

type SlideStatus = 'pending' | 'generating' | 'complete' | 'error';

interface SlideProgressItem {
  slideIndex: number;
  slideType: string;
  title: string;
  status: SlideStatus;
  html?: string;
  error?: string;
}

export function LiveSlideGeneration({ proposalId, onComplete, onCancel }: LiveSlideGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [localSlides, setLocalSlides] = useState<SlideProgressItem[]>([]);
  const [generationStatus, setGenerationStatus] = useState<string>('idle');
  const slideListRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  const generateMutation = trpc.proposals.generateProgressive.useMutation();
  
  // Poll for progress while generating
  const { data: progressData } = trpc.proposals.generationProgress.useQuery(
    { proposalId },
    {
      enabled: isGenerating,
      refetchInterval: isGenerating ? 300 : false,
    }
  );
  
  // Update local slides from progress data
  useEffect(() => {
    if (!progressData || progressData.status === 'idle') return;
    
    setGenerationStatus(progressData.status);
    
    if (progressData.slides && progressData.slides.length > 0) {
      setLocalSlides(progressData.slides as SlideProgressItem[]);
      
      // Auto-select the latest completed slide
      const lastCompleted = [...progressData.slides]
        .reverse()
        .find(s => s.status === 'complete');
      if (lastCompleted) {
        setSelectedSlideIndex(lastCompleted.slideIndex);
      }
    }
    
    if (progressData.status === 'complete') {
      setIsGenerating(false);
      // Small delay before calling onComplete to let user see the final state
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
    
    if (progressData.status === 'error') {
      setIsGenerating(false);
    }
  }, [progressData, onComplete]);
  
  // Auto-scroll slide list to current generating slide
  useEffect(() => {
    if (!slideListRef.current) return;
    const currentItem = slideListRef.current.querySelector('[data-generating="true"]');
    if (currentItem) {
      currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [localSlides]);
  
  const handleStart = useCallback(async () => {
    setIsGenerating(true);
    setHasStarted(true);
    setLocalSlides([]);
    setSelectedSlideIndex(0);
    
    try {
      await generateMutation.mutateAsync({ proposalId });
    } catch (error: any) {
      setIsGenerating(false);
      setGenerationStatus('error');
    }
  }, [proposalId, generateMutation]);
  
  const completedCount = localSlides.filter(s => s.status === 'complete').length;
  const totalCount = localSlides.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const selectedSlide = localSlides[selectedSlideIndex];
  const isComplete = generationStatus === 'complete';
  
  // Pre-start screen
  if (!hasStarted) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-8">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#00EAD3]/10 border border-[#00EAD3]/30 flex items-center justify-center mx-auto mb-6">
            <Zap className="h-8 w-8 text-[#00EAD3]" />
          </div>
          <h3 
            className="text-2xl text-white uppercase mb-3"
            style={{ fontFamily: "'Next Sphere', sans-serif" }}
          >
            Generate Slides
          </h3>
          <p className="text-[#808285] mb-8" style={{ fontFamily: "'General Sans', sans-serif" }}>
            Watch your proposal slides being generated in real-time. Each slide will appear as it's created.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={handleStart}
              className="bg-[#00EAD3] text-black hover:bg-[#00EAD3]/90 font-semibold px-8 py-3 text-base"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Generation
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-[#808285]/30 text-[#808285] hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
      {/* Top progress bar */}
      <div className="px-5 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#00EAD3]" />
          ) : isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-[#00EAD3]" />
          ) : (
            <AlertCircle className="h-4 w-4 text-orange-500" />
          )}
          <span 
            className="text-sm text-white uppercase tracking-wider"
            style={{ fontFamily: "'Next Sphere', sans-serif" }}
          >
            {isGenerating ? 'Generating Slides...' : isComplete ? 'Generation Complete' : 'Generation Error'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#808285]" style={{ fontFamily: "'General Sans', sans-serif" }}>
            {completedCount} / {totalCount} slides
          </span>
          <div className="w-32">
            <Progress value={progressPercent} className="h-1.5" />
          </div>
          <span className="text-xs font-semibold text-[#00EAD3]" style={{ fontFamily: "'General Sans', sans-serif" }}>
            {progressPercent}%
          </span>
        </div>
      </div>
      
      {/* Split screen */}
      <div className="flex" style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}>
        {/* Left panel: Slide progress list */}
        <div 
          ref={slideListRef}
          className="w-72 border-r border-[#1a1a1a] overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
        >
          <div className="p-3">
            <p className="text-[10px] uppercase tracking-wider text-[#808285] mb-2 px-2" style={{ fontFamily: "'General Sans', sans-serif" }}>
              Slide Progress
            </p>
            {localSlides.map((slide, index) => (
              <button
                key={index}
                data-generating={slide.status === 'generating' ? 'true' : 'false'}
                onClick={() => slide.status === 'complete' && setSelectedSlideIndex(index)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all flex items-center gap-3
                  ${selectedSlideIndex === index ? 'bg-[#00EAD3]/10 border border-[#00EAD3]/30' : 'hover:bg-[#111] border border-transparent'}
                  ${slide.status === 'complete' ? 'cursor-pointer' : 'cursor-default'}
                  ${slide.status === 'generating' ? 'bg-[#00EAD3]/5' : ''}
                `}
              >
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {slide.status === 'pending' && (
                    <Circle className="h-4 w-4 text-[#333]" />
                  )}
                  {slide.status === 'generating' && (
                    <Loader2 className="h-4 w-4 animate-spin text-[#00EAD3]" />
                  )}
                  {slide.status === 'complete' && (
                    <CheckCircle2 className="h-4 w-4 text-[#00EAD3]" />
                  )}
                  {slide.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                
                {/* Slide info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#808285]" style={{ fontFamily: "'General Sans', sans-serif" }}>
                    Slide {index + 1}
                  </p>
                  <p className={`text-xs truncate ${slide.status === 'complete' ? 'text-white' : 'text-[#808285]'}`} style={{ fontFamily: "'General Sans', sans-serif" }}>
                    {slide.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Right panel: Live slide preview */}
        <div className="flex-1 flex flex-col bg-[#050505]">
          {/* Preview header with navigation */}
          <div className="px-4 py-2 border-b border-[#1a1a1a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#808285] hover:text-white"
                disabled={selectedSlideIndex === 0}
                onClick={() => setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-[#808285]" style={{ fontFamily: "'General Sans', sans-serif" }}>
                Slide {selectedSlideIndex + 1} of {totalCount || '—'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#808285] hover:text-white"
                disabled={selectedSlideIndex >= totalCount - 1}
                onClick={() => setSelectedSlideIndex(Math.min(totalCount - 1, selectedSlideIndex + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {selectedSlide && (
              <span className="text-xs text-white" style={{ fontFamily: "'General Sans', sans-serif" }}>
                {selectedSlide.title}
              </span>
            )}
          </div>
          
          {/* Slide render area */}
          <div ref={previewContainerRef} className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {selectedSlide?.status === 'complete' && selectedSlide.html ? (
              <SlideIframePreview html={selectedSlide.html} />
            ) : selectedSlide?.status === 'generating' ? (
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#00EAD3] mx-auto mb-4" />
                <p className="text-[#808285] text-sm" style={{ fontFamily: "'General Sans', sans-serif" }}>
                  Generating slide {selectedSlideIndex + 1}...
                </p>
                <p className="text-[#00EAD3] text-xs mt-1" style={{ fontFamily: "'General Sans', sans-serif" }}>
                  {selectedSlide.title}
                </p>
              </div>
            ) : selectedSlide?.status === 'error' ? (
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <p className="text-[#808285] text-sm" style={{ fontFamily: "'General Sans', sans-serif" }}>
                  Error generating this slide
                </p>
                <p className="text-orange-500 text-xs mt-1" style={{ fontFamily: "'General Sans', sans-serif" }}>
                  {selectedSlide.error}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-4">
                  <Circle className="h-8 w-8 text-[#333]" />
                </div>
                <p className="text-[#808285] text-sm" style={{ fontFamily: "'General Sans', sans-serif" }}>
                  Waiting for slide to generate...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      {isComplete && (
        <div className="px-5 py-3 border-t border-[#1a1a1a] flex items-center justify-between bg-[#00EAD3]/5">
          <p className="text-sm text-[#00EAD3]" style={{ fontFamily: "'General Sans', sans-serif" }}>
            All {totalCount} slides generated successfully
          </p>
          <Button
            onClick={onComplete}
            className="bg-[#00EAD3] text-black hover:bg-[#00EAD3]/90 font-semibold"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            View Full Presentation
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Renders a single slide HTML in a scaled iframe
 */
function SlideIframePreview({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    const doc = iframe.contentDocument;
    if (!doc) return;
    
    const isFullDocument = html.includes('<!DOCTYPE html>') || html.includes('<html');
    
    doc.open();
    if (isFullDocument) {
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
  
  // Scale calculation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateScale = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const scaleX = containerWidth / 1920;
      const scaleY = containerHeight / 1080;
      const scale = Math.min(scaleX, scaleY);
      container.style.setProperty('--slide-scale', scale.toString());
    };
    
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div 
        className="relative overflow-hidden rounded-lg border border-[#1a1a1a] shadow-2xl"
        style={{ 
          width: 'calc(1920px * var(--slide-scale, 0.4))',
          height: 'calc(1080px * var(--slide-scale, 0.4))',
        }}
      >
        <iframe
          ref={iframeRef}
          className="border-0 origin-top-left"
          title="Slide Preview"
          style={{ 
            width: '1920px',
            height: '1080px',
            transform: 'scale(var(--slide-scale, 0.4))',
            transformOrigin: 'top left',
            pointerEvents: 'none',
            display: 'block',
          }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}

export default LiveSlideGeneration;
