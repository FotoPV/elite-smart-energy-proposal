import { useLocation } from "wouter";
import { Upload, Layers, LayoutGrid, FileText, BarChart2 } from "lucide-react";

const BRAND = {
  iconTransparent: "/elite_icon_white_transparent.png",
  aqua: "#00EAD3",
  green: "#3CB55A",
  orange: "#f36710",
  black: "#0D1B2A",
};

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: BRAND.black,
        fontFamily: "'GeneralSans', 'Montserrat', 'Open Sans', sans-serif",
      }}
    >
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 pt-14 pb-8 text-center">

        {/* Logo — centered, medium size */}
        <div className="flex justify-center mb-8">
          <img
            src={BRAND.iconTransparent}
            alt="Elite Smart Energy"
            style={{ height: "72px", width: "72px", objectFit: "contain" }}
          />
        </div>

        {/* Massive bold hero title — fills viewport width like the reference */}
        <h1
          style={{
            fontFamily: "'NextSphere', 'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(3.5rem, 12vw, 9rem)",
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
            maxWidth: "1100px",
          }}
        >
          IN-DEPTH BILL ANALYSIS
          <br />
          &amp; PROPOSAL
          <br />
          GENERATOR
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: "#94A3B8",
            fontFamily: "'GeneralSans', 'Open Sans', sans-serif",
            fontSize: "1rem",
            lineHeight: 1.7,
            maxWidth: "620px",
            marginBottom: "2.5rem",
          }}
        >
          Upload your electricity bill PDF and automatically generate a beautiful,
          in-depth analysis with system details, financial projections, and state rebates.
        </p>

        {/* ── ACTION BUTTONS ─────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "1.5rem",
          }}
        >
          {/* Upload Bill — outlined aqua */}
          <button
            onClick={() => setLocation("/proposals/new")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "6px",
              fontFamily: "'GeneralSans', 'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              letterSpacing: "0.03em",
              border: `2px solid ${BRAND.green}`,
              color: BRAND.green,
              background: "transparent",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Upload style={{ width: "16px", height: "16px" }} />
            Upload Bill
          </button>

          {/* Bulk Upload — solid orange */}
          <button
            onClick={() => setLocation("/bulk-upload")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "6px",
              fontFamily: "'GeneralSans', 'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              letterSpacing: "0.03em",
              border: "none",
              background: BRAND.green,
              color: "#FFFFFF",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Layers style={{ width: "16px", height: "16px" }} />
            Bulk Upload
          </button>

          {/* View Bills & Photos — outlined white */}
          <button
            onClick={() => setLocation("/bills")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "6px",
              fontFamily: "'GeneralSans', 'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              letterSpacing: "0.03em",
              border: "2px solid rgba(255,255,255,0.3)",
              color: "#FFFFFF",
              background: "transparent",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <LayoutGrid style={{ width: "16px", height: "16px" }} />
            View Bills &amp; Photos
          </button>

          {/* View Proposals — outlined white */}
          <button
            onClick={() => setLocation("/proposals")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "6px",
              fontFamily: "'GeneralSans', 'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              letterSpacing: "0.03em",
              border: "2px solid rgba(255,255,255,0.3)",
              color: "#FFFFFF",
              background: "transparent",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FileText style={{ width: "16px", height: "16px" }} />
            View Proposals
          </button>
        </div>

        {/* Admin analytics link */}
        <button
          onClick={() => setLocation("/proposals")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            margin: "0 auto",
            background: "none",
            border: "none",
            color: "#64748B",
            fontSize: "0.75rem",
            fontFamily: "'GeneralSans', 'Open Sans', sans-serif",
            cursor: "pointer",
            opacity: 0.8,
          }}
        >
          <BarChart2 style={{ width: "14px", height: "14px" }} />
          Admin: Bill Extraction Analytics
        </button>
      </div>

      {/* ── FEATURE CARDS ──────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px 64px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Card 1 — Automatic Extraction */}
        <div
          style={{
            borderRadius: "12px",
            padding: "28px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3
            style={{
              fontFamily: "'GeneralSans', 'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: BRAND.green,
              marginBottom: "12px",
              lineHeight: 1.4,
            }}
          >
            AUTOMATIC<br />EXTRACTION
          </h3>
          <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.65, fontFamily: "'GeneralSans', 'Open Sans', sans-serif" }}>
            AI-powered PDF scanning extracts customer details, usage data, tariff
            rates, and billing periods automatically.
          </p>
        </div>

        {/* Card 2 — LLM-Powered Analysis */}
        <div
          style={{
            borderRadius: "12px",
            padding: "28px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3
            style={{
              fontFamily: "'GeneralSans', 'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: BRAND.orange,
              marginBottom: "12px",
              lineHeight: 1.4,
            }}
          >
            LLM-POWERED<br />ANALYSIS
          </h3>
          <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.65, fontFamily: "'GeneralSans', 'Open Sans', sans-serif" }}>
            Each slide is generated with AI-written, customer-specific narrative
            analysis — not just data tables.
          </p>
        </div>

        {/* Card 3 — Instant Proposals */}
        <div
          style={{
            borderRadius: "12px",
            padding: "28px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3
            style={{
              fontFamily: "'GeneralSans', 'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              marginBottom: "12px",
              lineHeight: 1.4,
            }}
          >
            INSTANT<br />PROPOSALS
          </h3>
          <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.65, fontFamily: "'GeneralSans', 'Open Sans', sans-serif" }}>
            Generate professional branded proposals with solar, battery, VPP,
            and financial analysis in minutes.
          </p>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          padding: "16px",
          fontSize: "0.7rem",
          color: "#334155",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "'GeneralSans', 'Open Sans', sans-serif",
        }}
      >
        © Elite Smart Energy Solutions
      </div>
    </div>
  );
}
