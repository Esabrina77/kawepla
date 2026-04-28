export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      {children}
    </div>
  );
}
