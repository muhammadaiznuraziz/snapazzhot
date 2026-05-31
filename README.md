# Snapazzhot 📸

An interactive Japanese Purikura (photobooth) and retro arcade experience. Customize your photos with themes, layouts, and moods, then generate enthusiastic retro arcade commentary, sticker captions, and fortunes powered by the Gemini API.

## Features
- **Interactive Camera**: Frame your shot, select a theme (Retro, Kawaii, Arcade, Cyberpunk), and snap a photo.
- **Customizable Layouts**: Choose from various layout presets.
- **Gemini AI Integration**: Automatically generates personalized commentary, stickers, and fortunes for your photo strip.
- **Canvas Rendering**: Compiles your final photostrip onto a stylized canvas for saving or sharing.

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- A **Gemini API Key** from Google AI Studio

### Run Locally

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key"
   APP_URL="http://localhost:3000"
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.
