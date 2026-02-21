import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Weeks } from './pages/Weeks';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: ProtectedRoute, // 👈 guard aquí
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: 'weeks', Component: Weeks },
          { path: 'analytics', Component: Analytics },
          { path: 'settings', Component: Settings },
        ],
      },
    ],
  },
]);