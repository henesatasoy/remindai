# Project Memory

## Core
- Brand: ReMind. Light theme (white bg). All text in Turkish.
- Stack: React, Tailwind, lucide-react, Supabase. No other UI/icon libraries.
- Never alter test psychometric timing (30s timer, fixation cross, auto-advance).

## Memories
- [Test Flow Architecture](mem://features/test-flow-architecture) — Phases, practice logic (3/10 pass), instructions, and completion states
- [Psychometric Timing & Measurement](mem://features/psychometric-timing-protocol) — Question timing, reaction time calculation, and image preloading
- [Transforming Layout & Sidebar Chat](mem://design/transforming-layout-interaction) — Initial layout animation, sidebar states, chat history, and fake models
- [AI Intervention & Attention Check](mem://features/ai-intervention-deception) — 5-minute fake AI terminal, deception messages, and attention check logic
- [Supabase Data Schema](mem://backend/supabase-data-schema) — `experiment_results` table structure for session data
- [Secret Admin Panel](mem://features/admin-panel-secret) — Hidden dashboard for analytics, session deletion, and attention check filtering
- [Tab Focus Tracking](mem://features/tab-focus-tracking) — `session_focus_events` table + hook that logs tab blur/focus during test phases, surfaced in admin panel
- [Sidebar Click Tracking](mem://features/sidebar-click-tracking) — `sidebar_interactions` table logs Yeni Sohbet + chat history clicks (home + all phases), surfaced as "Dokundu / ✓" in admin panel
