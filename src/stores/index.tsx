import { useState } from 'react';
import type { ReactNode } from 'react';
import { RootStore, StoreContext, useRootStore } from './RootStore';

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

// Convenience hook for skill store access
export function useSkillStore() {
  return useRootStore().skillStore;
}

// Re-exports
export { SkillStore } from './SkillStore';
