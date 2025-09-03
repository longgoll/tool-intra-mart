import { useRef } from "react";
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { toast } from 'sonner';

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Hàm xử lý file ZIP và tìm user_definition.json
  const handleZipFile = async (file: File) => {
    try {
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      
      // Tìm file user_definition.json trong ZIP
      const userDefFile = zipData.file("user_definition.json");
      if (!userDefFile) {
        // Nếu không tìm thấy ở root, tìm trong các thư mục con
        const files = Object.keys(zipData.files);
        const userDefPath = files.find(path => path.endsWith("user_definition.json"));
        
        if (!userDefPath) {
          toast.error("Không tìm thấy file user_definition.json trong file ZIP!");
          return;
        }
        
        const foundFile = zipData.file(userDefPath);
        if (foundFile) {
          const content = await foundFile.async("text");
          toast.success("File đã được tải lên thành công!");
          navigate('/userdef', { state: { fileContent: content } });
        }
      } else {
        const content = await userDefFile.async("text");
        toast.success("File đã được tải lên thành công!");
        navigate('/userdef', { state: { fileContent: content } });
      }
    } catch (error) {
      console.error("Lỗi khi xử lý file ZIP:", error);
      toast.error("Lỗi khi giải nén file ZIP. Vui lòng kiểm tra lại file!");
    }
  };

  // Hàm xử lý file được chọn
  const handleFileSelect = async (file: File) => {
    if (file.name.endsWith('.zip') || file.name === 'im_logicdesigner-data.zip') {
      await handleZipFile(file);
    } else if (file.name === "user_definition.json") {
      const text = await file.text();
      toast.success("File đã được tải lên thành công!");
      navigate('/userdef', { state: { fileContent: text } });
    } else {
      toast.error("Vui lòng chọn file im_logicdesigner-data.zip hoặc user_definition.json");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng đến với User Definition Manager
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tải lên file im_logicdesigner-data.zip hoặc user_definition.json để bắt đầu quản lý và xem các định nghĩa người dùng của bạn
        </p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Tải lên file định nghĩa
        </h2>
        <div
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
          onClick={() => fileInputRef.current?.click()}
          onDrop={async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) {
              await handleFileSelect(file);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Kéo và thả file vào đây
              </p>
              <p className="text-sm text-gray-500">
                hoặc <span className="text-blue-600 font-medium">nhấp để chọn file</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Chỉ chấp nhận file im_logicdesigner-data.zip hoặc user_definition.json
              </p>
            </div>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json,.zip"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              await handleFileSelect(file);
            }
          }}
        />
      </div>

      {/* Instructions Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Hướng dẫn sử dụng
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h4 className="font-medium text-blue-900">Tải file</h4>
              <p className="text-sm text-blue-700">Chọn file im_logicdesigner-data.zip hoặc user_definition.json từ máy tính của bạn</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h4 className="font-medium text-blue-900">Xem danh sách</h4>
              <p className="text-sm text-blue-700">Duyệt qua các categories và definitions</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h4 className="font-medium text-blue-900">Xem chi tiết</h4>
              <p className="text-sm text-blue-700">Nhấp vào item để xem nội dung code</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
