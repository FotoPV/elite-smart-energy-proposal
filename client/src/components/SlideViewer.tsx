import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Download, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface SlideViewerProps {
  proposalId: number;
}

export function SlideViewer({ proposalId }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { data, isLoading, error } = trpc.proposals.getSlideHtml.useQuery({
    proposalId,
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-black/50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-[#00EAD3]" />
        <span className="ml-2 text-white">Loading slides...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-black/50 rounded-lg border border-red-500/50">
        <p className="text-red-400">{error.message}</p>
      </div>
    );
  }
  
  if (!data || !data.slides || data.slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-black/50 rounded-lg border border-gray-700">
        <p className="text-gray-400">No slides generated yet. Run calculations first.</p>
      </div>
    );
  }
  
  const slides = data.slides;
  const currentSlideData = slides[currentSlide];
  
  const goToPrevious = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };
  
  const goToNext = () => {
    setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
  };
  
  return (
    <div className="space-y-4">
      {/* Slide Preview */}
      <div className="relative bg-black rounded-lg overflow-hidden border border-gray-800">
        {/* Slide Content */}
        <div 
          className="aspect-video w-full"
          style={{ maxHeight: '500px' }}
        >
          <iframe
            srcDoc={currentSlideData.html}
            className="w-full h-full border-0"
            title={`Slide ${currentSlide + 1}: ${currentSlideData.title}`}
            style={{ 
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
              width: '200%',
              height: '200%',
            }}
          />
        </div>
        
        {/* Navigation Overlay */}
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            disabled={currentSlide === 0}
            className="pointer-events-auto bg-black/80 border-gray-700 hover:bg-black hover:border-[#00EAD3]"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            disabled={currentSlide === slides.length - 1}
            className="pointer-events-auto bg-black/80 border-gray-700 hover:bg-black hover:border-[#00EAD3]"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Fullscreen Button */}
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-black/80 border-gray-700 hover:bg-black hover:border-[#00EAD3]"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-gray-800">
            <iframe
              srcDoc={currentSlideData.html}
              className="w-full h-[90vh] border-0"
              title={`Slide ${currentSlide + 1}: ${currentSlideData.title}`}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Slide Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{currentSlideData.title}</h3>
          {currentSlideData.subtitle && (
            <p className="text-sm text-[#00EAD3]">{currentSlideData.subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>
      </div>
      
      {/* Slide Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            className={`flex-shrink-0 w-32 h-20 rounded border-2 overflow-hidden transition-all ${
              index === currentSlide
                ? 'border-[#00EAD3] ring-2 ring-[#00EAD3]/30'
                : 'border-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="w-full h-full bg-black flex items-center justify-center">
              <span className="text-xs text-gray-400 text-center px-1">{slide.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SlideViewer;
