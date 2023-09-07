import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue1': '#00b8ff',
        'blue2': 	'#009bd6',
        'blue3': '#00719c',
        'blue4': '#00415a',
        'blue5': '#001f2b',
      },
    },
  },
  plugins: [],
}
export default config
