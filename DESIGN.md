# Design System Specification: Dark Luxury & Tactical Craft

## 1. Overview & Creative North Star
**Creative North Star: "The Obsidian Atelier"**

This design system is built to evoke the tactile, sensory experience of a high-end grooming studio. It moves away from the sterile "SaaS-blue" world and into a space defined by heavy materials: oiled leather, cold steel, and polished dark wood. 

To achieve a signature editorial feel, we reject the "bootstrap" grid. We favor **intentional asymmetry**—offsetting headlines, using generous "breathing room" (negative space), and overlapping elements to create a sense of depth and curated craft. The goal is not just to show information, but to present it with the authority of a premium lifestyle brand.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
Our palette is rooted in deep blacks and charcoals, punctuated by the "Gold" of a master craftsman’s tools.

### Core Palette
- **Primary (The Signature):** `#0A0A0A` (Deepest Obsidian)
- **Surface (The Floor):** `#141414` (Neutral Base)
- **Surface-2 (The Bench):** `#1E1E1E` (Raised Elements)
- **Accent (The Tool):** Gold `#C9A84C` | Gold-muted `#8A6F2E`
- **Typography:** Smoke `#F5F5F0` (Off-white, high-contrast) | Muted `#8A8A85` (Sub-labels)

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning or layout. Traditional dividers feel cheap and digital. Instead:
- **Background Shifts:** Define sections by transitioning from `surface` to `surface-container-low`.
- **Soft Gradients:** Use a subtle radial gradient (Primary to Surface-2) in the background to create a "spotlight" effect under key content.

### Glass & Texture
To avoid a flat "black box" look, use **Glassmorphism** for floating elements (like navigation bars or hovering price cards). 
- **Effect:** Background Blur (20px) + Surface Color at 70% opacity. 
- **Signature Gradient:** Apply a 15% linear gradient to Primary CTAs, moving from `Gold-muted` to `Gold` at a 45-degree angle. This mimics the sheen of polished brass.

---

## 3. Typography: Editorial Authority
We use a high-contrast typographic pairing to signal both heritage (Serif) and modern precision (Sans/Mono).

- **Display & Headlines (Playfair Display):** These are our "hooks." Use large scales (`display-lg`) with tighter letter-spacing (-2%) to create a heavy, editorial impact.
- **UI & Body (DM Sans):** Our workhorse. Used for functional clarity. Maintain generous line heights (1.6) to ensure the dark background doesn't "crush" the legibility of the text.
- **Prices & Metadata (DM Mono):** A nod to the tactical nature of the craft. All pricing and time durations must be set in DM Mono to feel like a technical specification or a vintage receipt.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is a physical property. We "stack" materials rather than casting artificial shadows.

- **The Layering Principle:** 
    - Base Level: `surface`
    - Section Level: `surface-container-low`
    - Card Level: `surface-container-highest` (creates a natural "lift" via color contrast).
- **Ambient Shadows:** Standard drop shadows are forbidden. When an element must float (e.g., a modal), use a wide, 64px blur shadow tinted with `#000000` at 40% opacity. It should look like a soft glow of darkness, not a hard edge.
- **The "Ghost Border":** If accessibility requires a container edge, use the `outline-variant` at 15% opacity. This creates a "glint" on the edge of the material, similar to light hitting a sharp blade.

---

## 5. Components: Functional Elegance

### Buttons
- **Primary:** `Gold` background, `Primary` text. 4px radius. No border.
- **Secondary:** `Surface-2` background, `Smoke` text. 
- **Tertiary:** `Smoke` text with a 1px `Ghost Border`.

### Input Fields
- **Styling:** 4px radius. Background: `surface-container-lowest`. 
- **Focus State:** 2px solid `#C9A84C` with a 2px offset. This "gap" between the field and the ring is crucial for the premium aesthetic.

### Cards & Lists
- **Rule:** Absolute prohibition of divider lines between list items. 
- **Alternative:** Use 24px of vertical whitespace (`spacing-8`) or a subtle hover state shift to `surface-container-high`.
- **Nesting:** Price items within a list should always be right-aligned in `DM Mono` to create a vertical "column of value."

### Custom Component: "The Service Blade"
A specialized card for barber services. Use a `surface-2` container with an 8px radius. The service name is `headline-sm` (Playfair), and the price is a floating `DM Mono` element in the top right, accented in `Gold`.

---

## 6. Do's and Don'ts

### Do
- **Embrace the Void:** Use massive amounts of whitespace. If you think there's enough space, add 20% more.
- **Micro-interactions:** Use slow, elegant transitions (300ms ease-in-out). Elements should feel heavy, not "bouncy."
- **Niche Alignment:** Use asymmetrical layouts—e.g., a left-aligned headline with a right-aligned descriptive paragraph below it.

### Don't
- **Don't use pure white:** `#FFFFFF` is too harsh for this system. Always use `Smoke (#F5F5F0)`.
- **Don't use icons as primary navigation:** This is an editorial system; let the typography lead. Icons should only be supportive accents.
- **Don't use standard shadows:** If the elevation isn't achieved through background color shifts, re-evaluate the layout before reaching for a drop shadow.

---

## 7. Spacing Scale
Our spacing is intentionally larger than standard UI to prevent the "dark" theme from feeling claustrophobic.
- **Small (Inputs/Internal):** `0.7rem (2)` or `1rem (3)`
- **Medium (Sections):** `2.75rem (8)`
- **Large (Hero/Editorial):** `5.5rem (16)` to `8.5rem (24)`