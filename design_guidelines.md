# Design Guidelines: Art Educator & Handmade Business Website

## Design Approach
**Reference-Based Approach** drawing inspiration from Etsy's product showcases, Behance's portfolio layouts, and Squarespace's artistic templates, tailored for an elegant art education and e-commerce experience.

## Core Design Principles
- Artistic minimalism: Generous whitespace to let artwork breathe
- Visual-first hierarchy: Images are primary content, text supports
- Gentle elegance: Soft, flowing layouts without harsh edges
- Trust and warmth: Professional yet approachable

---

## Typography System

**Font Families:**
- Primary (Headings): Playfair Display or Cormorant Garamond (serif, elegant)
- Secondary (Body): Inter or Nunito Sans (clean, readable)
- Accent (CTAs/Labels): Montserrat (contemporary)

**Hierarchy:**
- Hero Headlines: text-5xl to text-7xl, font-light
- Section Titles: text-3xl to text-4xl, font-normal
- Product/Class Titles: text-xl to text-2xl, font-medium
- Body Text: text-base to text-lg, leading-relaxed
- Captions: text-sm, tracking-wide, uppercase for labels

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 (e.g., p-4, gap-8, my-12, py-20)

**Container Structure:**
- Full-width sections: w-full with inner max-w-7xl mx-auto px-6
- Content sections: max-w-6xl mx-auto
- Text-heavy content: max-w-4xl
- Product grids: max-w-7xl

**Responsive Grid Patterns:**
- Product Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Gallery Masonry: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Feature Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Class/Workshop Cards: grid-cols-1 lg:grid-cols-2

**Vertical Rhythm:**
- Section padding: py-16 md:py-20 lg:py-24
- Card/Component spacing: space-y-8 or gap-8
- Content blocks: mb-12 to mb-16

---

## Component Library

### Navigation
- Sticky header with transparent-to-solid scroll transition
- Logo left, navigation center/right
- Icons for cart and user account
- Mobile: Slide-out hamburger menu with full-screen overlay

### Hero Section (Home)
- Full-width, 85vh height with elegant background image
- Centered content overlay with blurred-background buttons
- Primary CTA: "Shop Collection", Secondary: "Explore Classes"
- Subtle scroll indicator at bottom

### Product Cards
- 4:5 aspect ratio images with soft rounded corners (rounded-lg)
- Hover: subtle lift effect (shadow-lg)
- Title, brief description (2 lines max), price display
- "Add to Cart" or "View Details" button
- "Custom Order" badge for customizable items

### Category Showcases (Home)
- Large featured image (60% width) paired with text content (40%)
- Alternating left/right layout pattern
- Each category: Handmade Décor, Art Classes, Workshops
- Include brief description and "Explore" link

### Class/Workshop Cards
- Horizontal card layout on desktop, stacked on mobile
- Left: Square thumbnail image
- Right: Title, details (duration, level, format), price, "Register" CTA
- Availability indicator (seats remaining)
- Icons for online/offline, age group

### Gallery Grid
- Masonry layout with varying image heights
- Lightbox on click for full-size view
- Category filter tabs at top
- Minimal captions on hover overlay

### Forms
- Clean, spacious field layouts with ample padding (p-4)
- Labels above inputs, hint text below
- Rounded input fields (rounded-md)
- Primary button for submit
- Custom order form: textarea for requirements, file upload option

### Testimonials
- Card-based layout with quote, author name, role
- Small circular avatar (optional)
- 2-column grid on desktop, single column mobile
- Rotation/carousel for multiple testimonials

### Footer
- Three-column layout: About/Links, Quick Links, Contact & Social
- Newsletter signup with inline form
- Trust indicators (payment methods, certifications)
- Generous padding: py-16

---

## Images

**Large Hero Image:**
- Home page: Full-width artistic workspace or finished artwork display
- Warm, inviting scene showing art supplies, creative process, or beautiful finished pieces
- Soft focus or subtle overlay to ensure text readability

**Additional Image Placements:**
- About page: Professional portrait of the artist/educator in creative setting
- Gallery: High-quality product/artwork photos with consistent lighting
- Classes page: Header image of classroom/workshop environment
- Workshops page: Past workshop photos showing participants engaged
- Category showcases: Lifestyle images of products in home settings
- Product cards: Clean, well-lit product photography on neutral backgrounds

**Image Treatment:**
- Consistent aspect ratios per section
- Soft rounded corners (rounded-lg to rounded-xl)
- Subtle shadows for depth
- Ensure high resolution for zoom/detail views

---

## Page-Specific Layouts

### Shop Page
- Filter sidebar (collapsible on mobile): Categories, price range, availability
- Product grid with pagination
- "Custom Order" prominent CTA button in header
- Sticky "View Cart" footer button when items added

### Cart & Checkout
- Side-by-side layout: Cart items (left 60%), Order summary (right 40%)
- Editable quantities, remove item option
- Clear pricing breakdown
- Progress indicator: Cart → Details → Payment → Confirmation

### Admin Dashboard
- Sidebar navigation with sections: Products, Orders, Classes, Workshops
- Data tables with search, filter, sort capabilities
- Quick stats cards at top (total orders, upcoming classes, revenue)
- Action buttons: Edit, Delete, Mark Complete

---

## Interaction Patterns

**Minimal Animations:**
- Fade-in on scroll for section reveals
- Smooth transitions for hover states (200ms)
- Cart icon shake/pulse when item added
- NO complex scroll-driven animations or parallax effects

**Buttons with Image Overlays:**
- Backdrop blur: backdrop-blur-sm
- Semi-transparent background
- Maintains readability over any image
- Built-in hover states handle all contexts

---

## Mobile Optimization
- Touch-friendly tap targets (min 44x44px)
- Single column layouts for content
- Simplified navigation (hamburger menu)
- Sticky bottom CTAs for key actions
- Optimized image sizes for performance

---

This design creates an elegant, gallery-like experience that elevates the artwork while maintaining clear paths to purchase, register, and engage with the art educator's offerings.