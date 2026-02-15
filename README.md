# 💅 Read The Room (Vibe Check App)

> **"Because sometimes you just need to know if you're the problem."**

**Read The Room** is a chat analysis tool that gives you the brutally honest truth about your relationships/friendships. Paste your chat history, and let our Vibe Council roast your dynamics, analyze your attachment styles, and generate a comprehensive report card.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)
![AI](https://img.shields.io/badge/Powered%20by-Gemini-8E75B2)

## ✨ Features

-   **🔥 The Roast:** Get a no-holds-barred summary of your relationship dynamic.
-   **📊 Vibe Analytics:**
    -   **Emotional Arc:** Visualize the highs (SIMP ZONE) and lows (TOXIC WASTE) of your convo.
    -   **Dominance Chart:** Who talks more? We have the receipts.
    -   **Red/Green Flags:** Warning signs and redeeming qualities.
-   **🎭 RPG Character Sheets:** Are you "The Simp", "The YAP God", or "The Ghost"? Customizable stats included.
-   **💿 Relationship Soundtrack:** A curated playlist based on your chat's mood.
-   **📤 Export Options:**
    -   **Receipt Mode:** Shareable mobile-friendly image.
    -   **PDF Report:** Full comprehensive audit for your records.
    -   **Shareable Links:** Send a read-only link to your friends (or exes).

## 🛠️ Tech Stack

-   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
-   **Language:** TypeScript
-   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
-   **Animations:** [Framer Motion](https://www.framer.com/motion/)
-   **Charts:** [Recharts](https://recharts.org/)
-   **AI:** [Google Generative AI (Gemini)](https://ai.google.dev/)
-   **Database (Sharing):** [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (Redis)

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+
-   npm / pnpm / yarn
-   **Platform Support:** Windows, macOS (Intel & Apple Silicon), Linux (x86-64 & ARM64)

> **Note:** This application is **fully compatible with ARM64 macOS** (Apple Silicon M1/M2/M3). All dependencies run natively without requiring Rosetta 2. See [COMPATIBILITY.md](./COMPATIBILITY.md) for detailed platform information.

### Installation

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/yourusername/read-the-room.git
    cd read-the-room
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root:
    ```env
    # AI Key
    GOOGLE_API_KEY=your_gemini_api_key

    # Database (Vercel KV / Upstash Redis)
    KV_REST_API_URL=your_redis_url
    KV_REST_API_TOKEN=your_redis_token

    # Stripe (Optional for Premium)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
    STRIPE_SECRET_KEY=your_stripe_secret
    ```

4.  **Run the dev server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🤝 Contributing

So you think you can roast better than our AI? PRs are welcome!
1.  Fork it.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

Please ensure your contributions maintain cross-platform compatibility. See [COMPATIBILITY.md](./COMPATIBILITY.md) for details.

## 📚 Documentation

-   **[Compatibility Guide](./COMPATIBILITY.md)** - Platform compatibility and system requirements
-   **[Getting Started](#-getting-started)** - Installation and setup instructions

## 💻 Platform Compatibility

**Read The Room** runs natively on:
-   ✅ **macOS** (Intel & Apple Silicon M1/M2/M3)
-   ✅ **Windows** (x86-64 & ARM64)
-   ✅ **Linux** (x86-64 & ARM64)

For detailed compatibility information including future CTranslate2 support, see [COMPATIBILITY.md](./COMPATIBILITY.md).

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Made with 💀 and ☕️ by [Kunal Katariya](https://www.instagram.com/techbymistake/)*
