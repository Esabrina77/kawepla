import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation - Kawepla',
  description: 'Conditions d\'utilisation de la plateforme Kawepla - Termes et conditions d\'utilisation de notre service.',
  robots: 'index, follow',
};

export default function ConditionsUtilisationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
