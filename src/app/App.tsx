import { useCallback, useState } from 'react';
import { RouterProvider } from 'react-router';
import { DemoAccessGate } from './components/DemoAccessGate';
import { DemoAccessProvider } from './contexts/DemoAccessContext';
import { isDemoAccessGranted, revokeDemoAccess } from './utils/demo-access';
import { router } from './routes';

export default function App() {
  const [accessGranted, setAccessGranted] = useState(isDemoAccessGranted);

  const handleGranted = useCallback(() => {
    void router.navigate('/home', { replace: true });
    setAccessGranted(true);
  }, []);

  const handleSignOut = useCallback(() => {
    revokeDemoAccess();
    setAccessGranted(false);
  }, []);

  if (!accessGranted) {
    return <DemoAccessGate onGranted={handleGranted} />;
  }

  return (
    <DemoAccessProvider signOut={handleSignOut}>
      <RouterProvider router={router} />
    </DemoAccessProvider>
  );
}
