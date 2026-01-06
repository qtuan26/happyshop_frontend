import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader } from 'lucide-react';
import ApiService from '../../service/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const MoMoPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');
  
  const [step, setStep] = useState('confirm'); // 'confirm' | 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!orderId || !amount) {
      setStep('error');
      setErrorMessage('Thông tin thanh toán không hợp lệ');
    }
  }, [orderId, amount]);

  const handleConfirmPayment = async () => {
    setStep('processing');

    try {
      // Giả lập xử lý thanh toán (2 giây)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Gọi API xác nhận thanh toán
      await ApiService.confirmMomo(orderId);

      setStep('success');
      
      // Redirect về trang chủ sau 3 giây
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      setStep('error');
      setErrorMessage(error.message || 'Thanh toán thất bại. Vui lòng thử lại.');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy thanh toán?')) {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-pink-600 text-white p-6 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <img 
              src="https://developers.momo.vn/v3/assets/images/square-logo-f8712a85adfd4797b98e60882e48f840.png" 
              alt="MoMo"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-2xl font-bold">Ví MoMo</h1>
          <p className="text-pink-100 text-sm mt-1">Thanh toán an toàn & nhanh chóng</p>
        </div>

        <div className="p-8">
          {/* STEP 1: CONFIRM */}
          {step === 'confirm' && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">
                Xác nhận thanh toán
              </h2>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">Số tiền thanh toán</p>
                  <p className="text-4xl font-bold text-pink-600">
                    ${parseFloat(amount).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm border-b pb-3">
                    <span className="text-gray-600">Mã đơn hàng</span>
                    <span className="font-semibold">#{orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-3">
                    <span className="text-gray-600">Phương thức</span>
                    <span className="font-semibold">Ví MoMo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trạng thái</span>
                    <span className="text-yellow-600 font-semibold">Chờ xác nhận</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ℹ️ Sau khi xác nhận, số tiền sẽ được trừ từ ví MoMo của bạn. 
                  Đơn hàng sẽ được xử lý ngay lập tức.
                </p>
              </div>

              <button
                onClick={handleConfirmPayment}
                className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-pink-700 transition mb-3 shadow-lg"
              >
                Xác nhận thanh toán ${parseFloat(amount).toFixed(2)}
              </button>

              <button
                onClick={handleCancel}
                className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Hủy bỏ
              </button>
            </div>
          )}

          {/* STEP 2: PROCESSING */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-pink-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-pink-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader size={40} className="text-pink-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">Đang xử lý...</h2>
              <p className="text-gray-600 mb-6">
                Vui lòng chờ trong giây lát
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Không tắt hoặc rời khỏi trang này cho đến khi giao dịch hoàn tất
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="bg-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Check size={48} className="text-white" />
              </div>

              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600 mb-6">
                Giao dịch của bạn đã được xử lý
              </p>

              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mã đơn hàng</span>
                    <span className="font-bold text-green-600">#{orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số tiền</span>
                    <span className="font-bold text-green-600">
                      ${parseFloat(amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thời gian</span>
                    <span className="font-semibold">
                      {new Date().toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ✅ Đơn hàng đã được xác nhận. Bạn sẽ nhận được thông báo qua email.
                </p>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Tự động chuyển về trang chủ sau 3 giây...
              </p>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold hover:bg-pink-700 transition"
              >
                Về trang chủ
              </button>
            </div>
          )}

          {/* STEP 4: ERROR */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="bg-red-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={48} className="text-white" />
              </div>

              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Thanh toán thất bại
              </h2>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-800">
                  ❌ Giao dịch không thể hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ.
                </p>
              </div>

              <button
                onClick={() => navigate('/cart')}
                className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold hover:bg-pink-700 transition mb-3"
              >
                Quay lại giỏ hàng
              </button>

              <button
                onClick={() => setStep('confirm')}
                className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            🔒 Thanh toán được bảo mật bởi MoMo
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Đây là môi trường demo - Không có tiền thật được giao dịch
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoMoPayment;