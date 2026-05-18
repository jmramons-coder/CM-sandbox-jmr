import { createContext, useContext, type ReactNode } from 'react';

type DemoAccessContextValue = {
  signOut: () => void;
};

const DemoAccessContext = createContext<DemoAccessContextValue | null>(null);

export function DemoAccessProvider({
  children,
  signOut,
}: {
  children: ReactNode;
  signOut: () => void;
}) {
  return <DemoAccessContext.Provider value={{ signOut }}>{children}</DemoAccessContext.Provider>;
}

export function useDemoAccess() {
  const value = useContext(DemoAccessContext);
  if (!value) {
    throw new Error('useDemoAccess must be used within DemoAccessProvider');
  }
  return value;
}
