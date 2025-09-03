/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import UserDefTree, { type UserCategory, type UserDefinition } from './UserDefTree';
import UserDefMonaco from './UserDefMonaco';
import SearchDialog from '../search/SearchDialog';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import userDefJsonDefault from '../../../data/user_definition.json';


interface UserDefManagerProps {
  userDefData?: {
    userCategories: unknown[];
    userDefinitions: string[];
  };
}

const parseData = (userDefData?: { userCategories: unknown[]; userDefinitions: string[] }) => {
  const src = userDefData || userDefJsonDefault;
  const categories: UserCategory[] = src.userCategories.map((cat: unknown) => {
    const c = cat as { categoryId: string; categoryName: string; displayName?: string };
    return {
      categoryId: c.categoryId,
      categoryName: c.categoryName,
      displayName: c.displayName || c.categoryName,
    };
  });
  const definitionsRaw: unknown[] = src.userDefinitions.map((def: string) => JSON.parse(def));
  const definitions: UserDefinition[] = definitionsRaw.map(def => {
    const d = def as { definitionId: string; definitionName: string; categoryId: string; definitionType?: string };
    return {
      definitionId: d.definitionId,
      definitionName: d.definitionName,
      categoryId: d.categoryId,
      definitionType: d.definitionType,
    };
  });
  // Map: definitionId -> { type, code, language }
  const definitionContentMap: Record<string, { code: string; language: string; type: string }> = {};
  definitionsRaw.forEach(def => {
    const d = def as any;
    let code = '';
    let language = 'json';
    const type = d.definitionType || '';
    if (type === 'sql') {
      code = d.definitionData?.elementProperties?.query || '';
      language = 'sql';
    } else if (type === 'javascript') {
      code = d.definitionData?.elementProperties?.script || '';
      language = 'javascript';
    } else {
      code = JSON.stringify(def, null, 2);
      language = 'json';
    }
    definitionContentMap[d.definitionId] = { code, language, type };
  });
  return { categories, definitions, definitionContentMap };
};


const UserDefManager: React.FC<UserDefManagerProps> = ({ userDefData }) => {
  const { categories, definitions, definitionContentMap } = useMemo(() => parseData(userDefData), [userDefData]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { isSearchOpen, closeSearch } = useGlobalSearch();

  const contentObj = useMemo(() => {
    if (!selectedId) return null;
    return definitionContentMap[selectedId] || null;
  }, [selectedId, definitionContentMap]);

  const handleSearchSelect = (type: 'category' | 'definition', id: string) => {
    if (type === 'definition') {
      setSelectedId(id);
    } else if (type === 'category') {
      // If a category is selected, select the first definition in that category
      const firstDefinition = definitions.find(def => def.categoryId === id);
      if (firstDefinition) {
        setSelectedId(firstDefinition.definitionId);
      }
    }
  };

  return (
    <>
      <div className="flex h-full min-h-0 min-w-0 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 w-full">
        <UserDefTree
          categories={categories}
          definitions={definitions}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div className="flex-1 min-h-0 min-w-0 h-full w-full overflow-hidden flex flex-col">
          {selectedId && contentObj ? (
            <>
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {definitions.find(d => d.definitionId === selectedId)?.definitionName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Loại: <span className="font-medium">{contentObj.type || 'JSON'}</span>
                      {' • '}
                      Ngôn ngữ: <span className="font-medium">{contentObj.language}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      contentObj.type === 'sql' ? 'bg-blue-100 text-blue-800' :
                      contentObj.type === 'javascript' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contentObj.type?.toUpperCase() || 'JSON'}
                    </span>
                    <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded border">
                      Ctrl+K để tìm kiếm
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0 p-2">
                <UserDefMonaco
                  content={contentObj.code}
                  language={contentObj.language}
                  className="h-full w-full min-h-0 min-w-0 rounded border border-gray-200"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-4 max-w-md p-8">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Chọn một định nghĩa</h3>
                  <p className="text-gray-500 mt-2">
                    Nhấp vào một item trong danh sách bên trái để xem nội dung chi tiết
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    💡 Nhấn <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+K</kbd> để tìm kiếm nhanh
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={closeSearch}
        categories={categories}
        definitions={definitions}
        definitionContentMap={definitionContentMap}
        onSelect={handleSearchSelect}
      />
    </>
  );
};

export default UserDefManager;
