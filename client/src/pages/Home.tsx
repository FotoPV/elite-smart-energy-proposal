import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { 
  Zap, 
  FileText, 
  Calculator, 
  Upload, 
  ArrowRight,
  CheckCircle,
  Battery,
  Sun,
  Flame
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <img 
            src="/LightningEnergy_Logo_Icon_Aqua.png" 
            alt="Lightning Energy" 
            className="h-16 w-16"
          />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Logo */}
            <img 
              src="/LightningEnergy_Logo_Icon_Aqua.png" 
              alt="Lightning Energy" 
              className="h-24 w-24 mb-8 animate-pulse-glow"
            />
            
            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              <span className="block text-foreground">Lightning Energy</span>
              <span className="block mt-2" style={{
                background: 'linear-gradient(135deg, oklch(82.5% 0.14 180) 0%, oklch(70% 0.12 190) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Proposal Generator
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
              Streamline your residential electrification proposals with AI-powered bill analysis, 
              automated calculations, and professional slide generation.
            </p>
            
            {/* CTA Button */}
            <Button 
              onClick={() => window.location.href = getLoginUrl()}
              size="lg"
              className="text-lg px-8 py-6 font-semibold"
              style={{
                background: 'oklch(82.5% 0.14 180)',
                color: 'oklch(10% 0 0)',
                boxShadow: '0 0 30px oklch(82.5% 0.14 180 / 0.4)'
              }}
            >
              <Zap className="mr-2 h-5 w-5" />
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-extrabold text-center mb-12">
          How It Works
        </h2>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={Upload}
            title="Upload Bills"
            description="Upload electricity and gas bills for AI-powered data extraction"
            step={1}
          />
          <FeatureCard
            icon={Calculator}
            title="Auto Calculate"
            description="Automated savings calculations, VPP comparison, and payback analysis"
            step={2}
          />
          <FeatureCard
            icon={FileText}
            title="Generate Slides"
            description="Professional 25-slide proposal with conditional content"
            step={3}
          />
          <FeatureCard
            icon={Zap}
            title="Export & Share"
            description="Export to PDF or PowerPoint with Lightning Energy branding"
            step={4}
          />
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-card/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            Complete Electrification Analysis
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <BenefitItem icon={Sun} text="Solar PV system sizing and recommendations" />
            <BenefitItem icon={Battery} text="Battery storage analysis and VPP income" />
            <BenefitItem icon={Flame} text="Gas to electric conversion savings" />
            <BenefitItem icon={CheckCircle} text="Heat pump hot water and HVAC upgrades" />
            <BenefitItem icon={CheckCircle} text="EV charging analysis and savings" />
            <BenefitItem icon={CheckCircle} text="State-specific rebates and incentives" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/LightningEnergy_Logo_Icon_Aqua.png" 
              alt="Lightning Energy" 
              className="h-8 w-8"
            />
            <span className="font-semibold" style={{ color: 'oklch(82.5% 0.14 180)' }}>
              Lightning Energy
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            COPYRIGHT Lightning Energy - Architect George Fotopoulos
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Showroom 1, Waverley Road, Malvern East VIC 3145 | 0419 574 520
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  step 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  step: number;
}) {
  return (
    <div className="relative p-6 rounded-xl border border-border bg-card/50 hover:border-primary/50 transition-all group">
      <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ background: 'oklch(82.5% 0.14 180)', color: 'oklch(10% 0 0)' }}>
        {step}
      </div>
      <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'oklch(82.5% 0.14 180 / 0.1)' }}>
        <Icon className="h-6 w-6" style={{ color: 'oklch(82.5% 0.14 180)' }} />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
      <Icon className="h-5 w-5 shrink-0" style={{ color: 'oklch(82.5% 0.14 180)' }} />
      <span className="text-sm">{text}</span>
    </div>
  );
}
