import React from 'react';

interface UserDefContentProps {
  content: string | null;
}

const UserDefContent: React.FC<UserDefContentProps> = ({ content }) => {
  return (
    <div style={{ padding: 16, height: '100%', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#f8fafc' }}>
      {content ? content : <span style={{ color: '#888' }}>Chọn một file để xem nội dung</span>}
    </div>
  );
};

export default UserDefContent;
