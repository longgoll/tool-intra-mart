import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '../ui/command';
import { Index } from 'flexsearch';
import type { UserCategory, UserDefinition } from '../userdef/UserDefTree';

interface SearchResult {
  type: 'category' | 'definition' | 'content';
  id: string;
  name: string;
  displayName?: string;
  categoryId?: string;
  score?: number;
  matchType?: 'name' | 'content';
  snippet?: string;
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: UserCategory[];
  definitions: UserDefinition[];
  definitionContentMap: Record<string, { code: string; language: string; type: string }>;
  onSelect: (type: 'category' | 'definition', id: string) => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ 
  isOpen, 
  onClose, 
  categories, 
  definitions, 
  definitionContentMap,
  onSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize FlexSearch indexes
  const searchIndexes = useMemo(() => {
    const categoryIndex = new Index({
      tokenize: "strict",
      resolution: 9
    });

    const definitionIndex = new Index({
      tokenize: "strict", 
      resolution: 9
    });

    // New index for searching content inside definitions (SQL, JS code)
    const contentIndex = new Index({
      tokenize: "strict",
      resolution: 9
    });

    // Index categories
    categories.forEach(cat => {
      categoryIndex.add(cat.categoryId, `${cat.categoryName} ${cat.displayName || ''}`);
    });

    // Index definitions
    definitions.forEach(def => {
      // Search both definitionId and definitionName for better coverage
      definitionIndex.add(def.definitionId, `${def.definitionId} ${def.definitionName}`);
    });

    // Index definition content (SQL queries, JavaScript code, etc.)
    definitions.forEach(def => {
      const contentObj = definitionContentMap[def.definitionId];
      if (contentObj && contentObj.code) {
        // Combine definitionId, definition name with its content for better search
        const searchableContent = `${def.definitionId} ${def.definitionName} ${contentObj.code}`;
        contentIndex.add(def.definitionId, searchableContent);
      }
    });

    return { categoryIndex, definitionIndex, contentIndex };
  }, [categories, definitions, definitionContentMap]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results: SearchResult[] = [];

    // Search categories
    const categoryResults = searchIndexes.categoryIndex.search(searchTerm, { limit: 5 });
    categoryResults.forEach((id) => {
      const category = categories.find(c => c.categoryId === String(id));
      if (category) {
        results.push({
          type: 'category',
          id: category.categoryId,
          name: category.categoryName,
          displayName: category.displayName,
          matchType: 'name'
        });
      }
    });

    // Search definitions by name
    const definitionResults = searchIndexes.definitionIndex.search(searchTerm, { limit: 8 });
    definitionResults.forEach((id) => {
      const definition = definitions.find(d => d.definitionId === String(id));
      if (definition) {
        results.push({
          type: 'definition',
          id: definition.definitionId,
          name: definition.definitionName,
          categoryId: definition.categoryId,
          matchType: 'name'
        });
      }
    });

    // Search definitions by content (SQL, JavaScript code)
    const contentResults = searchIndexes.contentIndex.search(searchTerm, { limit: 10 });
    contentResults.forEach((id) => {
      const definition = definitions.find(d => d.definitionId === String(id));
      if (definition) {
        // Check if this definition is already in results from name search
        const existingResult = results.find(r => r.id === definition.definitionId);
        if (!existingResult) {
          const contentObj = definitionContentMap[definition.definitionId];
          
          // Additional validation: check if search term actually exists in content
          if (contentObj && contentObj.code) {
            const codeContent = contentObj.code.toLowerCase();
            const searchTermLower = searchTerm.toLowerCase();
            
            // Only include if the exact search term is found in the content
            if (codeContent.includes(searchTermLower)) {
              let snippet = '';
              
              // Create a snippet showing where the match was found
              const codeLines = contentObj.code.split('\n');
              const matchingLine = codeLines.find(line => 
                line.toLowerCase().includes(searchTermLower)
              );
              if (matchingLine) {
                snippet = matchingLine.trim().substring(0, 100) + (matchingLine.length > 100 ? '...' : '');
              }

              results.push({
                type: 'content',
                id: definition.definitionId,
                name: definition.definitionName,
                categoryId: definition.categoryId,
                matchType: 'content',
                snippet: snippet
              });
            }
          }
        }
      }
    });

    return results;
  }, [searchTerm, searchIndexes, categories, definitions, definitionContentMap]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            const result = searchResults[selectedIndex];
            const resultType = result.type === 'content' ? 'definition' : result.type;
            onSelect(resultType, result.id);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onSelect, onClose]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.categoryId === categoryId);
    return category?.displayName || category?.categoryName || '';
  };

  const handleSelect = (result: SearchResult) => {
    // For content matches, treat them as definition selections
    const resultType = result.type === 'content' ? 'definition' : result.type;
    onSelect(resultType, result.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-sm font-medium">Tìm kiếm nhanh</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <Input
            ref={inputRef}
            placeholder="Nhập từ khóa để tìm kiếm categories và definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          <Command className="max-h-[400px]">
            <CommandList>
              {searchResults.length === 0 && searchTerm && (
                <CommandEmpty>Không tìm thấy kết quả nào</CommandEmpty>
              )}
              
              {searchResults.length === 0 && !searchTerm && (
                <div className="py-6 text-center text-sm text-gray-500">
                  Nhập từ khóa để bắt đầu tìm kiếm
                </div>
              )}

              {searchResults.length > 0 && (
                <CommandGroup>
                  {searchResults.map((result, index) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      value={`${result.type}-${result.id}`}
                      onSelect={() => handleSelect(result)}
                      className={`flex items-center space-x-3 px-3 py-2 cursor-pointer rounded ${
                        index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      {/* Icon based on type */}
                      <div className={`w-2 h-2 rounded-full ${
                        result.type === 'category' ? 'bg-blue-500' : 
                        result.type === 'content' ? 'bg-purple-500' : 'bg-green-500'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {result.type === 'definition' || result.type === 'content' ? (
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {result.id} {/* Show definitionId */}
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5">
                                {result.name} {/* Show definitionName */}
                              </div>
                            </div>
                          ) : (
                            <span className="font-medium text-sm">
                              {result.displayName || result.name}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            result.type === 'category' 
                              ? 'bg-blue-100 text-blue-700' 
                              : result.type === 'content'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {result.type === 'category' ? 'Danh mục' : 
                             result.type === 'content' ? 'Nội dung' : 'file'}
                          </span>
                          {result.matchType === 'content' && (
                            <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                              Tìm trong code
                            </span>
                          )}
                        </div>
                        
                        {result.type === 'definition' && result.categoryId && (
                          <div className="text-xs text-gray-500 mt-1">
                            Thuộc: {getCategoryName(result.categoryId)}
                          </div>
                        )}

                        {result.type === 'content' && result.categoryId && (
                          <div className="text-xs text-gray-500 mt-1">
                            Thuộc: {getCategoryName(result.categoryId)}
                          </div>
                        )}

                        {/* Show snippet for content matches */}
                        {result.snippet && (
                          <div className="text-xs text-gray-600 mt-1 bg-gray-50 px-2 py-1 rounded border font-mono">
                            "{result.snippet}"
                          </div>
                        )}
                      </div>

                      {/* Keyboard shortcut hint */}
                      {index === selectedIndex && (
                        <div className="text-xs text-gray-400">
                          ↵
                        </div>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>

        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Sử dụng ↑↓ để điều hướng, ↵ để chọn, Esc để đóng</span>
            <span>{searchResults.length} kết quả</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
