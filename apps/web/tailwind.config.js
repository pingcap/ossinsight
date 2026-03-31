/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/site-shell/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        'card-foreground': 'hsl(var(--card-foreground) / <alpha-value>)',
        popover: 'hsl(var(--popover) / <alpha-value>)',
        'popover-foreground': 'hsl(var(--popover-foreground) / <alpha-value>)',
        secondary: 'hsl(var(--secondary) / <alpha-value>)',
        'secondary-foreground': 'hsl(var(--secondary-foreground) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        'muted-foreground': 'hsl(var(--muted-foreground) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        'accent-foreground': 'hsl(var(--accent-foreground) / <alpha-value>)',
        destructive: 'hsl(var(--destructive) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        primary: 'var(--color-primary)',
        'primary-reverse': 'var(--color-primary-reverse)',
        'primary-highlighted': 'var(--color-primary-highlighted)',
        'primary-foreground': 'hsl(var(--primary-foreground) / <alpha-value>)',
        disabled: 'var(--color-disabled)',
        'text-secondary': 'var(--text-color-secondary)',
        'text-muted': 'var(--text-color-muted)',
        'text-gray': 'var(--text-color-gray)',
        'border-subtle': 'var(--border-color-subtle)',
        'border-default': 'var(--border-color-default)',
        'card': 'var(--bg-card)',
        'page': 'var(--bg-page)',
      },
      backgroundColor: {
        body: 'var(--background-color-body)',
        toolbar: 'var(--background-color-toolbar)',
        popover: 'var(--background-color-popover)',
        control: 'var(--background-color-control)',
        code: 'var(--background-color-code)',
      },
      textColor: {
        title: 'var(--text-color-title)',
        subtitle: 'var(--text-color-subtitle)',
        content: 'var(--text-color-content)',
        active: 'var(--text-color-active)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderColor: {
        DEFAULT: 'var(--border-color-default)',
        dimmed: 'var(--border-color-dimmed)',
      },
      divideColor: {
        DEFAULT: 'var(--divide-color-default)',
        dimmed: 'var(--divide-color-dimmed)',
      },
      ringWidth: {
        3: '3px',
      },
      boxShadow: {
        control: '0 0 0 2px var(--tw-shadow-color)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
