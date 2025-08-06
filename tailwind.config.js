/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Asegúrate de que todas las extensiones de tus archivos estén aquí
  ],
  theme: {
    extend: {
      fontFamily: {
        // Agrega la fuente 'Inter' para que se use en todo tu proyecto
        // Asegúrate de que el enlace de la fuente esté en index.html
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
