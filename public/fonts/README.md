# BenAiah Font Integration

The Voice-First Business Assistant project is configured to use **BenAiah** for Amharic / Ethiopic typography.

## Required Font Files
Place the verified font file from Font.et (designed by Abraham Fikadu) into this directory:
- `public/fonts/BenAiah.woff2` (recommended for modern web performance)
- or `public/fonts/BenAiah.ttf`

## Active Configuration
The web application automatically links to this font in `src/app/globals.css`:
```css
@font-face {
  font-family: 'BenAiah';
  src: url('/fonts/BenAiah.woff2') format('woff2'),
       url('/fonts/BenAiah.ttf') format('truetype');
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}
```

When `html[lang="am"]` is active, the font stack prioritizes:
`'BenAiah', 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', sans-serif`

Until the official binary is supplied, the browser falls back seamlessly to the system's Ethiopic fonts (`Noto Sans Ethiopic` / `Nyala`).
