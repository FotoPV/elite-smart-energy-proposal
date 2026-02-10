# Lightning Energy Proposal Generator - TODO

## Core Features

### Authentication & Access Control
- [x] Secure team authentication with Manus OAuth
- [x] Role-based access control (admin/user roles)
- [x] Dashboard layout with Lightning Energy branding

### Bill Upload & Data Extraction
- [x] Drag-and-drop bill upload interface for PDFs
- [x] AI-powered OCR extraction for electricity bills
- [x] AI-powered OCR extraction for gas bills
- [x] Parse retailer info, usage data, tariff rates, billing periods

### Customer Profile Management
- [x] Customer creation form (name, address, state)
- [x] Optional inputs: gas appliances list
- [x] Optional inputs: pool information
- [x] Optional inputs: EV interest/ownership
- [x] Optional inputs: existing solar system details

### Calculation Engine
- [x] Usage projections (daily, monthly, yearly)
- [x] Gas-to-electric conversion formulas
- [x] Heat pump savings calculations
- [x] VPP income estimation
- [x] EV savings calculations
- [x] Payback period calculations
- [x] Total savings summary

### VPP Provider Comparison
- [x] Database of 13 VPP providers (schema ready)
- [x] State-specific availability filtering
- [x] Gas+electricity bundle analysis
- [x] Provider ranking by estimated annual value
- [x] Seed VPP provider data (admin endpoint)

### Proposal Generation
- [x] 25-slide structure implementation
- [x] Conditional slide logic (gas, pool, existing solar)
- [x] Cover page with customer details
- [x] Executive summary auto-generation
- [x] All calculation slides auto-populated

### Proposal History & Management
- [x] Proposal list dashboard
- [x] Search functionality
- [x] Filter by status, date, customer
- [x] View proposal details
- [x] Edit/regenerate proposals
- [x] Delete/archive proposals

### Export Functionality
- [x] HTML export with Lightning Energy branding
- [x] JSON data export
- [x] Black background, aqua/orange accents
- [x] Custom fonts (NextSphere, GeneralSans)
- [ ] PDF export (requires external service)
- [ ] PowerPoint export (requires external service)

### Reference Data
- [x] State-specific rebate database
- [x] Seed state rebate data (admin endpoint)
- [x] VPP provider reference data

