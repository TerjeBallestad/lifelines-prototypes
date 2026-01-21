import { useState } from 'react';
import type { ReactNode } from 'react';
import { RootStore, StoreContext } from './RootStore';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  // useState ensures single instance across re-renders
  const [store] = useState(() => new RootStore());

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}
