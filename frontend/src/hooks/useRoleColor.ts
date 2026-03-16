'use client';

import { usePathname } from 'next/navigation';

export type UserRole = 'host' | 'provider' | 'admin' | 'default';

// Référence directe aux CSS variables de globals.css — pas de duplication de valeurs
const ROLE_VARS: Record<UserRole, { color: string; dark: string; rgb: string }> = {
  host:    { color: 'var(--host)',     dark: 'var(--host-dark)',     rgb: '99, 102, 241'  },
  provider:{ color: 'var(--provider)', dark: 'var(--provider-dark)', rgb: '255, 115, 43'  },
  admin:   { color: 'var(--admin)',    dark: 'var(--admin-dark)',     rgb: '20, 184, 166'  },
  default: { color: 'var(--host)',     dark: 'var(--host-dark)',      rgb: '99, 102, 241'  },
};

export function useRoleColor() {
  const pathname = usePathname();

  let role: UserRole = 'default';
  if (pathname?.startsWith('/provider'))     role = 'provider';
  else if (pathname?.startsWith('/client'))  role = 'host';
  else if (pathname?.startsWith('/super-admin')) role = 'admin';

  return { role, ...ROLE_VARS[role] };
}
