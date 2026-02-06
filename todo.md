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
- [x] Burnt orange secondary (#F36710)
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
- [ ] Remove all orange colors from dashboard UI (orange only for exported slides)


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
