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
        'cream': '#f5e7bc',
        'grey1': '#f5f5f5',
        'grey2': '#e0e0e0',
        'grey3': '#b0b0b0',
        'grey4': '#505050',
        'black1': '#1f1f1f',
      },
      backgroundImage: {
        'grey-gradient': 'linear-gradient(to right, #f5f5f5, #b0b0b0)',
        'cream-gradient': 'linear-gradient(to right, #f5e7bc, #f5f5f5)',
      }
    },
  },
  plugins: [],
}
export default config
