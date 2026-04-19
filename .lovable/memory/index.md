# Project Memory

## Core
Flash AI - high-end B&W SaaS. Pure white #FFF / pure black #000. Glassmorphism (.glass, .glass-strong utilities, backdrop-blur 14px, 1px white/10 border). Inter font, tracking-tighter on headings, no serifs.
Lovable Cloud for auth (Email+Google+Apple), DB, storage. Gemini flash-image for generation.
Tables: profiles, generations, projects, favorites, brand_kits, user_settings, activity_log.
Templates page uses CSS-column masonry-grid utility (1→5 cols responsive).

## Memories
- [Auth setup](mem://features/auth) — Email+Google+Apple via Lovable Cloud managed auth
- [Image generation](mem://features/generation) — Gemini flash-image via edge function, 2 images per prompt
- [Build plan](mem://features/plan) — 9-phase plan: structure, auth, generation, core, editor, polish, advanced, storage, final
