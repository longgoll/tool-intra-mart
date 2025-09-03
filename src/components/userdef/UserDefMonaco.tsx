import React from 'react';
import MonacoEditor from '@monaco-editor/react';

interface UserDefMonacoProps {
  content: string | null;
  language?: string;
  className?: string;
}

const UserDefMonaco: React.FC<UserDefMonacoProps> = ({ content, language = 'json', className }) => {
  return (
    <div className={`${className} min-w-0`} style={{ height: '100%', width: '100%' }}>
      <MonacoEditor
        height="100%"
        defaultLanguage={language}
        value={content || ''}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          padding: { top: 10, bottom: 10 },
          theme: 'vs',
        }}
      />
    </div>
  );
};

export default UserDefMonaco;
