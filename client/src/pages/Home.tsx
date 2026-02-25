import { useLocation } from "wouter";
import { Upload, Layers, LayoutGrid, FileText, BarChart2 } from "lucide-react";

const BRAND = {
  iconWhite: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/OOvYOULsnTCxOyIC.png",
  solarGreen: "#46B446",
  midnightNavy: "#0F172A",
  eliteNavy: "#1B3A5C",
  steelBlue: "#4A6B8A",
};

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start"
      style={{
        background: BRAND.midnightNavy,
        fontFamily: "'Montserrat', 'Open Sans', sans-serif",
      }}
    >
      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        {/* Logo icon */}
        <div className="flex justify-center mb-6">
          <img
            src={BRAND.iconWhite}
            alt="Elite Smart Energy Solutions"
            className="h-20 w-20 object-contain"
          />
        </div>

        {/* Bold hero title */}
        <h1
          className="font-black uppercase leading-none tracking-tight mb-6"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.8rem, 8vw, 6rem)",
            color: "#FFFFFF",
            textShadow: "0 2px 24px rgba(70,180,70,0.18)",
            letterSpacing: "-0.01em",
          }}
        >
          IN-DEPTH BILL ANALYSIS
          <br />
          &amp; PROPOSAL GENERATOR
        </h1>

        {/* Subtitle */}
        <p
          className="max-w-2xl mx-auto mb-10 text-base md:text-lg"
          style={{ color: "#94A3B8", fontFamily: "'Open Sans', sans-serif", lineHeight: 1.7 }}
        >
          Upload your electricity bill PDF and automatically generate a beautiful,
          in-depth analysis with system details, financial projections, and state rebates.
        </p>

        {/* ── ACTION BUTTONS ─────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {/* Upload Bill — outlined green */}
          <button
            onClick={() => setLocation("/proposals/new")}
            className="flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm transition-all hover:scale-105"
            style={{
              border: `2px solid ${BRAND.solarGreen}`,
              color: BRAND.solarGreen,
              background: "transparent",
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            <Upload className="h-4 w-4" />
            Upload Bill
          </button>

          {/* Bulk Upload — solid green */}
          <button
            onClick={() => setLocation("/proposals/new")}
            className="flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm transition-all hover:scale-105"
            style={{
              background: BRAND.solarGreen,
              color: "#FFFFFF",
              border: "none",
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            <Layers className="h-4 w-4" />
            Bulk Upload
          </button>

          {/* View Bills & Photos — outlined white */}
          <button
            onClick={() => setLocation("/proposals")}
            className="flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm transition-all hover:scale-105"
            style={{
              border: "2px solid rgba(255,255,255,0.25)",
              color: "#FFFFFF",
              background: "transparent",
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            <LayoutGrid className="h-4 w-4" />
            View Bills &amp; Photos
          </button>

          {/* View Proposals — outlined white */}
          <button
            onClick={() => setLocation("/proposals")}
            className="flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm transition-all hover:scale-105"
            style={{
              border: "2px solid rgba(255,255,255,0.25)",
              color: "#FFFFFF",
              background: "transparent",
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            <FileText className="h-4 w-4" />
            View Proposals
          </button>
        </div>

        {/* Admin link */}
        <button
          onClick={() => setLocation("/proposals")}
          className="flex items-center gap-2 mx-auto text-xs transition-opacity hover:opacity-80"
          style={{ color: "#64748B", fontFamily: "'Open Sans', sans-serif" }}
        >
          <BarChart2 className="h-3.5 w-3.5" />
          Admin: Bill Extraction Analytics
        </button>
      </div>

      {/* ── FEATURE CARDS ────────────────────────────────── */}
      <div className="w-full max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div
            className="rounded-xl p-7"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h3
              className="text-sm font-black uppercase mb-3 tracking-wide"
              style={{ color: BRAND.solarGreen, fontFamily: "'Montserrat', sans-serif" }}
            >
              AUTOMATIC
              <br />
              EXTRACTION
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#94A3B8", fontFamily: "'Open Sans', sans-serif" }}>
              AI-powered PDF scanning extracts customer details, usage data, tariff
              rates, and billing periods automatically.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="rounded-xl p-7"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h3
              className="text-sm font-black uppercase mb-3 tracking-wide"
              style={{ color: "#F97316", fontFamily: "'Montserrat', sans-serif" }}
            >
              LLM-POWERED
              <br />
              ANALYSIS
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#94A3B8", fontFamily: "'Open Sans', sans-serif" }}>
              Each slide is generated with AI-written, customer-specific narrative
              analysis — not just data tables.
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="rounded-xl p-7"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h3
              className="text-sm font-black uppercase mb-3 tracking-wide"
              style={{ color: "#FFFFFF", fontFamily: "'Montserrat', sans-serif" }}
            >
              INSTANT
              <br />
              PROPOSALS
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#94A3B8", fontFamily: "'Open Sans', sans-serif" }}>
              Generate professional branded proposals with solar, battery, VPP,
              and financial analysis in minutes.
            </p>
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <div
        className="w-full text-center py-4 text-xs"
        style={{ color: "#334155", borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Open Sans', sans-serif" }}
      >
        © Elite Smart Energy Solutions — South Australia
      </div>
    </div>
  );
}
