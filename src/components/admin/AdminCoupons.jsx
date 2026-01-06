import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Power, X, Upload, Calendar, DollarSign, Percent, Tag } from 'lucide-react';
import AdminApiService from '../../service/admin-api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });

  const [formData, setFormData] = useState({
    coupon_code: '',
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    max_discount_amount: '',
    min_purchase_amount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    image: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCoupons();
  }, [pagination.current_page, filterActive]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        is_active: filterActive
      };
      const response = await AdminApiService.getCoupons(params);
      
      console.log('API Response:', response); // Debug log
      
      // Xử lý cả 2 trường hợp response structure
      const couponsData = response.data?.data || response.data || [];
      const paginationData = response.data || response;
      
      setCoupons(Array.isArray(couponsData) ? couponsData : []);
      setPagination({
        current_page: paginationData.current_page || 1,
        per_page: paginationData.per_page || 10,
        total: paginationData.total || 0,
        last_page: paginationData.last_page || 1
      });
    } catch (error) {
      console.error('Error fetching coupons:', error);
      console.error('Error details:', error.response?.data);
      alert('Không thể tải danh sách coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2048 * 1024) {
        alert('Kích thước ảnh không được vượt quá 2MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!editingCoupon && !formData.coupon_code) {
      newErrors.coupon_code = 'Vui lòng nhập mã coupon';
    }
    if (!formData.discount_type) {
      newErrors.discount_type = 'Vui lòng chọn loại giảm giá';
    }
    if (!formData.discount_value || formData.discount_value <= 0) {
      newErrors.discount_value = 'Giá trị giảm phải lớn hơn 0';
    }
    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      newErrors.discount_value = 'Phần trăm giảm không được vượt quá 100%';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Vui lòng chọn ngày bắt đầu';
    }
    if (!editingCoupon && !formData.image) {
      newErrors.image = 'Vui lòng chọn ảnh coupon';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '' && key !== 'image') {
          submitData.append(key, formData[key]);
        }
      });

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingCoupon) {
        await AdminApiService.updateCoupon(editingCoupon.coupon_id, submitData);
        alert('Cập nhật coupon thành công!');
      } else {
        await AdminApiService.createCoupon(submitData);
        alert('Tạo coupon thành công!');
      }

      closeModal();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu coupon');
      }
    }
  };

  const handleEdit = async (coupon) => {
    try {
      const response = await AdminApiService.getCouponDetail(coupon.coupon_id);
      const detail = response.data;
      
      setEditingCoupon(detail);
      setFormData({
        coupon_code: detail.coupon_code,
        title: detail.title || '',
        description: detail.description || '',
        discount_type: detail.discount_type,
        discount_value: detail.discount_value,
        max_discount_amount: detail.max_discount_amount || '',
        min_purchase_amount: detail.min_purchase_amount || '',
        usage_limit: detail.usage_limit || '',
        start_date: detail.start_date?.split('T')[0] || '',
        end_date: detail.end_date?.split('T')[0] || '',
        image: null
      });
      setImagePreview(detail.url_image);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching coupon detail:', error);
      alert('Không thể tải thông tin coupon');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await AdminApiService.toggleCouponActive(id);
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      alert('Không thể thay đổi trạng thái coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa coupon này?')) return;
    
    try {
      await AdminApiService.deleteCoupon(id);
      alert('Xóa coupon thành công!');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Không thể xóa coupon này');
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      coupon_code: '',
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      max_discount_amount: '',
      min_purchase_amount: '',
      usage_limit: '',
      start_date: '',
      end_date: '',
      image: null
    });
    setImagePreview(null);
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setImagePreview(null);
    setErrors({});
  };

  const filteredCoupons = coupons.filter(coupon => 
    coupon.coupon_code.toLowerCase().includes(search.toLowerCase()) ||
    (coupon.title && coupon.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý mã giảm giá</h1>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm coupon
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm mã giảm giá..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive(null)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterActive(1)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === 1
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => setFilterActive(0)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === 0
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ngừng hoạt động
            </button>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Không tìm thấy coupon nào
          </div>
        ) : (
          filteredCoupons.map((coupon) => (
            <div key={coupon.coupon_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Coupon Image */}
              <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600">
                <img 
                  src={coupon.url_image} 
                  alt={coupon.title}
                  className="w-full h-full object-cover"
                />
                
              </div>

              {/* Coupon Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 text-gray-800">{coupon.title || coupon.coupon_code}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{coupon.description}</p>

                {/* Coupon Code */}
                <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">Mã giảm giá</p>
                  <p className="text-xl font-bold text-blue-600">{coupon.coupon_code}</p>
                </div>

                {/* Discount Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm:</span>
                    <span className="font-semibold text-gray-800">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}%` 
                        : `${Number(coupon.discount_value).toLocaleString('vi-VN')} ₫`}
                    </span>
                  </div>
                  {coupon.max_discount_amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm tối đa:</span>
                      <span className="font-semibold text-gray-800">
                        {Number(coupon.max_discount_amount).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  )}
                  {coupon.min_purchase_amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Đơn tối thiểu:</span>
                      <span className="font-semibold text-gray-800">
                        {Number(coupon.min_purchase_amount).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  )}
                  {coupon.end_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hạn sử dụng:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(coupon.end_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleToggleActive(coupon.coupon_id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                      coupon.is_active 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    <Power size={16} />
                    {coupon.is_active ? 'Tắt' : 'Bật'}
                  </button>
                  <button 
                    onClick={() => handleEdit(coupon)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.coupon_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination({...pagination, current_page: pagination.current_page - 1})}
            disabled={pagination.current_page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Trước
          </button>
          
          {[...Array(Math.min(5, pagination.last_page))].map((_, i) => {
            let pageNum;
            if (pagination.last_page <= 5) {
              pageNum = i + 1;
            } else if (pagination.current_page <= 3) {
              pageNum = i + 1;
            } else if (pagination.current_page >= pagination.last_page - 2) {
              pageNum = pagination.last_page - 4 + i;
            } else {
              pageNum = pagination.current_page - 2 + i;
            }
            
            return (
              <button
                key={i}
                onClick={() => setPagination({...pagination, current_page: pageNum})}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  pagination.current_page === pageNum 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setPagination({...pagination, current_page: pagination.current_page + 1})}
            disabled={pagination.current_page === pagination.last_page}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCoupon ? 'Chỉnh sửa coupon' : 'Tạo coupon mới'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Coupon Code */}
              {!editingCoupon && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="inline mr-2" size={16} />
                    Mã coupon *
                  </label>
                  <input
                    type="text"
                    name="coupon_code"
                    value={formData.coupon_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: BIGSALE, FREESHIP..."
                  />
                  {errors.coupon_code && <p className="text-red-500 text-sm mt-1">{errors.coupon_code}</p>}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Giảm 50% – Tối đa $50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về coupon..."
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại giảm giá *
                  </label>
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (₫)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline mr-1" size={16} />
                    Giá trị giảm *
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.discount_type === 'percentage' ? '0-100' : '0'}
                    min="0"
                    step="0.01"
                  />
                  {errors.discount_value && <p className="text-red-500 text-sm mt-1">{errors.discount_value}</p>}
                </div>
              </div>

              {/* Max & Min Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giảm tối đa (₫)</label>
                  <input
                    type="number"
                    name="max_discount_amount"
                    value={formData.max_discount_amount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đơn tối thiểu (₫)</label>
                  <input
                    type="number"
                    name="min_purchase_amount"
                    value={formData.min_purchase_amount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giới hạn sử dụng</label>
                <input
                  type="number"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Không giới hạn"
                  min="1"
                />
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-1" size={16} />
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-1" size={16} />
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline mr-1" size={16} />
                  Hình ảnh {!editingCoupon && '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                
                {imagePreview && (
                  <div className="mt-3">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCoupon ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;