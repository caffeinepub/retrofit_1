# RetroFit — Structural Engineering Software

## Current State
New project. No existing files.

## Requested Changes (Diff)

### Add
- Full dashboard-style SPA with left vertical navigation (Home, Start Assessment, Knowledge Hub, Scan to BIM Technology, About Us)
- Navy Blue + Steel Grey + White color scheme, Poppins/Inter fonts, smooth animations
- Home: Hero section, feature cards, CTA
- Start Assessment: 4-step wizard (NDT test selection, dynamic inputs, analysis, retrofitting recommendation + design module launch)
- Column Jacketing Design Module with full IS 15988:2013 calculations, SVG diagrams, Excel download
- Beam Jacketing Design Module with IS 456 calculations, SVG diagrams, Excel download
- Footing Jacketing Design Module with IS 456:2000 calculations, Excel download
- Column FRP Design Module (FIB 2010 / ACI 440.2R), Excel download
- Beam FRP Design Module (ACI 440.2R-17), Excel download
- Knowledge Hub: tabs for Importance, Case Studies (5 Indian), Types of Retrofitting, Step-by-step site processes
- Scan to BIM: workflow explanation, file upload panel (.rcp/.rcs/.e57/CAD/BIM)
- About Us: team cards (M, S, N avatars), contact form
- SheetJS/xlsx for client-side Excel generation
- Footer with IS 15988:2013 compliance notice

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Minimal Motoko backend (contact form submission storage)
2. React frontend with react-router or state-driven navigation
3. Assessment wizard with all 5 design modules as sub-components
4. All engineering calculations implemented in TypeScript utility functions
5. SVG cross-section diagrams for Column and Beam jacketing
6. xlsx library for Excel generation across all modules
7. Knowledge Hub with tabs/cards
8. Scan to BIM with file upload UI
9. About Us with animated team cards and contact form
