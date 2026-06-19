import type { Config } from 'tailwindcss'

// In Tailwind v4, most configuration is done via @theme in CSS.
// This file is kept for content scanning only.
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config
