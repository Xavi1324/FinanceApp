import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <SpeedInsights />
      <Analytics />
    </AppProvider>
  );
}
