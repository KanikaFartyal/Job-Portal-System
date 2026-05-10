module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(255, 183, 0, 0.2), 0 24px 80px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top left, rgba(255, 183, 0, 0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.075), transparent 30%)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
