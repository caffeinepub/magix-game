import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { AppLayout } from './components/AppLayout';
import { ProfileMePage } from './pages/ProfileMePage';
import { ProfilePublicPage } from './pages/ProfilePublicPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { CommunityDetailPage } from './pages/CommunityDetailPage';
import { MapGamePage } from './pages/MapGamePage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CommunitiesPage,
});

const profileMeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfileMePage,
});

const profilePublicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$principal',
  component: ProfilePublicPage,
});

const communitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/communities',
  component: CommunitiesPage,
});

const communityDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/community/$name',
  component: CommunityDetailPage,
});

const mapGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/community/$name/map',
  component: MapGamePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  profileMeRoute,
  profilePublicRoute,
  communitiesRoute,
  communityDetailRoute,
  mapGameRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
