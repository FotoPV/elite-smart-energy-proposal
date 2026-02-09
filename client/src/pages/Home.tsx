import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Upload, UploadCloud, LayoutGrid, FileText, BarChart3, Zap, ArrowRight, ScanLine, Layers, Gauge } from "lucide-react";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/maXyrLOUeJCvTJgW.png";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="Lightning Energy" className="h-16 w-16" />
          <p style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show login CTA
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-8 p-8 max-w-lg w-full">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Lightning Energy" className="h-14 w-14" />
            <div>
              <h1 className="text-2xl tracking-[0.15em] uppercase" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800, color: '#FFFFFF' }}>
                LIGHTNING
              </h1>
              <p className="text-xs tracking-[0.3em] uppercase" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#00EAD3' }}>
                ENERGY
              </p>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl text-center uppercase tracking-tight" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
            In-Depth Bill Analysis<br />& Proposal Generator
          </h2>
          <p className="text-sm text-center max-w-md" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285', lineHeight: 1.7 }}>
            Upload your electricity bill PDF and automatically generate a professional, in-depth analysis with system recommendations, financial projections, and state rebates.
          </p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="text-base px-10"
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontWeight: 600,
              backgroundColor: '#00EAD3',
              color: '#000000',
            }}
          >
            <Zap className="mr-2 h-5 w-5" />
            Sign In
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-[10px] text-center mt-8" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>
            © Lightning Energy — Architect George Fotopoulos
          </p>
        </div>
      </div>
    );
  }

  // Authenticated — show the main dashboard face
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo + Wordmark */}
        <div className="flex items-center gap-5 mb-10">
          <img src={LOGO_URL} alt="Lightning Energy" className="h-16 w-16" />
          <div>
            <h1 className="text-3xl tracking-[0.15em] uppercase" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800, color: '#FFFFFF' }}>
              LIGHTNING
            </h1>
            <p className="text-sm tracking-[0.3em] uppercase" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#00EAD3' }}>
              ENERGY
            </p>
          </div>
        </div>

        {/* Hero Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl text-center uppercase tracking-tight mb-6" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800, color: '#FFFFFF', lineHeight: 1.05 }}>
          In-Depth Bill Analysis<br />& Proposal Generator
        </h2>

        {/* Subtitle */}
        <p className="text-base text-center max-w-2xl mb-12" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285', lineHeight: 1.7 }}>
          Upload your electricity bill PDF and automatically generate a beautiful, in-depth analysis with system details, financial projections, and state rebates.
        </p>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setLocation("/proposals/new")}
            className="flex items-center gap-2 px-6 py-3 rounded-md transition-colors"
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              border: '1px solid #00EAD3',
              color: '#00EAD3',
              backgroundColor: 'transparent',
            }}
          >
            <Upload className="h-4 w-4" />
            Upload Bill
          </button>

          <button
            onClick={() => setLocation("/proposals/new")}
            className="flex items-center gap-2 px-6 py-3 rounded-md transition-colors"
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              backgroundColor: '#f36710',
              color: '#FFFFFF',
              border: '1px solid #f36710',
            }}
          >
            <UploadCloud className="h-4 w-4" />
            Bulk Upload
          </button>

          <button
            onClick={() => setLocation("/proposals")}
            className="flex items-center gap-2 px-6 py-3 rounded-md transition-colors"
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              border: '1px solid #333',
              color: '#FFFFFF',
              backgroundColor: 'transparent',
            }}
          >
            <LayoutGrid className="h-4 w-4" />
            View Bills & Photos
          </button>

          <button
            onClick={() => setLocation("/proposals")}
            className="flex items-center gap-2 px-6 py-3 rounded-md transition-colors"
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              border: '1px solid #333',
              color: '#FFFFFF',
              backgroundColor: 'transparent',
            }}
          >
            <FileText className="h-4 w-4" />
            View Proposals
          </button>
        </div>

        {/* Admin Links */}
        <div className="flex flex-col items-center gap-2 mb-14">
          <button
            onClick={() => setLocation("/proposals")}
            className="flex items-center gap-2 text-xs transition-colors hover:text-white"
            style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Admin: Bill Extraction Analytics
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="p-6 rounded-lg" style={{ border: '1px solid #222' }}>
            <h3 className="text-base uppercase tracking-wide mb-3" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800, color: '#00EAD3' }}>
              Automatic Extraction
            </h3>
            <p className="text-sm" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285', lineHeight: 1.6 }}>
              AI-powered PDF scanning extracts customer details, usage data, tariff rates, and billing periods automatically.
            </p>
          </div>

          <div className="p-6 rounded-lg" style={{ border: '1px solid #222' }}>
            <h3 className="text-base uppercase tracking-wide mb-3" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800, color: '#f36710' }}>
              LLM-Powered Analysis
            </h3>
            <p className="text-sm" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285', lineHeight: 1.6 }}>
              Each slide is generated with AI-written, customer-specific narrative analysis — not just data tables.
            </p>
          </div>

          <div className="p-6 rounded-lg" style={{ border: '1px solid #222' }}>
            <h3 className="text-base uppercase tracking-wide mb-3" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800, color: '#FFFFFF' }}>
              Instant Proposals
            </h3>
            <p className="text-sm" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285', lineHeight: 1.6 }}>
              Generate professional branded proposals with solar, battery, VPP, and financial analysis in minutes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center mt-14" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>
          COPYRIGHT Lightning Energy — Architect George Fotopoulos
        </p>
      </div>
    </div>
  );
}
