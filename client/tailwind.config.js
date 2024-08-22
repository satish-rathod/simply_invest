module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        green: {
          400: '#34D399',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}