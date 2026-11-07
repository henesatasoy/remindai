# PsyCog Interface

I need to build a React web application called "PsyCog" with a specific UI/UX behavior mimicking Gemini Advanced.

Design Requirements:

Theme: Professional Dark Mode (deep grays, subtle borders, Inter font).

Initial View: A centered, minimalist chat interface.

Large input field at the bottom center with placeholder: "Bir şeyler sorun..."

Central logo text: "PsyCog".

Transition Logic (CRITICAL):

When the user types ANY text and hits Enter, the interface must transform explicitly:

The central chat input bar animates and shrinks to become a Left Sidebar.

A new Main Content Panel slides in from the Right to fill the rest of the screen.

The transition must be smooth (0.6s ease-in-out).

Post-Transition State:

Left Sidebar: Shows the user's prompt history (just the one they typed).

Right Main Panel: Initially displays a loading spinner with the text "Test yükleniyor..." for exactly 6 seconds.

After 6 seconds, the text changes to a header: "MaRs-IB Testi".

Technical Constraints:

Use Tailwind CSS for styling and animations.

Use 'lucide-react' for icons.

All user-facing text must be in Turkish.

Do not implement the test logic yet, focus only on the layout transition and the 6-second timer effect.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://remindai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a65acc2c-2663-44f4-b646-29762785c072).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
