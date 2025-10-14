import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité - Kawepla',
  description: 'Politique de confidentialité de Kawepla - Comment nous protégeons et utilisons vos données personnelles.',
  robots: 'index, follow',
};

export default function PolitiqueConfidentialiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
