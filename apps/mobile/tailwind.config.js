/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				border: "rgb(var(--border) / <alpha-value>)",
				input: "rgb(var(--input) / <alpha-value>)",
				ring: "rgb(var(--ring) / <alpha-value>)",
				background: "rgb(var(--background) / <alpha-value>)",
				foreground: "rgb(var(--foreground) / <alpha-value>)",
				primary: {
					DEFAULT: "rgb(var(--primary) / <alpha-value>)",
					foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
					foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
				},
				destructive: {
					DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
					foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
				},
				muted: {
					DEFAULT: "rgb(var(--muted) / <alpha-value>)",
					foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
				},
				accent: {
					DEFAULT: "rgb(var(--accent) / <alpha-value>)",
					foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
				},
				popover: {
					DEFAULT: "rgb(var(--popover) / <alpha-value>)",
					foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
				},
				card: {
					DEFAULT: "rgb(var(--card) / <alpha-value>)",
					foreground: "rgb(var(--card-foreground) / <alpha-value>)",
				},
				sidebar: {
					DEFAULT: "rgb(var(--sidebar) / <alpha-value>)",
					foreground: "rgb(var(--sidebar-foreground) / <alpha-value>)",
					primary: "rgb(var(--sidebar-primary) / <alpha-value>)",
					"primary-foreground":
						"rgb(var(--sidebar-primary-foreground) / <alpha-value>)",
					accent: "rgb(var(--sidebar-accent) / <alpha-value>)",
					"accent-foreground":
						"rgb(var(--sidebar-accent-foreground) / <alpha-value>)",
					border: "rgb(var(--sidebar-border) / <alpha-value>)",
					ring: "rgb(var(--sidebar-ring) / <alpha-value>)",
				},
				chart: {
					1: "rgb(var(--chart-1) / <alpha-value>)",
					2: "rgb(var(--chart-2) / <alpha-value>)",
					3: "rgb(var(--chart-3) / <alpha-value>)",
					4: "rgb(var(--chart-4) / <alpha-value>)",
					5: "rgb(var(--chart-5) / <alpha-value>)",
				},
				scrim: "rgb(var(--scrim) / <alpha-value>)",
			},
			borderRadius: {
				DEFAULT: "var(--radius)",
				sharp: "var(--radius)",
				xs: "var(--radius-xs)",
				sm: "var(--radius-sm)",
				md: "var(--radius)",
				lg: "var(--radius)",
				xl: "var(--radius-card)",
				"2xl": "var(--radius-sheet)",
				cell: "var(--radius-cell)",
				flip: "var(--radius-sm)",
				clock: "var(--radius-clock)",
				card: "var(--radius-card)",
				sheet: "var(--radius-sheet)",
				full: "var(--radius-full)",
			},
			borderWidth: {
				hairline: "1px",
				1.5: "1.5px",
				heavy: "2px",
			},
			boxShadow: {
				"2xs": "var(--shadow-2xs)",
				xs: "var(--shadow-xs)",
				sm: "var(--shadow-sm)",
				DEFAULT: "var(--shadow)",
				md: "var(--shadow-md)",
				lg: "var(--shadow-lg)",
				xl: "var(--shadow-xl)",
				"2xl": "var(--shadow-2xl)",
				inner: "none",
			},
			fontFamily: {
				sans: ["var(--font-sans)"],
				serif: ["var(--font-serif)"],
				mono: ["var(--font-mono)"],
			},
			letterSpacing: {
				normal: "var(--tracking-normal)",
			},
			opacity: {
				faint: "0.08",
				dim: "0.4",
				scrim: "0.6",
			},
		},
	},
	plugins: [],
};
