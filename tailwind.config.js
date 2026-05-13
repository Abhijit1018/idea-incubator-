/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Core palette — editorial magazine feel
                'mi-bg': '#0a0a0b',
                'mi-surface': '#141416',
                'mi-surface-2': '#1e1e21',
                'mi-border': '#2a2a2e',
                'mi-border-light': '#3a3a3f',
                // Accent — bold orange-red from the reference
                'mi-accent': '#ff4d00',
                'mi-accent-hover': '#ff6a2a',
                'mi-accent-dim': '#cc3d00',
                // Secondary accents
                'mi-lime': '#ccff00',
                'mi-cyan': '#00f0ff',
                // Text
                'mi-text': '#f5f5f4',
                'mi-text-secondary': '#a8a8b3',
                'mi-text-muted': '#6b6b76',
                // Light theme (for home sections)
                'mi-cream': '#f5f0ea',
                'mi-cream-dark': '#e8e0d6',
                // Legacy neo- colors (keep for existing components)
                'neo-bg': '#0f0f11',
                'neo-surface': '#1c1c1f',
                'neo-border': '#333336',
                'neo-accent': '#ccff00',
                'neo-accent-dim': '#a3cc00',
                'neo-text': '#f4f4f5',
                'neo-muted': '#a1a1aa'
            },
            fontFamily: {
                'editorial': ['"Instrument Serif"', 'Georgia', 'serif'],
                'heading': ['"Bebas Neue"', '"Arial Narrow"', 'sans-serif'],
                'body': ['"DM Sans"', 'system-ui', 'sans-serif'],
                // Legacy
                'display': ['"Space Grotesk"', 'sans-serif'],
                'sans': ['"Inter"', 'sans-serif']
            },
            boxShadow: {
                'neo': '4px 4px 0px 0px #ccff00',
                'neo-hover': '6px 6px 0px 0px #ccff00',
                'neo-card': '4px 4px 0px 0px #333336',
                'editorial': '0 20px 60px -15px rgba(0,0,0,0.4)',
                'glow-accent': '0 0 40px -10px rgba(255,77,0,0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.7s cubic-bezier(0.23,1,0.32,1) forwards',
                'slide-down': 'slideDown 0.5s cubic-bezier(0.23,1,0.32,1) forwards',
                'scale-in': 'scaleIn 0.5s cubic-bezier(0.23,1,0.32,1) forwards',
                'marquee': 'marquee 30s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(40px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
            },
        },
    },
    plugins: [],
}
