import localFont from 'next/font/local';

export const featherscriptFont = localFont({
  src: './featherscript.otf',
  variable: '--font-featherscript',
  display: 'swap',
});

export const harringtonFont = localFont({
  src: './harrington.ttf',
  variable: '--font-harrington',
  display: 'swap',
});

export const openDyslexicFont = localFont({
  src: './opendyslexic.otf',
  variable: '--font-opendyslexic',
  display: 'swap',
});

// Utilisez cette fonction pour obtenir le nom de la police en fonction du type
export function getFontClassName(type: 'heading' | 'body'): string {
  return type === 'heading' ? 'font-harrington' : 'font-featherscript';
} 