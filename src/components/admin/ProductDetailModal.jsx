import { useState, useEffect } from 'react';
import { X, Package, Star, TrendingUp, Edit2, Loader } from 'lucide-react';
import AdminApiService from '../../service/admin-api';

const ProductDetailModal = ({ productId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, inventory, reviews, sales
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [salesHistory, setSalesHistory] = useState(null);
  
  // Inventory editing
  const [editingInventory, setEditingInventory] = useState(false);
  const [inventoryData, setInventoryData] = useState({});

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  useEffect(() => {
    if (activeTab === 'inventory' && !inventory) {
      fetchInventory();
    } else if (activeTab === 'reviews' && !reviews) {
      fetchReviews();
    } else if (activeTab === 'sales' && !salesHistory) {
      fetchSalesHistory();
    }
  }, [activeTab]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const data = await AdminApiService.getProductDetail(productId);
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product detail:', error);
      alert('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const data = await AdminApiService.getProductInventory(productId);
      setInventory(data);
      
      // Initialize inventory data for editing
      const initData = {};
      data.inventory.forEach(item => {
        initData[item.size] = item.quantity;
      });
      setInventoryData(initData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await AdminApiService.getProductReviews(productId);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const data = await AdminApiService.getProductSalesHistory(productId);
      setSalesHistory(data);
    } catch (error) {
      console.error('Error fetching sales history:', error);
    }
  };

  const handleUpdateInventory = async (size, quantity) => {
    try {
      await AdminApiService.updateProductInventory(productId, {
        size,
        quantity: parseInt(quantity)
      });
      fetchInventory();
      alert('Cập nhật tồn kho thành công!');
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Không thể cập nhật tồn kho');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold">{product.product.product_name}</h2>
            <p className="text-sm text-gray-500">ID: {product.product.product_id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex px-6">
            {[
              { key: 'overview', label: 'Tổng quan', icon: Package },
              { key: 'inventory', label: 'Tồn kho', icon: Package },
              { key: 'reviews', label: 'Đánh giá', icon: Star },
              { key: 'sales', label: 'Bán hàng', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product Image */}
                <div className="md:col-span-1">
                  <img
                    src={product.product.url_image}
                    alt={product.product.product_name}
                    className="w-full rounded-lg shadow-md"
                  />
                </div>

                {/* Product Info */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Thương hiệu</p>
                      <p className="font-medium">{product.brand.brand_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Danh mục</p>
                      <p className="font-medium">{product.category.category_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giá bán</p>
                      <p className="text-xl font-bold text-blue-600">
                        ${Number(product.product.base_price).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Màu sắc</p>
                      <p className="font-medium">{product.product.color || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Chất liệu</p>
                      <p className="font-medium">{product.product.material || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giới tính</p>
                      <p className="font-medium">{product.product.gender || 'N/A'}</p>
                    </div>
                  </div>

                  {product.product.description && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Mô tả</p>
                      <p className="text-gray-700">{product.product.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng tồn kho</p>
                  <p className="text-2xl font-bold text-blue-600">{product.inventory.total_quantity}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Đã bán</p>
                  <p className="text-2xl font-bold text-green-600">{product.sales.total_sold}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Doanh thu</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${Number(product.sales.revenue).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Đánh giá</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-yellow-600">{product.reviews.average_rating}</p>
                    <div className="flex">{renderStars(Math.round(product.reviews.average_rating))}</div>
                    <p className="text-sm text-gray-500">({product.reviews.total_reviews})</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && inventory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Quản lý tồn kho theo size</h3>
                <button
                  onClick={() => setEditingInventory(!editingInventory)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Edit2 size={16} />
                  {editingInventory ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inventory.inventory.map(item => (
                  <div key={item.inventory_id} className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">Size {item.size}</p>
                    {editingInventory ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          value={inventoryData[item.size] || 0}
                          onChange={(e) => setInventoryData({
                            ...inventoryData,
                            [item.size]: e.target.value
                          })}
                          className="w-20 px-2 py-1 border rounded"
                        />
                        <button
                          onClick={() => handleUpdateInventory(item.size, inventoryData[item.size])}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Lưu
                        </button>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold mt-2">{item.quantity}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Cập nhật: {new Date(item.last_updated).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && reviews && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-1 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng đánh giá</p>
                  <p className="text-3xl font-bold">{reviews.summary.total_reviews}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xl font-bold text-yellow-600">{reviews.summary.average_rating}</p>
                    <div className="flex">{renderStars(Math.round(reviews.summary.average_rating))}</div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  {reviews.summary.rating_distribution.map(item => (
                    <div key={item.rating} className="flex items-center gap-3 mb-2">
                      <span className="text-sm w-12">{item.rating} sao</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-12 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {reviews.reviews.data && reviews.reviews.data.map(review => (
                  <div key={review.review_id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{review.customer.full_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.review_text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === 'sales' && salesHistory && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng số lượng đã bán</p>
                  <p className="text-3xl font-bold text-green-600">{salesHistory.summary.total_sold}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng doanh thu</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ${Number(salesHistory.summary.total_revenue).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {salesHistory.monthly_sales.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Doanh số theo tháng</h4>
                  <div className="space-y-2">
                    {salesHistory.monthly_sales.map(month => (
                      <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{month.month}</span>
                        <div className="text-right">
                          <p className="font-semibold">{month.total_quantity} sản phẩm</p>
                          <p className="text-sm text-gray-600">
                            ${Number(month.total_revenue).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Lịch sử bán hàng</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Mã đơn</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Khách hàng</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Size</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Số lượng</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Đơn giá</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tổng tiền</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ngày</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {salesHistory.sales_history.data && salesHistory.sales_history.data.map(sale => (
                        <tr key={sale.order_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">#{sale.order_id}</td>
                          <td className="px-4 py-3 text-sm">{sale.customer.full_name}</td>
                          <td className="px-4 py-3 text-sm">{sale.size}</td>
                          <td className="px-4 py-3 text-sm">{sale.quantity}</td>
                          <td className="px-4 py-3 text-sm">
                            ${Number(sale.unit_price).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">
                            ${Number(sale.total).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(sale.order_date).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;