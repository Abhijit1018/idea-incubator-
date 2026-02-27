/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neo-bg': '#0f0f11',
                'neo-surface': '#1c1c1f',
                'neo-border': '#333336',
                'neo-accent': '#ccff00',
                'neo-accent-dim': '#a3cc00',
                'neo-text': '#f4f4f5',
                'neo-muted': '#a1a1aa'
            },
            fontFamily: {
                'display': ['"Space Grotesk"', 'sans-serif'],
                'sans': ['"Inter"', 'sans-serif']
            },
            boxShadow: {
                'neo': '4px 4px 0px 0px #ccff00',
                'neo-hover': '6px 6px 0px 0px #ccff00',
                'neo-card': '4px 4px 0px 0px #333336'
            }
        },
    },
    plugins: [],
}
