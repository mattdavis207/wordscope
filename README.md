Chrome Extension — Built with Plasmo

This project is a modern browser extension built using Plasmo, a React-powered framework that simplifies extension development across Chrome, Firefox, Edge, and more.

Plasmo handles bundling, HMR, manifest generation, and cross-browser builds—so you can focus on building your extension’s logic, UI, and features.

📦 Tech Stack

Plasmo Framework (React-based extension framework)

TypeScript

React

TailwindCSS

Manifest V3

pnpm / npm for package management

🛠️ Getting Started
1. Install Dependencies
pnpm install
# or
npm install

2. Run the Development Server
pnpm dev
# or
npm run dev


This starts Plasmo’s dev server with Hot Module Reloading (HMR) for your extension.

3. Load the Extension in Your Browser

After running the dev command, Plasmo generates a development build under:

/build/chrome-mv3-dev


To load it in Chrome:

Go to chrome://extensions

Enable Developer Mode

Click Load unpacked

Select the folder above

The extension will auto-reload as you edit source files.

🧩 Project Structure

Plasmo uses a file-based routing system for extension components:

File	Purpose
popup.tsx	Popup UI shown when the extension icon is clicked
options.tsx	(Optional) Options page at chrome://extensions/?options=
content.ts	Content script injected into webpages
background.ts	Service worker / background logic
assets/	Images, stylesheets, icons
components/	Reusable React components

To add a page or script, simply create the corresponding file in the project root and Plasmo will automatically include it in the manifest.

🎨 TailwindCSS

Tailwind is included in the build pipeline.

If you update Tailwind classes in content scripts, regenerate the stylesheet:

npx tailwindcss -c tailwind.config.js \
  -i ./input.css \
  -o ./assets/styles/tailwind-content.css \
  --minify

📦 Production Build

Create a minified, optimized build ready for publishing:

pnpm build
# or
npm run build


Output will be generated in:

/build/chrome-mv3


You can zip this folder for Chrome Web Store submission.

🚀 Deployment & Store Publishing

The easiest deployment method is Plasmo’s Built-in Publishing Pipeline (bpp) GitHub Action.

Steps:

Manually upload your first version to the Chrome Web Store
(this initializes store credentials)

Enable Plasmo's GitHub Action following the Plasmo BPP Setup

On every tagged release, GitHub will automatically:

Build your extension

Package it

Submit it to the Chrome Web Store (and others if configured)

📚 Documentation

For more info on APIs, file conventions, content scripts, and background workers:

🔗 Plasmo Docs: https://docs.plasmo.com

🔗 Chrome Extensions Docs: https://developer.chrome.com/docs/extensions

🤝 Contributing

Pull requests, feature ideas, and improvements are welcome.
Feel free to open an issue if you encounter a bug or want to propose an enhancement.

📝 License

MIT License — You’re free to use, modify, and distribute this project.

If you want, I can customize the README for your Wordscope extension, include screenshots, feature lists, architecture diagrams, badges, or a full "How It Works" section.
