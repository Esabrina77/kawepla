import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const protectedRoutes = {
  organisateur: ['/client'],
  ADMIN: ['/super-admin']
};

// Routes accessibles uniquement aux utilisateurs non authentifiés
const authRoutes = ['/auth/login', '/auth/register'];

const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/rsvp',
  '/',
  '/features',
  '/pricing',
  '/contact',
  '/faq',
  '/legal/privacy',
  '/legal/terms',
  '/legal/cookies',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est un chemin public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Vérifier si l'utilisateur est authentifié
  const token = request.cookies.get('token');

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Vérifier si le token est expiré
    const tokenData = JSON.parse(atob(token.value.split('.')[1]));
    const expirationTime = tokenData.exp * 1000; // Convertir en millisecondes
    
    if (Date.now() >= expirationTime) {
      // Token expiré, supprimer le cookie et rediriger vers login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('user');
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    // En cas d'erreur de parsing du token, rediriger vers login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('token');
    response.cookies.delete('user');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
}; 