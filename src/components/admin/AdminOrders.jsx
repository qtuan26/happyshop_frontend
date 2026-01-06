import { useState, useEffect } from 'react';
import { Search, Eye, Package, X, XCircle } from 'lucide-react';
import AdminApiService from '../../service/admin-api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.current_page, search, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        search,
        status: statusFilter
      };
      const data = await AdminApiService.getOrders(params);
      setOrders(data.data);
      setPagination(prev => ({
        ...prev,
        current_page: data.current_page,
        total: data.total,
        last_page: data.last_page
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('Có lỗi xảy ra khi tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (orderId) => {
    try {
      const data = await AdminApiService.getOrderDetail(orderId);
      setSelectedOrder(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      showNotification('Có lỗi xảy ra khi tải chi tiết đơn hàng', 'error');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await AdminApiService.updateOrderStatus(orderId, newStatus);
      showNotification('Cập nhật trạng thái thành công', 'success');
      fetchOrders();
      
      // Cập nhật modal nếu đang mở
      if (selectedOrder && selectedOrder.order_id === orderId) {
        const data = await AdminApiService.getOrderDetail(orderId);
        setSelectedOrder(data);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Không thể cập nhật trạng thái', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Hệ thống sẽ hoàn lại kho và coupon.')) return;
    
    try {
      await AdminApiService.cancelOrder(orderId);
      showNotification('Hủy đơn hàng thành công', 'success');
      fetchOrders();
      
      // Cập nhật modal nếu đang mở
      if (selectedOrder && selectedOrder.order_id === orderId) {
        const data = await AdminApiService.getOrderDetail(orderId);
        setSelectedOrder(data);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.response?.data?.message || 'Không thể hủy đơn hàng';
      showNotification(errorMessage, 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const statusColors = {
    awaiting_confirmation: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    awaiting_confirmation: 'Chờ xác nhận',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' :
          notification.type === 'warning' ? 'bg-yellow-500' :
          'bg-blue-500'
        } text-white animate-fade-in`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <div className="flex items-center gap-2">
          <Package className="text-blue-600" size={24} />
          <span className="text-sm text-gray-600">Tổng: {pagination.total} đơn</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm mã đơn hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div> */}
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="awaiting_confirmation">Chờ xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.order_id}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer?.full_name}</p>
                          <p className="text-sm text-gray-500">{order.customer?.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(order.order_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${Number(order.total_amount).toLocaleString('vi-VN')} 
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.order_id, e.target.value)}
                          disabled={order.status === 'cancelled'}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]} border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(order.order_id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          {!['shipping', 'completed', 'cancelled'].includes(order.status) && (
                            <button
                              onClick={() => handleCancelOrder(order.order_id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Hủy đơn hàng"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Hiển thị {(pagination.current_page - 1) * pagination.per_page + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} / {pagination.total} đơn hàng
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({...pagination, current_page: pagination.current_page - 1})}
                    disabled={pagination.current_page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
                  >
                    Trước
                  </button>
                  
                  {[...Array(Math.min(5, pagination.last_page))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => setPagination({...pagination, current_page: pageNum})}
                        className={`px-4 py-2 border rounded-lg transition ${
                          pagination.current_page === pageNum 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'border-gray-300 hover:bg-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPagination({...pagination, current_page: pagination.current_page + 1})}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.order_id}</h2>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">👤</span>
                  </div>
                  Thông tin khách hàng
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[100px]">Tên:</span>
                    <span className="text-gray-900">{selectedOrder.customer?.full_name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[100px]">Email:</span>
                    <span className="text-gray-900">{selectedOrder.customer?.user?.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[100px]">SĐT:</span>
                    <span className="text-gray-900">{selectedOrder.customer?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[100px]">Địa chỉ:</span>
                    <span className="text-gray-900">{selectedOrder.customer?.address || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[100px]">Ngày đặt:</span>
                    <span className="text-gray-900">{new Date(selectedOrder.order_date).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="text-purple-600" size={16} />
                  </div>
                  Sản phẩm ({selectedOrder.items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.order_item_id} className="flex gap-4 border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition">
                      <img 
                        src={item.product?.url_image || '/placeholder.png'} 
                        alt={item.product?.product_name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => e.target.src = '/placeholder.png'}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product?.product_name}</p>
                        <p className="text-sm text-gray-500 mt-1">Size: {item.size} | Số lượng: {item.quantity}</p>
                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          Đơn giá: ${Number(item.unit_price).toLocaleString('vi-VN')} 
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${Number(item.subtotal).toLocaleString('vi-VN')} </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              

              {/* Payment Summary */}
              <div className="border-t-2 border-gray-200 pt-4">
                <h3 className="font-semibold text-lg mb-3">Tổng kết thanh toán</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">${Number(selectedOrder.subtotal || 0).toLocaleString('vi-VN')} </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">${Number(selectedOrder.shipping_fee || 0).toLocaleString('vi-VN')} </span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">-${Number(selectedOrder.discount_amount).toLocaleString('vi-VN')} </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-3 mt-3">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">${Number(selectedOrder.total_amount).toLocaleString('vi-VN')} </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Đóng
                </button>
                {!['shipping', 'completed', 'cancelled'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => {
                      handleCancelOrder(selectedOrder.order_id);
                      setShowModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;