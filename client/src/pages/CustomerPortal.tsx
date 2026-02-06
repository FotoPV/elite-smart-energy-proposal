import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { 
  Download, 
  Zap, 
  Battery, 
  Sun, 
  DollarSign,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Phone,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
// Lightning Energy brand assets
const LOGO_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/maXyrLOUeJCvTJgW.png';

// Slide viewer for customer portal
function PortalSlideViewer({ slides }: { slides: { slideNumber: number; html: string }[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  if (!slides || slides.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No slides available
      </div>
    );
  }
  
  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Main Slide Display */}
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <div 
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: slides[currentSlide]?.html || '' }}
        />
        
        {/* Navigation Arrows */}
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          disabled={currentSlide === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => goToSlide(currentSlide + 1)}
          disabled={currentSlide === slides.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
        
        {/* Slide Counter */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
      
      {/* Thumbnail Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`flex-shrink-0 w-24 h-14 rounded border-2 overflow-hidden transition-all ${
              currentSlide === index 
                ? 'border-primary ring-2 ring-primary/50' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div 
              className="w-full h-full transform scale-[0.15] origin-top-left"
              style={{ width: '666%', height: '666%' }}
              dangerouslySetInnerHTML={{ __html: slide.html }}
            />
          </button>
        ))}
      </div>
      
      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            <div 
              className="w-full h-full"
              style={{ aspectRatio: '16/9' }}
              dangerouslySetInnerHTML={{ __html: slides[currentSlide]?.html || '' }}
            />
            
            {/* Navigation in Fullscreen */}
            <button
              onClick={() => goToSlide(currentSlide - 1)}
              disabled={currentSlide === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-30"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={() => goToSlide(currentSlide + 1)}
              disabled={currentSlide === slides.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-30"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            
            {/* Slide Counter in Fullscreen */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white">
              {currentSlide + 1} / {slides.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CustomerPortal() {
  const params = useParams<{ token: string }>();
  const token = params.token || "";
  
  // Fetch proposal data via public endpoint
  const { data, isLoading, error } = trpc.portal.getProposal.useQuery(
    { token },
    { enabled: !!token }
  );
  
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Download PDF mutation
  const downloadMutation = trpc.portal.downloadPdf.useMutation({
    onSuccess: (result: { fileUrl: string; fileName: string }) => {
      const link = document.createElement('a');
      link.href = result.fileUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF downloaded successfully!');
      setIsDownloading(false);
    },
    onError: (error: { message: string }) => {
      toast.error(`Failed to download: ${error.message}`);
      setIsDownloading(false);
    }
  });
  
  const handleDownload = () => {
    setIsDownloading(true);
    downloadMutation.mutate({ token });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <img 
            src={LOGO_URL} 
            alt="Lightning Energy" 
            className="h-16 w-16 mx-auto animate-pulse"
          />
          <p className="text-muted-foreground">Loading your proposal...</p>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <Zap className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Proposal Not Found</h2>
            <p className="text-muted-foreground">
              This proposal link may have expired or is no longer available.
              Please contact Lightning Energy for assistance.
            </p>
            <div className="pt-4 space-y-2">
              <a href="tel:+61XXXXXXXXX" className="flex items-center justify-center gap-2 text-primary hover:underline">
                <Phone className="h-4 w-4" />
                Contact Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { proposal, customer, slides } = data;
  const calculations = proposal.calculations as any;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={LOGO_URL} 
              alt="Lightning Energy" 
              className="h-10 w-10"
            />
            <div>
              <h1 className="font-heading text-xl text-primary">Lightning Energy</h1>
              <p className="text-xs text-muted-foreground">Electrification Proposal</p>
            </div>
          </div>
          <Button 
            onClick={handleDownload}
            disabled={isDownloading || downloadMutation.isPending}
            className="lightning-button-primary"
          >
            {isDownloading || downloadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-heading">
            Welcome, <span className="text-primary">{customer.fullName}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thank you for your interest in electrifying your home. Below is your personalised 
            energy analysis and system recommendation prepared by Lightning Energy.
          </p>
        </div>
        
        {/* Key Metrics */}
        {calculations && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Savings</p>
                    <p className="text-2xl font-bold font-mono">
                      ${calculations.totalAnnualSavings?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payback Period</p>
                    <p className="text-2xl font-bold font-mono">
                      {calculations.paybackYears || 0} years
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Battery className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Battery Size</p>
                    <p className="text-2xl font-bold font-mono">
                      {calculations.recommendedBatteryKwh || 0} kWh
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Sun className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Solar Size</p>
                    <p className="text-2xl font-bold font-mono">
                      {calculations.recommendedSolarKw || 0} kW
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Proposal Slides */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Your Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <PortalSlideViewer slides={slides || []} />
          </CardContent>
        </Card>
        
        {/* Contact Section */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to Get Started?</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Contact Lightning Energy to discuss your proposal and take the next step 
                towards a cleaner, more efficient home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Button variant="outline" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call Us
                </Button>
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>COPYRIGHT Lightning Energy - Architect George Fotopoulos</p>
        </div>
      </footer>
    </div>
  );
}
