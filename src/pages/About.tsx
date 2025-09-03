export default function About() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Giới thiệu
      </h1>
      <p className="text-lg text-gray-600 leading-relaxed">
        Đây là trang giới thiệu về công ty và sản phẩm của chúng tôi.
      </p>
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">
          Về chúng tôi
        </h2>
        <p className="text-sm text-blue-700">
          Chúng tôi là một công ty công nghệ chuyên phát triển các sản phẩm 
          chất lượng cao cho khách hàng.
        </p>
      </div>
    </div>
  );
}
