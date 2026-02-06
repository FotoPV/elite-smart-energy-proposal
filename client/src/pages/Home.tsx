import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Zap, ArrowRight } from "lucide-react";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/maXyrLOUeJCvTJgW.png";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to New Proposal (the main entry point)
  useEffect(() => {
    if (!loading && user) {
      setLocation("/proposals/new");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="Lightning Energy" className="h-16 w-16" />
          <p style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
        {/* Logo */}
        <img src={LOGO_URL} alt="Lightning Energy" className="h-24 w-24" style={{ filter: 'drop-shadow(0 0 30px rgba(0,234,211,0.3))' }} />
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl tracking-tight" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800, color: '#FFFFFF' }}>
            Lightning Energy
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] mt-2" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#00EAD3' }}>
            Proposal Generator
          </p>
        </div>
        
        {/* Description */}
        <p className="text-sm text-center max-w-sm" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>
          Create professional electrification proposals with AI-powered bill analysis, automated calculations, and branded slide generation.
        </p>
        
        {/* CTA */}
        <Button
          onClick={() => window.location.href = getLoginUrl()}
          size="lg"
          className="w-full text-base"
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontWeight: 600,
            backgroundColor: '#00EAD3',
            color: '#000000',
            boxShadow: '0 0 25px rgba(0,234,211,0.3)'
          }}
        >
          <Zap className="mr-2 h-5 w-5" />
          Sign In
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        {/* Footer */}
        <p className="text-[10px] text-center mt-4" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>
          © Lightning Energy — Architect George Fotopoulos
        </p>
      </div>
    </div>
  );
}
