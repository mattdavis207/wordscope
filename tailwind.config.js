/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./popup.tsx",       // Adjust this to where your components live
      "./content.tsx", // if you have a popup folder
    ],
    theme: {
      extend: {}
    },
    plugins: []
  }
  