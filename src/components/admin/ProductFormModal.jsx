import { useState, useEffect } from 'react';
import { X, Upload, Loader, Plus, Trash2 } from 'lucide-react';
import AdminApiService from '../../service/admin-api';

const ProductFormModal = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    brand_id: '',
    category_id: '',
    product_name: '',
    description: '',
    base_price: '',
    color: '',
    material: '',
    gender: '',
    image: null
  });
  
  // Inventory management (only for new products)
  const [inventory, setInventory] = useState([
    { size: '', quantity: '' }
  ]);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const isEditMode = !!product;

  
  const [brands, setBrands] = useState([
    { brand_id: 1, brand_name: 'Nike' },
    { brand_id: 2, brand_name: 'Adidas' },
    { brand_id: 3, brand_name: 'New Balance' },
    { brand_id: 4, brand_name: 'Puma' }
  ]);
  
  const [categories, setCategories] = useState([
    { category_id: 1, category_name: 'Running' },
    { category_id: 2, category_name: 'Basketball' },
    { category_id: 3, category_name: 'Casual' },
    { category_id: 4, category_name: 'Boots' },
    { category_id: 5, category_name: 'Sneakers' },
    { category_id: 6, category_name: 'Training' },
    { category_id: 7, category_name: 'Soccer' }
  ]);

  // Common shoe sizes
  const commonSizes = ['38', '39', '40', '41', '42', '43', '44', '45'];

  useEffect(() => {
    if (product) {
      setFormData({
        brand_id: product.brand?.brand_id || '',
        category_id: product.category?.category_id || '',
        product_name: product.product_name || '',
        description: product.description || '',
        base_price: product.base_price || '',
        color: product.color || '',
        material: product.material || '',
        gender: product.gender || '',
        image: null
      });
      setImagePreview(product.url_image);
      // Don't load inventory when editing - will be managed in ProductDetailModal
    }
  }, [product]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2048 * 1024) {
        setErrors({ ...errors, image: 'Kích thước ảnh không được vượt quá 2MB' });
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
      setErrors({ ...errors, image: null });
    }
  };

  // Inventory handlers
  const addInventoryRow = () => {
    setInventory([...inventory, { size: '', quantity: '' }]);
  };

  const removeInventoryRow = (index) => {
    if (inventory.length > 1) {
      const newInventory = inventory.filter((_, i) => i !== index);
      setInventory(newInventory);
    }
  };

  const updateInventoryRow = (index, field, value) => {
    const newInventory = [...inventory];
    newInventory[index][field] = value;
    setInventory(newInventory);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.brand_id) newErrors.brand_id = 'Vui lòng chọn thương hiệu';
    if (!formData.category_id) newErrors.category_id = 'Vui lòng chọn danh mục';
    if (!formData.product_name.trim()) newErrors.product_name = 'Vui lòng nhập tên sản phẩm';
    if (!formData.base_price || formData.base_price <= 0) newErrors.base_price = 'Giá phải lớn hơn 0';
    if (!isEditMode && !formData.image) newErrors.image = 'Vui lòng chọn ảnh sản phẩm';

    // Inventory validation - ONLY for new products
    if (!isEditMode) {
      const validInventory = inventory.filter(item => item.size && item.quantity);
      if (validInventory.length === 0) {
        newErrors.inventory = 'Vui lòng thêm ít nhất một size với số lượng';
      } else {
        // Check for duplicate sizes
        const sizes = validInventory.map(item => item.size);
        const duplicates = sizes.filter((item, index) => sizes.indexOf(item) !== index);
        if (duplicates.length > 0) {
          newErrors.inventory = `Size ${duplicates[0]} bị trùng lặp`;
        }

        // Check for invalid quantities
        const invalidQty = validInventory.some(item => item.quantity < 0);
        if (invalidQty) {
          newErrors.inventory = 'Số lượng phải lớn hơn hoặc bằng 0';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('brand_id', formData.brand_id);
      submitData.append('category_id', formData.category_id);
      submitData.append('product_name', formData.product_name);
      submitData.append('base_price', formData.base_price);
      
      if (formData.description) submitData.append('description', formData.description);
      if (formData.color) submitData.append('color', formData.color);
      if (formData.material) submitData.append('material', formData.material);
      if (formData.gender) submitData.append('gender', formData.gender);
      if (formData.image) submitData.append('image', formData.image);

      // Add inventory data - ONLY for new products
      if (!isEditMode) {
        const validInventory = inventory.filter(item => item.size && item.quantity);
        validInventory.forEach((item, index) => {
          submitData.append(`inventory[${index}][size]`, item.size);
          submitData.append(`inventory[${index}][quantity]`, item.quantity);
        });
      }

      if (isEditMode) {
        await AdminApiService.updateProduct(product.product_id, submitData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await AdminApiService.createProduct(submitData);
        alert('Thêm sản phẩm thành công!');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting product:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
      
      // Parse validation errors from Laravel
      if (error.response?.data?.errors) {
        const validationErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          validationErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(validationErrors);
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">
            {product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh sản phẩm <span className="text-red-500">*</span>
            </label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              )}
              <div className="flex-1">
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      {product ? 'Chọn ảnh mới (tùy chọn)' : 'Chọn ảnh'}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG tối đa 2MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.product_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tên sản phẩm"
              />
              {errors.product_name && <p className="text-sm text-red-500 mt-1">{errors.product_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.base_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.base_price && <p className="text-sm text-red-500 mt-1">{errors.base_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.brand_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map(brand => (
                  <option key={brand.brand_id} value={brand.brand_id}>
                    {brand.brand_name}
                  </option>
                ))}
              </select>
              {errors.brand_id && <p className="text-sm text-red-500 mt-1">{errors.brand_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu sắc
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Black/White"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chất liệu
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Mesh/Synthetic"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả sản phẩm..."
            />
          </div>

          {/* Inventory Section - ONLY for new products */}
          {!isEditMode && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tồn kho theo size <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Thêm ít nhất một size với số lượng</p>
                </div>
                <button
                  type="button"
                  onClick={addInventoryRow}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                >
                  <Plus size={16} />
                  Thêm size
                </button>
              </div>

              {errors.inventory && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.inventory}</p>
                </div>
              )}

              <div className="space-y-3">
                {inventory.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Size</label>
                        <select
                          value={item.size}
                          onChange={(e) => updateInventoryRow(index, 'size', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Chọn size</option>
                          {commonSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Số lượng</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateInventoryRow(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    {inventory.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInventoryRow(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg mt-6"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick add common sizes */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Thêm nhanh các size phổ biến:</p>
                <div className="flex flex-wrap gap-2">
                  {commonSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        // Check if size already exists
                        if (!inventory.some(item => item.size === size)) {
                          setInventory([...inventory, { size, quantity: '0' }]);
                        }
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      + Size {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Info when editing */}
          {isEditMode && (
            <div className="border-t pt-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Lưu ý:</strong> Để cập nhật số lượng tồn kho theo size, vui lòng sử dụng chức năng "Xem chi tiết" và chỉnh sửa trong tab "Tồn kho".
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {product ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;