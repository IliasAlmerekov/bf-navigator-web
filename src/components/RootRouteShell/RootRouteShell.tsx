import { Outlet, useRouterState } from '@tanstack/react-router';
import AppLayout from '../AppLayout';

const ROUTES_WITHOUT_APP_LAYOUT = new Set(['/login', '/register', '/onboarding']);

export default function RootRouteShell() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  if (ROUTES_WITHOUT_APP_LAYOUT.has(pathname)) {
    return <Outlet />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
