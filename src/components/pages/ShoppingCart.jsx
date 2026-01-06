import React, { useEffect, useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Truck,
  ChevronRight,
  Shield,
  CreditCard,
  X
} from 'lucide-react';
import ApiService from '../../service/api';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const navigate = useNavigate();

  // ===== COUPON =====
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // ===== MOMO QR MODAL =====
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [momoOrder, setMomoOrder] = useState(null);
  const [momoQR, setMomoQR] = useState(null);

  const resetCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // ================= FETCH CART =================
  useEffect(() => {
    fetchCart();
    fetchCustomerProfile();
  }, []);

  const fetchCustomerProfile = async () => {
    try {
      const data = await ApiService.getCustomerProfile();
      setCustomer(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCart();
      setCartId(data.cart_id);

      const mappedItems = data.items.map(item => ({
        id: item.cart_item_id,
        productId: item.product_id,
        name: item.product_name,
        image: item.url_image,
        size: item.size,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal)
      }));

      setCartItems(mappedItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE QUANTITY =================
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await ApiService.updateCartItem(id, { quantity: newQuantity });

      setCartItems(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: newQuantity * item.price
              }
            : item
        )
      );
      resetCoupon();
    } catch (error) {
      console.error('Update quantity failed', error);
    }
  };

  // ================= REMOVE ITEM =================
  const removeItem = async (id) => {
    if (!window.confirm('Xóa sản phẩm này khỏi giỏ hàng?')) return;

    try {
      await ApiService.removeCartItem(id);
      setCartItems(prev => prev.filter(item => item.id !== id));
      resetCoupon();
    } catch (error) {
      console.error('Remove item failed', error);
    }
  };

  // ================= CALCULATE TOTALS =================
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
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

  // ================= APPLY COUPON =================
  const applyCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);

    if (!couponCode) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      const res = await ApiService.applyCoupon({ coupon_code: couponCode });

      setAppliedCoupon({
        coupon_code: res.data.coupon_code,
        discount: Number(res.data.discount) || 0,
        discount_type: res.data.discount_type
      });
    } catch (error) {
      setCouponError(error.message || 'Mã giảm giá không hợp lệ');
    }
  };

  // ================= CHECKOUT =================
  const handleCheckout = async () => {
    if (!window.confirm(`Xác nhận thanh toán tổng ${total.toFixed(2)}$?`)) return;

    try {
      const res = await ApiService.checkout({
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.coupon_code || null
      });

      // ===== COD =====
      if (paymentMethod === 'COD') {
        alert('Đặt hàng thành công (COD)!');
        setCartItems([]);
        resetCoupon();
        return;
      }

      // ===== MOMO =====
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
    }
  };

  // ================= CONFIRM MOMO PAYMENT =================
  const handleConfirmMomo = async () => {
    try {
      await ApiService.confirmMomo(momoOrder.order_id);

      alert('Thanh toán MOMO thành công!');
      setShowMomoModal(false);
      setMomoOrder(null);
      setMomoQR(null);
      setCartItems([]);
      resetCoupon();
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

  // ================= UI =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-6">
        <div className="container mx-auto px-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center mb-4 hover:text-blue-200"
          >
            <ArrowLeft size={18} className="mr-2" />
            Tiếp tục mua sắm
          </button>

          <h1 className="text-3xl font-bold">Giỏ hàng</h1>
          <p className="text-blue-200">{cartItems.length} sản phẩm</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <ShoppingBag size={60} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Giỏ hàng của bạn đang trống</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow p-4 flex gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-500">Size: {item.size}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="border px-2 py-1"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="px-3 font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="border px-2 py-1"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="font-bold text-red-600">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT */}
            <div className="bg-white rounded-xl shadow p-6 h-fit">
              {/* SHIPPING ADDRESS */}
              <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Địa chỉ giao hàng</p>

                    {customer ? (
                      <div className="text-sm text-gray-700 mt-1">
                        <p>
                          {customer.full_name} | {customer.phone}
                        </p>
                        <p>
                          {customer.address}, {customer.city}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Đang tải địa chỉ...</p>
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/account')}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Đổi
                  </button>
                </div>
              </div>

              {/* COUPON */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Mã giảm giá</label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                  />

                  <button
                    onClick={applyCoupon}
                    className="bg-gray-800 text-white px-4 rounded hover:bg-gray-700"
                  >
                    Áp dụng
                  </button>
                </div>

                {couponError && (
                  <p className="text-red-500 text-sm mt-2">{couponError}</p>
                )}

                {appliedCoupon && (
                  <p className="text-green-600 text-sm mt-2">
                    Đã áp dụng mã "{appliedCoupon.coupon_code}", giảm ${discountAmount.toFixed(2)}
                  </p>
                )}
              </div>

              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Vận chuyển</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : `$${shippingFee}`}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>- ${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Tổng cộng</span>
                <span className="text-red-600">${total.toFixed(2)}</span>
              </div>

              {/* PAYMENT METHOD */}
              <div className="mb-6">
                <p className="font-semibold mb-2">Phương thức thanh toán</p>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="MOMO"
                      checked={paymentMethod === 'MOMO'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Ví MoMo</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                Thanh toán
                <ChevronRight size={18} />
              </button>

              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield size={16} className="mr-2 text-green-500" />
                  Thanh toán an toàn
                </div>
                <div className="flex items-center">
                  <CreditCard size={16} className="mr-2 text-blue-500" />
                  Hỗ trợ nhiều phương thức
                </div>
                <div className="flex items-center">
                  <Truck size={16} className="mr-2 text-orange-500" />
                  Giao hàng nhanh
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOMO QR MODAL */}
      {showMomoModal && momoQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              <p className="text-gray-600 mb-6">
                Quét mã QR để thanh toán
              </p>

              <div className="bg-gray-100 p-6 rounded-xl mb-6">
                <div className="bg-white p-6 rounded-lg inline-block">
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
    </div>
  );
};

export default ShoppingCart;