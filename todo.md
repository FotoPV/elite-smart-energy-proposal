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
- [ ] Analytics dashboard (Coming soon placeholder)


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
