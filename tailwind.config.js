/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './frontend/src/**/*.{js,jsx,ts,tsx,html}',
    './frontend/public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#1a1a1a',
        surface: '#d3d3d3',
        accent: '#ff4500',
        ink: '#ffffff',
        'ink-muted': '#cccccc',
        'ink-subtle': '#555555'
      },
      fontFamily: {
        body: ['Roboto', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace','SFMono-Regular','Menlo','monospace']
      },
      borderRadius: {
        'blob-a': '30px 30px 30px 80px / 30px 30px 30px 60px',
        'blob-b': '20px 20px 20px 70px / 20px 20px 20px 50px'
      },
      boxShadow: {
        card: '0 2px 6px rgba(0,0,0,0.35)'
      },
      backgroundImage: {
        'grid-dark': 'linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px)'
      },
      backgroundSize: {
        grid: '20px 20px'
      }
    }
  },
  plugins: []
};
