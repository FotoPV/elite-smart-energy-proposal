# Screenshot Comparison Notes

## Reference Screenshot Key Details:
1. "BILL ANALYSIS" heading in NextSphere-ExtraBold font, white color, large size
2. Subtitle "View and download your electricity bill analysis" in grey/ash color
3. Dark card (rounded, thin border) containing:
   - FileText icon (aqua) on left
   - "BILL ANALYSIS" title in NextSphere font, white
   - "Bill Analysis.pdf" subtitle in grey
   - "Open" button (ghost, aqua text with external link icon)
   - "Download" button (filled aqua with download icon)
4. Below the card: slides are displayed as large preview cards
   - Cover slide shows full content (Lightning Energy logo, title, customer name, address, hero image)
   - Executive Summary slide partially visible below
   - Slides appear to be rendered at full width within a scrollable container
   - NO white scrollbars visible - slides appear as clean cards
5. NO action buttons (Recalculate, Regenerate, Update & Publish) visible at bottom
6. Dark background throughout, thin aqua/dark borders on cards
7. The slide previews look like properly scaled-down versions of the actual slides
8. The subtitle under BILL ANALYSIS in the card says "Bill Analysis.pdf" not "Customer — Electrification Proposal for..."

## Differences from Current Implementation:
- Current shows "Customer — Electrification Proposal for Jared Blode" instead of "Bill Analysis.pdf"
- Current has visible white scrollbars on slide iframes
- Current has Recalculate, Regenerate, Update & Publish buttons at bottom
- Need to remove/hide the action buttons or move them
- Slides should render as clean cards without scrollbars