## Design & Branding
- [x] Dark theme with black background (#000000)
- [x] Aqua accent color (#00EAD3)
- [x] Burnt orange secondary (#E8731A)
- [x] Custom fonts integration
- [x] Lightning Energy logo placement
- [x] Copyright footer: "COPYRIGHT Lightning Energy - Architect George Fotopoulos"

## Quality & Polish
- [x] Loading states and skeletons
- [x] Error handling and validation
- [x] Responsive design
- [x] Unit tests for calculations (27 tests)
- [x] Auth logout test (1 test)
- [x] Document tests (7 tests)
- [x] Slide generator tests (15 tests)
- [x] All 50 tests passing
- [x] Analytics dashboard with aggregate engagement metrics


## New Features (Feb 6)
- [x] Fix API error returning HTML instead of JSON on dashboard
- [x] Add photo upload for electrical switchboards (switchboard, meter, roof, property photos)
- [x] Add PDF upload for solar proposals
- [x] Add Documents tab to Customer Detail page
- [x] Add drag-and-drop upload functionality
- [x] Add image preview dialog
- [x] Add customer documents database table

## New Features (Feb 6 - Part 2)
- [x] Add Solar Proposal PDF upload to New Proposal wizard (Bills step)
- [x] Add Switchboard Photo upload to New Proposal wizard (Bills step)


## Branding Update (Feb 6)
- [x] Upload Lightning Energy logo to S3 CDN
- [x] Upload custom fonts to S3 CDN (GeneralSans, NextSphere, Urbanist)
- [x] Update CSS with exact brand colors (Aqua #00EAD3, Orange #f36710, Ash #808285, White #FFFFFF)
- [x] Configure custom fonts in CSS (@font-face)
- [x] Update logo references throughout application
- [x] Apply brand colors sparingly (aqua for logo/graphs only)
- [x] Create professional slide generator matching example PDF design
- [x] Add SlideViewer component with navigation and fullscreen
- [x] Add getSlideHtml API endpoint
- [x] Unit tests for slide generator (15 tests passing)
- [x] 50 total unit tests passing


## New Features (Feb 6 - Part 3)
- [x] Add edit/change/replace option for uploaded documents
- [x] Add PDF export using Puppeteer for branded slide exports
- [x] Add AI switchboard analysis using LLM vision to extract circuit details
- [x] Implement auto-seeding of VPP providers (13 providers)
- [x] Implement auto-seeding of state rebates


## Bug Fix (Feb 6)
- [x] Remove all orange colors from dashboard UI (orange only for exported slides)


## Bug Fix (Feb 6)
- [x] Remove all orange colors from dashboard UI except icons (orange only for icons and exported slides)


## Publish PDF Feature (Feb 6)
- [x] Add "Publish PDF" button to proposal detail page
- [x] Update slide generator to match Paul Stokes SA example exactly
- [x] Generate professional PDF with correct branding and layout


## Layout Fix (Feb 6)
- [x] Position all bottom tabs on the left-hand side


## New Tasks (Feb 6 - Part 4)
- [x] Seed VPP providers reference data (13 providers)
- [x] Seed state rebates reference data
- [ ] Test complete workflow (create proposal, upload bill, generate slides, publish PDF)
- [ ] Add email delivery integration for generated proposals


## Bug Fix - PDF Export (Feb 6)
- [x] Install Chrome for Puppeteer to fix PDF export error


## Update and Publish Feature (Feb 6)
- [x] Add "Update & Publish" button to proposal detail page
- [x] Button recalculates, regenerates slides, then exports PDF in one click


## Customer Portal Feature (Feb 6)
- [x] Add secure access token system for customer proposal links
- [x] Create customer portal page with branded proposal view
- [ ] Add share link generation button in proposal detail page
- [ ] Add link expiry and access tracking
- [ ] Customer can view proposal slides and download PDF


## Progress Indicator Feature (Feb 6)
- [x] Add time/percentage icon showing slide generation progress
- [x] Show completion status during Update & Publish workflow


## Dashboard Branding Update (Feb 6 - CRITICAL)
- [x] Update dashboard to use Lightning Energy brand fonts (NextSphere-ExtraBold for headings, GeneralSans-Regular for body)
- [x] Upload brand fonts to S3 CDN for dashboard use
- [x] Ensure dashboard uses exact brand colors: Black bg, Aqua (#00EAD3), Ash (#808285), White (#FFFFFF)
- [x] NO orange in dashboard UI (only in icons and exported slides)
- [x] Update DashboardLayout with Lightning Energy logo
- [x] Apply fonts consistently across all dashboard pages
- [x] Complete customer portal share link button
- [x] Test customer portal access flow


## Production PDF Generation Fix (Feb 6)
- [ ] Fix Update & Publish button for production environment
- [ ] Ensure Chrome/Puppeteer works in deployed environment


## Add Missing Slides for 25-Slide Structure (Feb 6)
- [x] Add Executive Summary slide (Slide 2)
- [x] Add Yearly Cost Projection slide (Slide 5)
- [x] Add Current Gas Footprint slide (conditional - Slide 6)
- [x] Add Gas Appliance Inventory slide (conditional - Slide 7)
- [x] Add Hot Water Electrification slide (conditional - Slide 13)
- [x] Add Heating & Cooling Upgrade slide (conditional - Slide 14)
- [x] Add Induction Cooking Upgrade slide (conditional - Slide 15)
- [x] Add EV Charger Recommendation slide (Slide 17)
- [x] Add Pool Heat Pump slide (conditional - Slide 18)
- [x] Add Full Electrification Investment slide (conditional - Slide 19)
- [x] Add Environmental Impact slide (Slide 22)
- [x] Add HTML rendering for all new slide types


## Add All 13 VPP Providers (Feb 6)
- [x] Add Energy Locals
- [x] Add Powershop
- [x] Add Red Energy
- [x] Add Momentum Energy
- [x] Add Lumo Energy
- [x] Add Alinta Energy
- [x] Add Tango Energy
- [x] Add GloBird Energy


## Proposal Analytics Tracking (Feb 6)
- [x] Add proposal_views database table (proposal_id, access_token, viewed_at, ip_address, user_agent, duration_seconds)
- [x] Add slide_engagement database table (proposal_id, slide_index, slide_type, time_spent_seconds, viewed_at)
- [x] Add public tracking API endpoints (record view, record slide engagement, update duration)
- [x] Add tracking JavaScript to customer portal (auto-track page views, slide time, heartbeat)
- [x] Add analytics dashboard section to proposal detail page (view count, unique visitors, slide engagement bars)
- [x] Device breakdown display (desktop/mobile/tablet)
- [x] Recent views list with browser/OS/IP info
- [x] Write unit tests for analytics (11 tests passing)
- [x] All 61 tests passing


## Analytics Overview on Main Dashboard (Feb 6)
- [x] Add aggregate analytics API endpoint (total views across all proposals, top viewed proposals, engagement trends)
- [x] Add analytics overview cards to main dashboard (total views, unique visitors, most viewed proposal)
- [x] Add top proposals by engagement list
- [x] Add recent activity feed
- [x] Add views trend bar chart (last 7 days)

## Proposal Expiry Notifications (Feb 6)
- [x] Add expiry check logic for shared proposal links
- [x] Add notification when links are expiring within 7 days
- [x] Add notification banner on dashboard for expiring links (amber warning)
- [x] Add bulk expiry check on dashboard load
- [x] Show "Never viewed" badge for expired unviewed tokens
- [x] Add regenerate link shortcut from notification banner
- [x] Write tests for expiry notification logic (7 tests)
- [x] All 68 tests passing


## Bug Fix - Dashboard Analytics SQL Error (Feb 6)
- [x] Fix DATE() function error in getAggregateAnalytics query
- [x] Use raw SQL compatible with TiDB/MySQL for date grouping


## Critical Fix - PDF Export in Production (Feb 6)
- [x] Replace Puppeteer-based PDF generation with client-side approach (jsPDF + html2canvas-pro)
- [x] Update & Publish button now generates PDF in browser, no Chrome needed
- [x] Publish PDF button also uses client-side generation
- [x] PDF uploaded to S3 after generation for storage
- [x] Progress bar shows slide-by-slide rendering progress

## Bug Fix - Dashboard Analytics SQL Error (Feb 6)
- [x] Fix DATE() function error in getAggregateAnalytics query
- [x] Use DATE_FORMAT('%Y-%m-%d') compatible with TiDB/MySQL


## Remove Share with Customer & Fix Fonts (Feb 6)
- [x] Remove "Share with Customer" button from ProposalDetail page
- [x] Upload all brand fonts (GeneralSans-Regular, NextSphere-ExtraBold, Urbanist-SemiBold, Urbanist-SemiBoldItalic) to CDN
- [x] Update CSS to use NextSphere-ExtraBold for headings ONLY
- [x] Update CSS to use GeneralSans-Regular for body text and numbers
- [x] Update CSS to use Urbanist-SemiBold for UI elements/buttons
- [x] Ensure fonts load correctly across entire dashboard
- [x] Go light on aqua - only logo and graph bars


## CRITICAL: Match Best Example PDF Design (Feb 6)
- [x] Dashboard: Replace solid aqua engagement cards with thin aqua-bordered cards on black bg
- [x] Dashboard: Fix stat cards to use thin aqua borders, grey labels uppercase, aqua numbers
- [x] Dashboard: Fix quick action cards to use thin grey borders
- [x] Dashboard: Ensure all fonts match (NextSphere headings, GeneralSans body, Urbanist UI)
- [x] Dashboard: Go light on aqua - borders only, no solid fills
- [x] Slides: Complete rewrite of all 25 slide HTML generators to match Paul Stokes best example
- [x] Slides: Right-aligned aqua italic subtitles, thin aqua line separators
- [x] Slides: Insight cards with colored left borders on dark grey bg
- [x] Slides: Correct color usage (aqua #00EAD3 savings, orange #E8731A costs, grey #808285 labels)
- [x] Slides: Proper font hierarchy (NextSphere headings, GeneralSans body, Urbanist labels)
- [x] Fix pdfUpload module error in server
- [x] Updated BRAND orange color from #f36710 to #E8731A to match best example
- [x] All 68 tests passing


## Bin/Trash Tab for Proposals (Feb 6)
- [x] Add soft-delete (deletedAt) column to proposals table
- [x] Add "Move to Bin" action on proposals (delete now soft-deletes)
- [x] Add Bin tab in sidebar under Proposals section
- [x] Add Bin page showing deleted proposals with customer name and delete date
- [x] Add "Restore" and "Permanently Delete" actions in Bin
- [x] Add "Empty Bin" button with confirmation dialog
- [x] Filter deleted proposals from main proposals list
- [x] All 68 tests passing


## MAJOR REDESIGN - Strip to Core Purpose (Feb 6)

### REMOVED (Bloat Features)
- [x] Remove Dashboard analytics overview (engagement stats, views trends, device breakdown)
- [x] Remove Proposal expiry notifications
- [x] Remove Customer Portal page and share link functionality
- [x] Remove Analytics tracking endpoints from routers
- [x] Remove Aggregate analytics endpoints
- [x] Remove Quick action cards from dashboard
- [x] Remove "Share with Customer" related code
- [x] Remove engagement analytics from ProposalDetail page
- [x] Remove Customers page, CustomerDetail page, Settings page
- [x] Delete unused page files

### KEPT (Core Features)
- [x] Customer entry form with bill uploads (electricity + optional gas)
- [x] Proposal generation engine (25 slides, 13 VPP providers, all calculations)
- [x] Clean proposal database list
- [x] PDF export (Publish PDF button)
- [x] Bin for deleted items
- [x] Slide HTML generators (core product)

### REBUILT (Clean Design)
- [x] Rebuild sidebar: New Proposal, Proposals, Bin (3 items only)
- [x] Home page redirects to New Proposal when authenticated
- [x] Clean ProposalDetail page - overview + slides tabs + Publish PDF
- [x] All fonts strictly follow brand (NextSphere headings, GeneralSans body, Urbanist UI)
- [x] Black background, thin aqua borders, no solid fills
- [x] All 68 tests passing


## Bug Fix - /dashboard 404 Error (Feb 6)
- [x] Add /dashboard redirect route to /proposals/new in App.tsx


## Bill Analysis Page Design (Feb 6)
- [x] Redesign ProposalDetail to match Bill Analysis screenshot
- [x] "BILL ANALYSIS" heading in NextSphere font at top
- [x] Dark card with document icon, "BILL ANALYSIS" title, filename, Open and Download buttons
- [x] Slide preview showing all slides scrollable below
- [x] Aqua accent on Open button, filled aqua on Download button
- [x] Clean dark background with thin borders matching brand
- [x] Removed tabs (overview/slides) - now single scrollable view
- [x] All 68 tests passing


## Brand Assets & Slide Font/Color Fix (Feb 6)
- [x] Upload fresh brand fonts to CDN (GeneralSans-Regular, NextSphere-ExtraBold, Urbanist-SemiBold, Urbanist-SemiBoldItalic)
- [x] Upload Lightning Energy aqua logo to CDN
- [x] Upload SLIDE COVER PAGE background image to CDN
- [x] Update brand.ts with fresh CDN URLs for all fonts and logo
- [x] Fix orange color from #E8731A to correct brand orange #f36710 in all slides
- [x] Fix hero-num font from NextSphere to GeneralSans (NextSphere is headings only)
- [x] Add cover slide background image from SLIDE COVER PAGE PDF
- [x] Fix SlidePreview iframe to use full HTML document (preserves @font-face declarations)
- [x] Update PDF generation to use iframe rendering for proper font loading
- [x] Update slide dimensions from 1120x630 to 1920x1080
- [x] All 68 tests passing


## Reusable Skill Creation (Feb 6)
- [x] Create lightning-energy-proposal-generator skill using /skill-creator
- [x] SKILL.md with 6-phase workflow (182 lines, under 500 limit)
- [x] references/brand-assets.md - CDN URLs, colour palette, typography rules, contact details
- [x] references/vpp-providers.md - 13 nationwide VPP providers with gas bundle data
- [x] references/calculations.md - All formulas + ProposalData TypeScript interface
- [x] references/slide-structure.md - 25-slide breakdown, HTML patterns, CSS design specs
- [x] templates/ - All brand fonts, logo, colour palette image, cover page PDF
- [x] Skill validated successfully


## Bug Fix - "Run calculations first" Error (Feb 6)
- [x] Fix proposal detail page throwing "Run calculations first" when generating slides
- [x] Ensure calculations run automatically before slide generation
- [x] Auto-calculate in generate, getSlideHtml, and exportPdf server procedures
- [x] Simplified empty state to single "Generate Slides" button (auto-calculates)
- [x] All 68 tests passing


## Follow-up Improvements (Feb 6)
- [x] Test the auto-calculate fix on /proposals/60002
- [ ] Add multi-step progress indicator (Calculating → Generating → Done) to Generate Slides flow
- [x] Auto-generate slides on proposal creation so users land on completed slides view


## Bug Fix - Missing Bill Data in Slides (Feb 6)
- [x] Fix missing monthly/yearly usage data in slides
- [x] Fix missing bill charges breakdown (tariff rates, supply charges) in slides
- [x] Carry full bill extraction data through calculations → ProposalData → slide generator


## In-Depth Analysis Enhancement (Feb 6)
- [x] Carry full bill extraction data (all tariff rates, charges, billing period) into ProposalData
- [x] Show daily/monthly/yearly usage breakdowns in Usage Analysis slide
- [x] Show peak/off-peak/shoulder usage split with rates in Bill Breakdown slide
- [x] Show detailed supply charges, usage charges, solar credits in charges breakdown
- [x] Show gas MJ→kWh conversion details in Gas Analysis slide
- [x] Show detailed heat pump COP calculations in Hot Water slide
- [x] Show detailed RC AC vs gas heating comparison in Heating/Cooling slide
- [x] Show VPP provider comparison with daily credits, event payments, bundle discounts
- [x] Show EV charging cost calculations with km/year assumptions
- [x] Show 25-year projection with year-by-year savings detail
- [x] Add multi-step progress indicator for generate flow (via export dropdown)
- [x] Auto-generate slides on proposal creation
- [x] Enforce strict font rules: NextSphere HEADINGS ONLY, GeneralSans for body/numbers, Urbanist for labels
- [x] Audit every slide HTML generator for font compliance


## Slides-Only Delivery Pivot (Feb 6)
- [x] Replace HTML slide rendering with three native output formats
- [x] Build PowerPoint (.pptx) generator with pptxgenjs + embedded brand fonts
- [x] Build Direct PDF generator with pdfkit + embedded brand fonts (bypass HTML)
- [ ] Build Manus Slides (image mode) content markdown for pixel-perfect rendering
- [x] Wire up export endpoints: exportPptx, exportNativePdf
- [x] Add UI Export dropdown with PDF, PowerPoint, HTML PDF options
- [x] Enforce strict font rules: NextSphere HEADINGS ONLY, GeneralSans body/numbers, Urbanist labels
- [x] Enforce colour palette: Black bg, Aqua (#00EAD3) light usage, Orange (#f36710) minimal accent
- [x] Include Lightning Energy aqua logo on every slide
- [x] Full in-depth data tables: bill charges, tariff rates, usage breakdown, gas analysis
- [x] Each visualization on its own page for clarity
- [x] Professional tone for HIGH LEVEL OF EDUCATED PUBLICS audience


## Bug Fix - Add New Customer 404 Error (Feb 6)
- [x] Fix 404 error when clicking Add New Customer during proposal creation
- [x] Replaced navigation to /customers with inline dialog modal
- [x] Modal includes: Full Name, Email, Phone, Address, State, Gas/Pool/EV checkboxes, Notes
- [x] Auto-selects newly created customer and refreshes customer list


## Major Rebuild - Manus Slides Image Mode (Feb 7)
- [ ] Pivot from HTML/PDFKit slides to Manus Slides (image mode) for pixel-perfect output
- [ ] Build slide content markdown generator that produces rich, data-driven content per slide
- [ ] Match reference project quality: deep analysis, strategic language, specific data points
- [ ] Each slide must tell a story with context and recommendations (not just numbers)
- [ ] Generate slides in batches using Manus Slides tool with image mode
- [ ] Wire up export flow: proposal data → markdown content → Manus Slides → PDF/PPTX output
- [ ] Ensure consistent black backgrounds, minimal style, data-driven layouts
- [ ] Include visual charts (consumption patterns, cost projections, savings comparisons)
- [ ] Include comparison tables (VPP providers, before/after costs)
- [ ] Include implementation roadmap with phases
- [ ] Include environmental quantification with specific metrics


## Multi-File Upload & Remove Gas (Feb 7)
- [x] Enable multiple file upload (photos + PDFs) in upload section — select/drop multiple at once
- [x] Show all queued files with individual progress indicators
- [x] Remove all gas bill upload UI and references
- [x] Remove gas analysis/extraction logic from backend
- [x] Remove gas-related slides (Current Gas Footprint, Gas Appliance Inventory) — always excluded via hasGas=false
- [x] Remove gas conversion calculations from calculation engine — gas always null
- [x] Remove gas fields from customer profile form
- [x] Remove gas bundle column from VPP comparison (keep providers)
- [x] Clean up any remaining gas references throughout the app


## Unlimited Slides & New Slide Types (Feb 10)
- [x] Remove all hard-coded slide count caps (no upper limit on slides)
- [x] Make slide generation fully dynamic based on available data — dynamic renumbering added
- [x] Add new slide type: Tariff Rate Comparison (detailed peak/off-peak/shoulder breakdown)
- [x] Add new slide type: Daily Load Profile (hourly consumption pattern analysis)
- [x] Add new slide type: Solar Generation Profile (monthly solar output vs consumption)
- [x] Add new slide type: Battery Charge/Discharge Cycle (how battery optimises usage)
- [x] Add new slide type: Grid Independence Analysis (self-sufficiency percentage)
- [x] Add new slide type: Rebate & Incentive Breakdown (state-specific rebates detail)
- [ ] Add new slide type: Retailer Comparison (current vs recommended retailer) — deferred, needs external API
- [x] Add new slide type: 25-Year Financial Projection (detailed year-by-year table)
- [x] Add new slide type: System Specifications (technical specs of recommended equipment)
- [x] Add new slide type: Warranty & Maintenance (product warranties and service schedule)
- [x] Update slide generator to include all new types dynamically
- [x] Update HTML templates for all new slide types
- [x] Ensure all slides follow brand guidelines (NextSphere headings, GeneralSans body, no purple)
- [x] Update SlidePreview component with icons for new slide types


## Live Slide Preview During Generation (Feb 10)
- [x] Add streaming/polling endpoint for slide generation progress
- [x] Build split-screen UI: left panel = progress tracker, right panel = live slide preview
- [x] Show each slide rendering in real-time as it completes
- [x] Auto-select latest completed slide for preview
- [x] Show generation status per slide (pending/generating/complete)
- [x] Auto-scroll to latest generated slide in progress list
- [x] Handle errors gracefully with error display per slide
- [x] Wire Regenerate Slides action to live preview mode
- [x] 93 tests passing


## Embed Brand Assets as Defaults in Slide Templates (Feb 10)
- [x] Upload logo PNG and font files to S3 for CDN access in slide HTML
- [x] Embed @font-face declarations for NextSphere-ExtraBold, GeneralSans-Regular, Urbanist-SemiBold in all slide HTML
- [x] Use actual Lightning Energy aqua logo PNG in all slides (header/footer) — BRAND.logo.aqua used everywhere
- [x] Enforce exact color palette: Black #000, White #FFF, Ash #808285, Aqua #00EAD3, Orange #f36710 (minimal)
- [x] Aqua limited to logo and graph bars only — go light on aqua
- [x] Review cover page PDF for layout reference — landscape 16:9 with circuit board motif
- [x] Update brand.ts shared constants with fresh CDN URLs (Feb 10)
- [x] Landscape 16:9 format (1920x1080) confirmed in all slide templates
- [x] 93 tests passing


## Rename Sidebar Tab (Feb 10)
- [x] Rename "Proposals" sidebar tab to "Electricity Bill"
- [x] Update page heading and subtitle to "Electricity Bill"


## Complete Slide Generator Overhaul — Match Frieda Lay Reference (Feb 10)
- [x] Add LLM-powered narrative generation for each slide (contextual, customer-specific paragraphs)
- [x] Each slide calls invokeLLM to generate analysis text based on customer data
- [x] Created slideNarrative.ts with 12 narrative generators
- [x] Created enrichSlideWithNarrative() function in routers.ts
- [x] Updated generateProgressive mutation to call LLM for each slide
- [x] Updated 12 HTML templates to render narrative content (exec summary, bill, usage, yearly, strategic, battery, VPP rec, savings, financial, environmental, roadmap, conclusion)
- [ ] Cover slide: "IN-DEPTH BILL ANALYSIS & SOLAR BATTERY PROPOSAL" title, customer name/address
- [ ] Executive Summary: 4 quadrant cards with rich narrative paragraphs (not bullets)
- [ ] Current Bill Analysis: Hero metrics (annual cost, daily avg, daily usage, daily export) + billing period table
- [ ] Detailed Usage Analysis: Metric cards + monthly bar chart (grid vs solar)
- [ ] Yearly Cost Projection: Before/After comparison cards with logo between
- [ ] Strategic Site Assessment: Infrastructure audit using UPLOADED CUSTOMER PHOTOS
- [ ] Option 1 battery slide: Why recommend + financial breakdown card
- [ ] Option 2 battery slide: Alternative option + financial breakdown card
- [ ] System Comparison: Feature comparison table (two options side by side)
- [ ] VPP Provider Comparison: Full 13-provider table
- [ ] VPP Recommendation: Why + income breakdown table + hero metric
- [ ] Annual Financial Impact: Before/After + itemized savings breakdown + Total Annual Turnaround
- [ ] Investment Analysis: Comparison table + 20-year cumulative cashflow line chart
- [ ] Environmental Impact: 3 metric cards + energy independence score
- [ ] Recommended Roadmap: 4-phase timeline with connecting lines
- [ ] Executive Summary (Final): 3 recommendation cards + "Ready to Proceed?" CTA
- [ ] Next Steps / Contact: 4-step process + George Fotopoulos details
- [ ] Generation takes 5-10 minutes (LLM calls per slide)
- [ ] Side window shows each slide rendering in real-time
- [ ] Dark charcoal card backgrounds (#1a2332), not pure black cards
- [ ] Orange = current cost/problem only, Aqua = savings/solution
- [ ] NextSphere for headings ONLY, GeneralSans for numbers, Urbanist for body
- [ ] Footer on every page: "© Lightning Energy — Architect George Fotopoulos"


## Rename Sidebar Tab (Feb 10 - Part 2)
- [x] Rename "Electricity Bill" sidebar tab to "Bills and Photos"
- [x] Update page heading and subtitle to match


## Home Page Redesign — Match Reference Screenshot (Feb 10)
- [x] Centred Lightning Energy logo + wordmark at top
- [x] Bold NextSphere heading "IN-DEPTH BILL ANALYSIS & PROPOSAL GENERATOR"
- [x] GeneralSans subtitle describing app functionality
- [x] Action buttons row: Upload Bill (aqua outline), Bulk Upload (orange filled), View Bills & Photos (grey outline), View Proposals (grey outline)
- [x] 3 feature cards at bottom with thin grey borders (Automatic Extraction, LLM-Powered Analysis, Instant Proposals)
- [x] Darkest black background throughout
- [x] Rename sidebar tab to "Bills and Photos" (already done)
- [x] Admin: Bill Extraction Analytics link
- [x] Copyright footer: Lightning Energy — Architect George Fotopoulos


## Beta Test — Brian Vuong SA (Feb 10)
- [x] Create customer: Brian Vuong, 69 Sydney St Glenunga SA 5064
- [x] Upload 6 AGL bills (Jul-Jan 2025/2026)
- [x] Upload 3 site photos (meter, switchboard, Fronius inverter)
- [x] Extract bill data via LLM
- [x] Run calculations (solar, battery, VPP, savings, payback)
- [x] Generate full slide deck with LLM narratives
- [x] Verify live side-window preview works
- [x] Review all generated slides for quality
- [ ] Report beta test results (in progress)

- [x] SCRAP old auto-generate slides from proposal creation — only auto-calculate, set status to 'calculated'
- [x] Auto-trigger LiveSlideGeneration on ProposalDetail load when calculations exist but no slides
- [x] Ensure generateProgressive saves LLM-enriched slide HTML to DB
- [x] Remove old generate mutation (non-progressive) — only progressive path remains
- [x] Delete Brian Vuong old proposal and re-test with LLM progressive generation


## Add Missing Slides to Full 25-Slide Deck (Feb 10)
- [ ] Add Tariff Rate Comparison slide to generateSlides()
- [ ] Add Estimated Daily Load Profile slide to generateSlides()
- [ ] Add Solar Generation vs Consumption slide to generateSlides()
- [ ] Add Battery Charge & Discharge Cycle slide to generateSlides()
- [ ] Add Grid Independence Analysis slide to generateSlides()
- [ ] Add Rebate & Incentive Breakdown slide to generateSlides()
- [ ] Add 25-Year Financial Projection slide to generateSlides()
- [ ] Add System Specifications slide to generateSlides()
- [ ] Add Warranty & Maintenance slide to generateSlides()
- [ ] Add enrichSlideWithNarrative cases for all new slide types
- [ ] Re-test Brian Vuong with full slide deck


## REWRITE Slide Generator to Match Frieda Lay SA Reference (Feb 10)
- [x] Rewrite generateSlides() with exact Frieda Lay slide order (17 core slides for no-gas/no-EV/no-pool)
- [x] Add Option 1 (Sigenergy SigenStor) slide type with narrative + financial card
- [x] Add Option 2 (GoodWe ESA) slide type with narrative + financial card  
- [x] Add System Comparison slide type (full-width comparison table)
- [x] Rename savings_summary to annual_financial_impact (before/after + savings breakdown)
- [x] Rename financial_summary to investment_analysis (comparison table + cashflow chart)
- [x] Add Conclusion slide (3 cards: Financial Transformation, Strategic Choice, Urgency + CTA)
- [x] Rewrite all HTML templates to match reference layouts pixel-perfectly
- [x] Add narrative enrichment for all new/changed slide types
- [x] Remove the 9 extra slides that don't exist in reference
- [x] Re-test Brian Vuong with corrected slides matching reference
- [x] Fix [object Object] bug in Next Steps slide
- [x] Fix VPP Recommendation missing features array
- [x] Fix Conclusion missing features/quote/callToAction
- [x] Delete old generateSlidesData() function
- [x] Update SlideData type to new simplified structure
- [x] All 17 slides generating with full LLM narratives


## COMPLETE REWRITE to Match Master Reference (Feb 10)
- [x] Rewrite generateSlides() with exact 22-slide reference order
- [x] Add Bill Breakdown slide (donut chart + metrics)
- [x] Add Usage Benchmarking slide (comparison bar + metric cards)
- [x] Add Solar Recommendation slide (metrics + Why This Config card)
- [x] Add Battery Recommendation slide (metrics + government incentive card)
- [x] Add Why Add a Battery slide (2x2 benefits grid)
- [x] Add Solar Battery Considerations slide (2x2 warnings grid)
- [x] Add EV vs Petrol Vehicle slide (conditional)
- [x] Add Return on Investment slide (line chart + metrics)
- [x] Add Energy Optimisation Report slide (strategies + projected impact)
- [x] Add System Integration slide (conditional, appliance cards with photos)
- [x] Remove Option 1, Option 2, System Comparison, Annual Financial Impact slides
- [x] Rewrite ALL HTML templates to match reference pixel-perfectly
- [x] Update narrative enrichment for all new/changed types
- [x] Test with new customer and verify visual match


## Data Field Mismatch Fixes (Feb 10)
- [x] Fix executive summary field names (dailyUsageKwh→dailyAverageKwh, dailyExportKwh→dailyExport, etc.)
- [x] Fix usage benchmarking field names (yourDailyAverage→dailyAverage, stateAverage→stateAverageKwh)
- [x] Fix solar recommendation field names (annualProduction→annualProductionKwh, dailyProduction→dailyProductionKwh)
- [x] Fix battery recommendation field names (batteryCapacity→capacity, batteryTechnology→technology)
- [x] Fix financial investment field names (add billReductionPct, firstYearSavings, fix lineItems format)
- [x] Fix annual energy projection monthlyData format (usage+solar fields)
- [x] Fix conclusion title from "EXECUTIVE SUMMARY" to "CONCLUSION"
- [x] Remove duplicate EV slides (ev_analysis, ev_charger) — only ev_vehicle_analysis + ev_vs_petrol remain
- [x] Verify all 22 slides render correctly with real data (Frieda Lay SA test)
- [x] All data values populated (no zeros, no NaN, no undefined, no [object Object])


## Fixate Brand Assets Permanently (Feb 10)
- [x] Upload all brand assets to S3 CDN (logo, fonts, palette image)
- [x] Update dashboard CSS @font-face with permanent S3 CDN URLs
- [x] Update dashboard HTML/index.html with permanent font CDN URLs
- [x] Update slide HTML generators with base64-embedded font data URIs (zero CORS)
- [x] Update slide HTML generators with base64-embedded logo data URI (zero CORS)
- [x] Verify color palette is correct everywhere (Black #000000, Aqua #00EAD3, Orange #f36710, Ash #808285, White #FFFFFF)
- [x] Remove any references to local/temporary asset paths
- [x] Test dashboard and slide generation with embedded assets (zero CORS errors confirmed)


## CRITICAL: PDF Sizing Issue Fix (Feb 10)
- [x] Review exported PDF to identify sizing/layout problems
- [x] Fix PDF generation code to ensure correct slide sizing in exported PDF
- [x] Test PDF export with correct sizing (rendering confirmed, session expired before download)
- [x] Fixate all brand assets with base64 data URIs + S3 CDN fallback URLs


## BUG: File Upload Duplication (Feb 10)
- [x] Fix single file uploads appearing twice in the uploaded files list (root cause: refetchDocuments added server entries alongside existing local entries with different IDs)


## Update Contact Details (Feb 10)
- [x] Update George Fotopoulos contact details: title "Renewables Strategist & Designer", phone "1300 009 272 | 0419 574 520", email "george.f@lightning-energy.com.au", website "www.lightning-energy.com.au"


## BUG: Generation Error on WHY ADD A BATTERY slide (Feb 10)
- [x] Fix GENERATION ERROR on why_battery slide — added global try/catch in generateSlideHTML so it can NEVER throw, always returns a valid branded error slide instead of crashing
