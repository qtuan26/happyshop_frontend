import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Power, Package, Star, TrendingUp, Filter } from 'lucide-react';
import AdminApiService from '../../service/admin-api';
import ProductFormModal from './ProductFormModal.jsx';
import ProductDetailModal from './ProductDetailModal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category_id: '',
    brand_id: '',
    is_active: '',
    min_price: '',
    max_price: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });
  
  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Statistics
  const [statistics, setStatistics] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [pagination.current_page, search, filters]);

  useEffect(() => {
    if (showStats) {
      fetchStatistics();
    }
  }, [showStats]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        search,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      };
      
      const data = await AdminApiService.getProducts(params);
      
      setProducts(data.data);
      setPagination({
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total,
        last_page: data.last_page
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await AdminApiService.getProductStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleToggleActive = async (productId) => {
    try {
      await AdminApiService.toggleProductActive(productId);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product:', error);
      alert('Không thể thay đổi trạng thái sản phẩm');
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
      await AdminApiService.deleteProduct(productId);
      fetchProducts();
      alert('Xóa sản phẩm thành công');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Không thể xóa sản phẩm này. Có thể sản phẩm đã có đơn hàng.');
    }
  };

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowFormModal(true);
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setShowFormModal(true);
  };

  const resetFilters = () => {
    setSearch('');
    setFilters({
      category_id: '',
      brand_id: '',
      is_active: '',
      min_price: '',
      max_price: ''
    });
    setPagination({ ...pagination, current_page: 1 });
  };

  const getStockStatusColor = (status) => {
    switch(status) {
      case 'in_stock': return 'text-green-600 bg-green-50';
      case 'out_of_stock': return 'text-red-600 bg-red-50';
      case 'low_stock': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng {pagination.total} sản phẩm</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <TrendingUp size={20} />
            Thống kê
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && statistics && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Thống kê tổng quan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-blue-600">{statistics.overview.total_products}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Đang bán</p>
              <p className="text-2xl font-bold text-green-600">{statistics.overview.active_products}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Hết hàng</p>
              <p className="text-2xl font-bold text-red-600">{statistics.overview.out_of_stock_products}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Sắp hết hàng</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.overview.low_stock_products}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Ngừng bán</p>
              <p className="text-2xl font-bold text-gray-600">{statistics.overview.inactive_products}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Selling */}
            <div>
              <h3 className="font-semibold mb-3">Top 5 Bán chạy</h3>
              <div className="space-y-2">
                {statistics.top_selling_products.map((product, index) => (
                  <div key={product.product_id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-bold">
                      {index + 1}
                    </span>
                    <img src={product.url_image} alt={product.product_name} className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.product_name}</p>
                      <p className="text-xs text-gray-500">Đã bán: {product.total_sold}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Stats */}
            <div>
              <h3 className="font-semibold mb-3">Thống kê theo danh mục</h3>
              <div className="space-y-2">
                {statistics.category_stats.map((cat) => (
                  <div key={cat.category_name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{cat.category_name}</span>
                    <span className="text-sm text-gray-600">{cat.product_count} sản phẩm</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.is_active}
            onChange={(e) => setFilters({...filters, is_active: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang bán</option>
            <option value="0">Ngừng bán</option>
          </select>

          <input
            type="number"
            placeholder="Giá từ"
            value={filters.min_price}
            onChange={(e) => setFilters({...filters, min_price: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            placeholder="Giá đến"
            value={filters.max_price}
            onChange={(e) => setFilters({...filters, max_price: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Filter size={18} />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Package size={48} className="mb-4" />
            <p>Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thương hiệu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kho</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đã bán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.product_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.url_image} 
                            alt={product.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{product.product_name}</p>
                            <p className="text-sm text-gray-500">{product.color || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.category?.category_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.brand?.brand_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${Number(product.base_price).toLocaleString('vi-VN')} 
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{product.stock.total_quantity}</span>
                          <span className={`px-2 py-1 rounded text-xs ${getStockStatusColor(product.stock.status)}`}>
                            {product.stock.status === 'in_stock' ? 'Còn hàng' : 'Hết hàng'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.sales.total_sold}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{product.reviews.average_rating}</span>
                          <span className="text-sm text-gray-500">({product.reviews.total_reviews})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Đang bán' : 'Ngừng bán'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(product)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(product.product_id)}
                            className={`p-2 rounded-lg ${
                              product.is_active 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={product.is_active ? 'Ngừng bán' : 'Bán lại'}
                          >
                            <Power size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.product_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-gray-600">
                  Hiển thị {(pagination.current_page - 1) * pagination.per_page + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} / {pagination.total} sản phẩm
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({...pagination, current_page: pagination.current_page - 1})}
                    disabled={pagination.current_page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  {[...Array(pagination.last_page)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPagination({...pagination, current_page: i + 1})}
                      className={`px-4 py-2 border rounded-lg ${
                        pagination.current_page === i + 1 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPagination({...pagination, current_page: pagination.current_page + 1})}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showFormModal && (
        <ProductFormModal
          product={selectedProduct}
          onClose={() => {
            setShowFormModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            fetchProducts();
            setShowFormModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          productId={selectedProduct.product_id}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminProducts;