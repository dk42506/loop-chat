module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'grey1': '#f7f7f7',
        'grey2': '#ededed',
        'grey3': '#d6d6d6',
        'white1': '#ffffff',
        'white2': '#fefefe',
        'black': '#000000',
        'vibrant1': '#ff4f81',
        'vibrant2': '#42e2b8',
        'vibrant3': '#ffbd39'
      }
    },
  },
  plugins: [
    function (pluginApi: any) {
      pluginApi.addComponents({
        '.slide-btn': {
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#ededed', // Grey2
          color: '#000000', // Black

          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            transition: 'left 0.3s',
            zIndex: '-1',
          },

          '&:hover::before': {
            left: '0',
          }
        },
        // Vibrant1 variant
        '.slide-btn-vibrant1::before': {
          backgroundColor: '#ff4f81', // Vibrant1
        },
        // Vibrant2 variant
        '.slide-btn-vibrant2::before': {
          backgroundColor: '#42e2b8', // Vibrant2
        },
        // Vibrant3 variant
        '.slide-btn-vibrant3::before': {
          backgroundColor: '#ffbd39', // Vibrant3
        }
      });
    },
  ],
}