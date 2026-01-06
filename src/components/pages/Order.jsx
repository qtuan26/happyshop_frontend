import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const navigate = useNavigate();

  // ================== FETCH ORDERS ==================
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getOrders();
      
      // API trả về { message, data: [...] }
      const ordersData = response.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Lỗi lấy danh sách đơn hàng:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // ================== CANCEL ORDER ==================
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      setCancellingOrder(orderId);
      const response = await ApiService.cancelOrder(orderId);
      
      if (response.message) {
        alert(response.message);
        fetchOrders(); // Reload danh sách
      }
    } catch (error) {
      alert(error || 'Không thể hủy đơn hàng');
    } finally {
      setCancellingOrder(null);
    }
  };

  // ================== TOGGLE EXPAND ==================
  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // ================== STATUS CONFIG ==================
  const getStatusConfig = (status) => {
    const configs = {
      awaiting_confirmation: {
        label: 'Chờ xác nhận',
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      },
      processing: {
        label: 'Đang xử lý',
        icon: AlertCircle,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      },
      shipping: {
        label: 'Đang giao',
        icon: Truck,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200'
      },
      completed: {
        label: 'Hoàn thành',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
      },
      cancelled: {
        label: 'Đã hủy',
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      }
    };
    return configs[status] || configs.awaiting_confirmation;
  };

  // ================== FORMAT CURRENCY ==================
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // ================== FORMAT DATE ==================
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ================= HEADER ================= */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đơn hàng của tôi</h1>
          <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
        </div>

        {/* ================= ORDERS LIST ================= */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-500 mb-6">
              Bạn chưa thực hiện đơn hàng nào. Hãy bắt đầu mua sắm ngay!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedOrder === order.order_id;

              return (
                <div
                  key={order.order_id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* ================= ORDER HEADER ================= */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.border} border`}>
                          <StatusIcon size={18} className={statusConfig.color} />
                          <span className={`font-semibold ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-700">Mã đơn:</span> #{order.order_id}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Ngày đặt</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* ================= ORDER INFO ================= */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tạm tính</p>
                        <p className="text-base font-semibold text-gray-700">
                          {formatCurrency(order.subtotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phí vận chuyển</p>
                        <p className="text-base font-semibold text-gray-700">
                          {formatCurrency(order.shipping_fee)}
                        </p>
                      </div>
                      {parseFloat(order.discount_amount) > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Giảm giá</p>
                          <p className="text-base font-semibold text-green-600">
                            -{formatCurrency(order.discount_amount)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tổng cộng</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Phương thức thanh toán</p>
                        <p className="font-medium text-gray-700">
                          {order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.payment_method}
                        </p>
                      </div>
                    </div>

                    {/* ================= ACTIONS ================= */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => toggleExpand(order.order_id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={20} />
                            <span>Ẩn chi tiết</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={20} />
                            <span>Xem chi tiết ({order.items?.length || 0} sản phẩm)</span>
                          </>
                        )}
                      </button>

                      {order.status === 'awaiting_confirmation' && (
                        <button
                          onClick={() => handleCancelOrder(order.order_id)}
                          disabled={cancellingOrder === order.order_id}
                          className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {cancellingOrder === order.order_id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>Đang hủy...</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={18} />
                              <span>Hủy đơn hàng</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ================= ORDER ITEMS (EXPANDED) ================= */}
                  {isExpanded && order.items && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Package size={18} />
                        Chi tiết sản phẩm
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
                          >
                            {item.product?.url_image && (
                              <img
                                src={item.product.url_image}
                                alt={item.product.product_name}
                                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <div className="flex-grow">
                              <h5 className="font-semibold text-gray-800 mb-2">
                                {item.product?.product_name || 'Sản phẩm'}
                              </h5>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Size:</span>
                                  <span className="ml-2 font-medium text-gray-700">{item.size}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Số lượng:</span>
                                  <span className="ml-2 font-medium text-gray-700">×{item.quantity}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Đơn giá:</span>
                                  <span className="ml-2 font-medium text-gray-700">{formatCurrency(item.unit_price)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Thành tiền:</span>
                                  <span className="ml-2 font-semibold text-blue-600">{formatCurrency(item.subtotal)}</span>
                                </div>
                              </div>
                              {item.product?.color && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <span className="font-medium">Màu sắc:</span> {item.product.color}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ================= COUPONS ================= */}
                      {order.coupons && order.coupons.length > 0 && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={18} />
                            Mã giảm giá đã áp dụng
                          </h5>
                          <div className="space-y-2">
                            {order.coupons.map((orderCoupon, index) => (
                              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {orderCoupon.coupon?.coupon_code}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {orderCoupon.coupon?.title}
                                  </p>
                                </div>
                                <p className="text-lg font-bold text-green-600">
                                  -{formatCurrency(orderCoupon.discount_applied)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ================= ORDER SUMMARY ================= */}
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tạm tính:</span>
                            <span className="font-medium text-gray-800">{formatCurrency(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Phí vận chuyển:</span>
                            <span className="font-medium text-gray-800">{formatCurrency(order.shipping_fee)}</span>
                          </div>
                          {parseFloat(order.discount_amount) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Giảm giá:</span>
                              <span className="font-medium text-green-600">-{formatCurrency(order.discount_amount)}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-800">Tổng cộng:</span>
                              <span className="text-xl font-bold text-blue-600">{formatCurrency(order.total_amount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;