import localFont from 'next/font/local';
import { Open_Sans } from 'next/font/google';

// Polices Google
export const openSansFont = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

// Polices locales (thématiques et d'accessibilité)
export const featherscriptFont = localFont({
  src: './featherscript.otf',
  variable: '--font-featherscript',
  display: 'swap',
});

//poppins
export const poppinsFont = localFont({
  src: './poppins.ttf',
  variable: '--font-poppins', 
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

// Fonction pour obtenir le nom de la police en fonction du type
export function getFontClassName(type: 'heading' | 'body'): string {
  return type === 'heading' ? 'font-' : 'font-open-sans';
}

// Classes de polices d'accessibilité
export const fontAccessibilityClasses = {
  'open-sans': openSansFont.variable,
  'featherscript': featherscriptFont.variable,
  'harrington': harringtonFont.variable,
  'opendyslexic': openDyslexicFont.variable,
  'poppins': poppinsFont.variable,
}; 