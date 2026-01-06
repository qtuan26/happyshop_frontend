import React, { useState, useEffect } from 'react';
import { X, Shield, CreditCard, Truck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ApiService from '../../service/api';

const QuickBuyModal = ({ isOpen, onClose, product, selectedSize, quantity }) => {
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);

  // MOMO QR Modal
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [momoOrder, setMomoOrder] = useState(null);
  const [momoQR, setMomoQR] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomerProfile();
    }
  }, [isOpen]);

  const fetchCustomerProfile = async () => {
    try {
      const data = await ApiService.getCustomerProfile();
      setCustomer(data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTotals = () => {
    const subtotal = product.price * quantity;
    let shippingFee = 20;
    let discountAmount = 0;

    if (appliedCoupon) {
      discountAmount = Number(appliedCoupon.discount) || 0;
      if (appliedCoupon.discount_type === 'freeship') shippingFee = 0;
    }

    const total = subtotal + shippingFee - discountAmount;
    return { subtotal, shippingFee, discountAmount, total };
  };

  const { subtotal, shippingFee, discountAmount, total } = calculateTotals();

  const applyCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);

    if (!couponCode) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      const res = await ApiService.quickBuyApplyCoupon({
        coupon_code: couponCode,
        product_id: product.id,
        quantity: quantity
      });

      setAppliedCoupon({
        coupon_code: res.data.coupon_code,
        discount: Number(res.data.discount) || 0,
        discount_type: res.data.discount_type
      });
    } catch (error) {
      setCouponError(error.message || 'Mã giảm giá không hợp lệ');
    }
  };

  // ============ SỬA PHẦN NÀY ============
  const handleCheckout = async () => {
    if (!selectedSize) {
      alert('Vui lòng chọn size!');
      return;
    }

    if (!window.confirm(`Xác nhận thanh toán tổng $${total.toFixed(2)}?`)) return;

    try {
      setLoading(true);
      const res = await ApiService.quickBuyCheckout({
        product_id: product.id,
        size: selectedSize,
        quantity: quantity,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.coupon_code || null
      });

      // COD
      if (paymentMethod === 'COD') {
        alert('Thanh toán thành công (COD)!');
        onClose();
        return;
      }

      // MOMO
      if (paymentMethod === 'MOMO') {
        if (!res.order || !res.qr_code) {
          throw new Error('Không nhận được thông tin thanh toán MOMO');
        }

        setMomoOrder(res.order);
        setMomoQR(res.qr_code);
        setShowMomoModal(true);
      }
    } catch (error) {
      alert(error.message || 'Checkout thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMomo = async () => {
    try {
      await ApiService.confirmQuickBuyMomo(momoOrder.order_id);

      alert('Thanh toán MOMO thành công!');
      setShowMomoModal(false);
      setMomoOrder(null);
      setMomoQR(null);
      onClose();
    } catch (error) {
      alert(error.message || 'Xác nhận thanh toán thất bại');
    }
  };

  const handleCancelMomo = () => {
    if (window.confirm('Bạn có chắc muốn hủy thanh toán MOMO?')) {
      setShowMomoModal(false);
      setMomoOrder(null);
      setMomoQR(null);
      alert('Đơn hàng đã được tạo nhưng chưa thanh toán. Vui lòng thanh toán sau.');
    }
  };
  // ============ HẾT PHẦN SỬA ============

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Mua ngay</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="flex gap-4 bg-gray-50 p-4 rounded-lg">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500">Size: {selectedSize}</p>
                <p className="text-sm text-gray-500">Số lượng: {quantity}</p>
                <p className="font-bold text-red-600 mt-2">
                  ${(product.price * quantity).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Địa chỉ giao hàng</p>
                  {customer ? (
                    <div className="text-sm text-gray-700">
                      <p>{customer.full_name} | {customer.phone}</p>
                      <p>{customer.address}, {customer.city}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Đang tải...</p>
                  )}
                </div>
                <button
                  onClick={() => window.open('/account', '_blank')}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Đổi
                </button>
              </div>
            </div>

            {/* Coupon */}
            <div>
              <label className="block font-semibold mb-2 text-gray-800">
                Mã giảm giá
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={applyCoupon}
                  className="bg-gray-800 text-white px-6 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Áp dụng
                </button>
              </div>
              {couponError && (
                <p className="text-red-500 text-sm mt-2">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ Đã áp dụng mã "{appliedCoupon.coupon_code}", giảm ${discountAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <p className="font-semibold mb-3 text-gray-800">Phương thức thanh toán</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="MOMO"
                    checked={paymentMethod === 'MOMO'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Ví MoMo</span>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Tóm tắt đơn hàng</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Vận chuyển</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : `$${shippingFee}`}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>- ${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-800 pt-3 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-500" />
                  <span>Thanh toán an toàn</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-blue-500" />
                  <span>Hỗ trợ nhiều phương thức</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-orange-500" />
                  <span>Giao hàng nhanh chóng</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || !selectedSize}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOMO QR Modal */}
      {showMomoModal && momoQR && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={handleCancelMomo}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div className="bg-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard size={32} className="text-white" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Thanh toán MoMo</h2>
              <p className="text-gray-600 mb-6">Quét mã QR để thanh toán</p>

              <div className="bg-gray-100 p-6 rounded-xl mb-6">
                <div className="bg-white p-6 rounded-lg inline-block shadow-md">
                  <QRCodeSVG
                    value={momoQR.qr_string}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Quét mã QR bằng ứng dụng MoMo
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold">#{momoOrder.order_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-bold text-pink-600 text-lg">
                    ${momoOrder.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmMomo}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition mb-3"
              >
                Tôi đã thanh toán
              </button>

              <button
                onClick={handleCancelMomo}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Hủy thanh toán
              </button>

              <p className="text-xs text-gray-500 mt-4">
                Đây là mô phỏng thanh toán MoMo
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickBuyModal;