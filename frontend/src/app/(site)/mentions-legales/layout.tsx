import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales - Kawepla',
  description: 'Mentions légales de la plateforme Kawepla - Informations légales concernant notre service d\'invitations numériques.',
  robots: 'index, follow',
};

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
