---
name: Sidebar Click Tracking
description: Logs clicks on fake "Yeni Sohbet" button and chat history items in both the home sidebar and the in-test sidebar
type: feature
---
- Table: `sidebar_interactions` (session_id, phase, element, created_at).
- `logSidebarInteraction(sessionId, phase, element)` in `src/lib/experimentService.ts`.
- Fired from:
  - `src/pages/Index.tsx` home sidebar — phase = "home", element = "new_chat" or `chat_history:<title>`.
  - `src/components/PsyCogSidebar.tsx` fullscreen sidebar — phase = current viewState, element = "new_chat" / `chat_history:active` / `chat_history:<title>`.
- Admin panel column "Sidebar" shows "Dokundu" (red) if any clicks exist, else green ✓. `deleteSession` cleans this table too.
