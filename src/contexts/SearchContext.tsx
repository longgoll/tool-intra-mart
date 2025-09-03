/* eslint-disable react-refresh/only-export-components */
import React, { createContext } from 'react';
import type { ReactNode } from 'react';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

interface SearchContextType {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const searchHook = useGlobalSearch();

  return (
    <SearchContext.Provider value={searchHook}>
      {children}
    </SearchContext.Provider>
  );
};
