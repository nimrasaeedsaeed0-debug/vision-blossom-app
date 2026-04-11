

# AI Text-to-Image Generator — Full Build Plan

## Phase 1: Project Structure & Layout
- Set up folder structure: `components/`, `pages/`, `utils/`, `hooks/`, `services/`
- Create shared layout with responsive navbar and footer
- Set up dark mode support with theme toggle
- Configure routing for all pages (Home, Dashboard, Editor, Login, Signup)

## Phase 2: Authentication (Lovable Cloud)
- Enable Lovable Cloud for auth, database, and storage
- Set up Email/Password, Google, and Apple sign-in
- Create Login and Signup pages with clean, minimal design
- Build protected dashboard route (redirects unauthenticated users)
- Create `profiles` table to store user data (display name, avatar, credits)

## Phase 3: Text-to-Image Generation (Core Feature)
- Build hero-style centered prompt input with large text area
- Add controls: image size selector (1:1, 16:9, 9:16) and style presets (Realistic, Anime, Cinematic, Digital Art)
- Create edge function that calls Lovable AI Gateway (Gemini image models) to generate images
- Display 2–4 generated images in a responsive card grid
- Add skeleton loading animation during generation

## Phase 4: Core Features
- Regenerate button (re-run same prompt)
- Download button for each image (high-quality PNG)
- Error handling with toast notifications for API failures, rate limits (429), and credit issues (402)
- Prompt history saved per user in database — viewable and re-runnable from dashboard

## Phase 5: Lightweight Image Editor
- Canvas-based editor page for generated images
- Crop tool with aspect ratio presets
- Resize with custom dimensions
- Filters: brightness, contrast, saturation sliders
- Save edited image (download or back to gallery)

## Phase 6: UI/UX Polish
- Clean hero input design on homepage (centered, minimal)
- Smooth hover effects and transitions on cards
- Card-based image gallery layout with masonry-style grid
- Full mobile responsiveness across all pages
- Dark/light mode with smooth toggle

## Phase 7: Advanced Features
- **Prompt Enhancer**: AI-powered button that improves/expands user prompts before generation
- **Generate Variations**: Take an existing image and create variations
- **Image Preview Modal**: Click any image for full-screen preview with details
- **Copy Prompt**: One-click copy of any prompt from history

## Phase 8: Storage & Performance
- Store generated images in Lovable Cloud storage buckets
- Link images to user profiles in database
- Cache previous results to avoid redundant API calls
- Lazy-load images in gallery for performance

## Phase 9: Final Touches
- Add branding placeholder (logo, app name "ImageForge")
- Navigation bar with user avatar and auth state
- Footer with links
- Basic credit system: each user gets daily free generations, tracked in database
- Clean, intuitive UX review pass

