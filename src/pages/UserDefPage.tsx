/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserDefManager from '../components/userdef/UserDefManager';

const UserDefPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileContent = location.state?.fileContent;

  // Nếu không có dữ liệu, quay lại trang chủ
  React.useEffect(() => {
    if (!fileContent) {
      navigate('/');
    }
  }, [fileContent, navigate]);

  if (!fileContent) return null;

  let parsedData: any = null;
  try {
    parsedData = JSON.parse(fileContent);
  } catch {
    return <div className="p-4 text-red-600">File không hợp lệ!</div>;
  }

  return (
    <div className="w-full h-[calc(100vh-100px)] bg-transparent flex flex-col overflow-hidden">
      {/* <div className="px-4 py-3 bg-white rounded-lg border border-gray-200 mb-4 shadow-sm">
        <h2 className="font-bold text-xl text-gray-900">Quản lý User Definition</h2>
        <p className="text-gray-600 mt-1 text-sm">Xem và quản lý các định nghĩa người dùng từ file JSON</p>
      </div> */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <UserDefManager userDefData={parsedData} />
      </div>
    </div>
  );
};

export default UserDefPage;
