import React, { useState } from 'react';

export interface UserCategory {
  categoryId: string;
  categoryName: string;
  displayName: string;
}

export interface UserDefinition {
  definitionId: string;
  definitionName: string;
  categoryId: string;
  definitionType?: string; // 'sql' | 'javascript' | etc.
}

interface UserDefTreeProps {
  categories: UserCategory[];
  definitions: UserDefinition[];
  selectedId: string | null;
  onSelect: (definitionId: string) => void;
}

const UserDefTree: React.FC<UserDefTreeProps> = ({ categories, definitions, selectedId, onSelect }) => {
  // State để quản lý trạng thái mở/đóng của từng category
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(cat => cat.categoryId)) // Mặc định tất cả đều mở
  );

  // Hàm toggle trạng thái mở/đóng của category
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Hàm lấy icon dựa trên definitionType
  const getDefinitionIcon = (definitionType?: string) => {
    switch (definitionType?.toLowerCase()) {
      case 'sql':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
        );
      case 'javascript':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
          </svg>
        );
    }
  };

  // Hàm lấy màu cho icon và text dựa trên definitionType
  const getDefinitionColors = (definitionType?: string) => {
    switch (definitionType?.toLowerCase()) {
      case 'sql':
        return {
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          hoverBg: 'hover:bg-orange-100'
        };
      case 'javascript':
        return {
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          hoverBg: 'hover:bg-yellow-100'
        };
      default:
        return {
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          hoverBg: 'hover:bg-gray-100'
        };
    }
  };
  return (
    <div className="w-72 border-r border-gray-200 h-full overflow-y-auto bg-gray-50">
      <div className="p-3 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-900 text-sm">Danh mục & Định nghĩa</h3>
        <p className="text-xs text-gray-500 mt-1">Chọn một item để xem chi tiết</p>
      </div>
      <div className="p-3 space-y-3">
        {categories.map(cat => {
          const isExpanded = expandedCategories.has(cat.categoryId);
          const categoryDefinitions = definitions.filter(def => def.categoryId === cat.categoryId);
          
          return (
            <div key={cat.categoryId} className="space-y-1">
              <div 
                className="flex items-center space-x-2 py-1.5 px-2 bg-blue-50 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                onClick={() => toggleCategory(cat.categoryId)}
              >
                {/* Icon mũi tên để hiển thị trạng thái mở/đóng */}
                <div className="flex items-center justify-center w-4 h-4">
                  <svg 
                    className={`w-3 h-3 text-blue-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <h4 className="font-semibold text-blue-900 text-xs">
                  {cat.displayName || cat.categoryName}
                </h4>
                <span className="text-xs text-blue-600 ml-auto">
                  ({categoryDefinitions.length})
                </span>
              </div>
              
              {/* Chỉ hiển thị definitions khi category được mở */}
              {isExpanded && (
                <div className="ml-3 space-y-0.5">
                  {categoryDefinitions.map(def => {
                    const colors = getDefinitionColors(def.definitionType);
                    return (
                      <div
                        key={def.definitionId}
                        className={`py-1.5 px-2 rounded cursor-pointer transition-all duration-200 text-xs ${
                          selectedId === def.definitionId 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : `${colors.bgColor} ${colors.hoverBg} shadow-sm ${colors.borderColor} border`
                        }`}
                        onClick={() => onSelect(def.definitionId)}
                      >
                        <div className="flex items-center space-x-1.5">
                          <div className={`flex items-center justify-center ${
                            selectedId === def.definitionId ? 'text-white' : colors.iconColor
                          }`}>
                            {getDefinitionIcon(def.definitionType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-xs font-medium">{def.definitionId}</div>
                            <div className={`truncate text-xs mt-0.5 ${
                              selectedId === def.definitionId ? 'text-blue-100' : 'text-gray-500'
                            }`}>{def.definitionName}</div>
                          </div>
                          {def.definitionType && (
                            <div className={`text-xs px-1.5 py-0.5 rounded ${
                              selectedId === def.definitionId 
                                ? 'bg-blue-700 text-blue-100' 
                                : `${colors.bgColor} ${colors.iconColor} border ${colors.borderColor}`
                            }`}>
                              {def.definitionType.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDefTree;
