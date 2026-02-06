/**
 * Slide Preview Component
 * Renders individual proposal slides with Lightning Energy branding
 */

import { SlideData } from "../../../drizzle/schema";
import { Zap, Battery, Sun, Flame, Car, Droplets, TrendingUp, DollarSign, Leaf, Phone, Mail, Globe, MapPin } from "lucide-react";

interface SlidePreviewProps {
  slide: SlideData;
  isActive?: boolean;
  onClick?: () => void;
}

export function SlidePreview({ slide, isActive, onClick }: SlidePreviewProps) {
  return (
    <div
      onClick={onClick}
      className={`
        aspect-video rounded-lg overflow-hidden cursor-pointer transition-all
        ${isActive ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : 'ring-1 ring-border hover:ring-primary/50'}
        ${!slide.isIncluded ? 'opacity-50' : ''}
      `}
    >
      <div className="w-full h-full bg-black p-4 flex flex-col">
        {/* Slide Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground">Slide {slide.slideNumber}</span>
          {!slide.isIncluded && (
            <span className="text-[8px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">Excluded</span>
          )}
        </div>
        
        {/* Slide Content Preview */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {getSlideIcon(slide.slideType)}
          <h3 className="text-xs font-semibold text-foreground mt-2 text-center line-clamp-2">
            {slide.title}
          </h3>
        </div>
      </div>
    </div>
  );
}

function getSlideIcon(slideType: string) {
  const iconClass = "w-6 h-6 text-primary";
  
  switch (slideType) {
    case 'cover':
      return <Zap className={iconClass} />;
    case 'executive_summary':
      return <TrendingUp className={iconClass} />;
    case 'bill_analysis':
    case 'monthly_usage':
    case 'yearly_projection':
      return <DollarSign className={iconClass} />;
    case 'gas_footprint':
    case 'gas_appliances':
      return <Flame className="w-6 h-6 text-orange-500" />;
    case 'battery_recommendation':
      return <Battery className={iconClass} />;
    case 'solar_recommendation':
      return <Sun className="w-6 h-6 text-yellow-500" />;
    case 'vpp_comparison':
    case 'vpp_recommendation':
      return <Zap className={iconClass} />;
    case 'hot_water':
      return <Droplets className="w-6 h-6 text-blue-400" />;
    case 'heating_cooling':
      return <Flame className="w-6 h-6 text-orange-500" />;
    case 'ev_analysis':
    case 'ev_charger':
      return <Car className={iconClass} />;
    case 'pool_heat_pump':
      return <Droplets className="w-6 h-6 text-blue-400" />;
    case 'environmental_impact':
      return <Leaf className="w-6 h-6 text-green-500" />;
    case 'contact':
      return <Phone className={iconClass} />;
    default:
      return <Zap className={iconClass} />;
  }
}

// Full slide renderer for export/preview
export function FullSlideRenderer({ slide }: { slide: SlideData }) {
  const content = slide.content as Record<string, unknown>;
  
  return (
    <div className="w-full aspect-video bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-accent/10 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full p-8 flex flex-col">
        {renderSlideContent(slide.slideType, slide.title, content)}
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between text-xs text-muted-foreground">
        <span>Lightning Energy</span>
        <span>Slide {slide.slideNumber}</span>
      </div>
    </div>
  );
}

function renderSlideContent(slideType: string, title: string, content: Record<string, unknown>) {
  switch (slideType) {
    case 'cover':
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Zap className="w-16 h-16 text-primary mb-6" />
          <h1 className="text-4xl font-bold text-primary mb-2" style={{ fontFamily: 'NextSphere, sans-serif' }}>
            ELECTRIFICATION PROPOSAL
          </h1>
          <p className="text-xl text-foreground mb-8">{content.customerName as string}</p>
          <p className="text-muted-foreground">{content.customerAddress as string}</p>
          <p className="text-sm text-muted-foreground mt-4">{content.date as string}</p>
        </div>
      );
      
    case 'executive_summary':
      return (
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-primary mb-8" style={{ fontFamily: 'NextSphere, sans-serif' }}>
            {title}
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <StatBox label="Current Annual Cost" value={`$${(content.currentAnnualCost as number)?.toLocaleString()}`} />
            <StatBox label="Total Annual Savings" value={`$${(content.totalAnnualSavings as number)?.toLocaleString()}`} accent />
            <StatBox label="Payback Period" value={`${content.paybackYears} years`} />
            <StatBox label="Net Investment" value={`$${(content.netInvestment as number)?.toLocaleString()}`} />
          </div>
        </div>
      );
      
    case 'bill_analysis':
      return (
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-primary mb-8" style={{ fontFamily: 'NextSphere, sans-serif' }}>
            {title}
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <StatBox label="Daily Average" value={`${(content.dailyAverageKwh as number)?.toFixed(1)} kWh`} />
            <StatBox label="Monthly Usage" value={`${(content.monthlyUsageKwh as number)?.toFixed(0)} kWh`} />
            <StatBox label="Yearly Usage" value={`${(content.yearlyUsageKwh as number)?.toLocaleString()} kWh`} />
            <StatBox label="Projected Annual Cost" value={`$${(content.projectedAnnualCost as number)?.toLocaleString()}`} accent />
          </div>
        </div>
      );
      
    case 'vpp_comparison':
      const providers = content.providers as Array<{ provider: string; estimatedAnnualValue: number; hasGasBundle: boolean }>;
      return (
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-primary mb-6" style={{ fontFamily: 'NextSphere, sans-serif' }}>
            {title}
          </h2>
          <div className="space-y-3">
            {providers?.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold">{i + 1}</span>
                  <span className="text-foreground">{p.provider}</span>
                  {p.hasGasBundle && (
                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded">Gas Bundle</span>
                  )}
                </div>
                <span className="text-primary font-semibold">${p.estimatedAnnualValue?.toFixed(0)}/yr</span>
              </div>
            ))}
          </div>
        </div>
      );
      
    case 'financial_summary':
      return (
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-primary mb-8" style={{ fontFamily: 'NextSphere, sans-serif' }}>
            {title}
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <StatBox label="Total Investment" value={`$${(content.totalInvestment as number)?.toLocaleString()}`} />
            <StatBox label="Total Rebates" value={`-$${(content.totalRebates as number)?.toLocaleString()}`} accent />
            <StatBox label="Net Investment" value={`$${(content.netInvestment as number)?.toLocaleString()}`} />
            <StatBox label="Payback Period" value={`${content.paybackYears} years`} accent />
          </div>
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-center text-lg">
              Annual Savings: <span className="text-primary font-bold">${(content.totalAnnualSavings as number)?.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
      
    case 'contact':
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Zap className="w-12 h-12 text-primary mb-6" />
          <h2 className="text-2xl font-bold text-primary mb-2" style={{ fontFamily: 'NextSphere, sans-serif' }}>
            GET STARTED TODAY
          </h2>
          <p className="text-lg text-foreground mb-6">Prepared by {content.preparedBy as string}</p>
          <p className="text-muted-foreground mb-1">{content.title as string}</p>
          <p className="text-primary font-semibold mb-6">{content.company as string}</p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 justify-center">
              <MapPin className="w-4 h-4" />
              <span>{content.address as string}</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Phone className="w-4 h-4" />
              <span>{content.phone as string}</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Mail className="w-4 h-4" />
              <span>{content.email as string}</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Globe className="w-4 h-4" />
              <span>{content.website as string}</span>
            </div>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-primary mb-8" style={{ fontFamily: 'NextSphere, sans-serif' }}>
            {title}
          </h2>
          <div className="text-muted-foreground">
            {Object.entries(content).map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="text-foreground">{formatKey(key)}: </span>
                <span>{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${accent ? 'border-primary bg-primary/10' : 'border-border bg-gray-900/50'}`}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}

function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value ?? '-');
}
