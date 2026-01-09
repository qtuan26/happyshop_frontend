import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Share2, Star, Truck, ShieldCheck, RotateCcw, ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import message from 'antd/lib/message';
import QuickBuyModal from '../pages/QuickBuyModal';
import ApiService from '../../service/api';
import RecommendedProducts from './RecommendedProducts';

const ProductDetail = () => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuickBuyModal, setShowQuickBuyModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const isLoggedIn = !!sessionStorage.getItem('token');


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getProductDetail(productId);
         

        // Xử lý images - nếu là string thì split, nếu là array thì giữ nguyên
        let images = [];
        if (typeof data.url_image === 'string') {
          images = data.url_image.includes(',') 
            ? data.url_image.split(',').map(img => img.trim())
            : [data.url_image];
        } else if (Array.isArray(data.url_image)) {
          images = data.url_image;
        } else {
          images = ['https://via.placeholder.com/800'];
        }

        

        // Lấy sizes từ inventory và lọc những size còn hàng
        const availableSizes = data.inventory
          .filter(inv => inv.quantity > 0)
          .map(inv => ({
            size: inv.size,
            quantity: inv.quantity,
            inventoryId: inv.inventory_id
          }))
          .sort((a, b) => parseInt(a.size) - parseInt(b.size));

        // Tính discount nếu có originalPrice
        const discount = data.original_price 
          ? Math.round((1 - parseFloat(data.base_price) / parseFloat(data.original_price)) * 100)
          : 0;

        setProduct({
          id: data.product_id,
          name: data.product_name,
          brand: data.brand_name || 'N/A',
          category: data.category_name || 'Giày',
          price: parseFloat(data.base_price),
          originalPrice: data.original_price ? parseFloat(data.original_price) : parseFloat(data.base_price) * 1.3,
          discount: discount,
          rating: parseFloat(data.avg_rating) || 0,
          reviewCount: data.review_count || 0,
          soldCount: data.sold_count || 0,
          inStock: data.total_stock > 0,
          stockCount: data.total_stock,
          description: data.description || 'Chưa có mô tả',
          sku: `SKU-${data.product_id}`,
          
          // Processed data
          images: images,
          colors: data.color,
          sizes: availableSizes,
          inventory: data.inventory,
          reviews: data.reviews || []
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  

  // Related products - giữ nguyên hoặc fetch từ API
  const relatedProducts = [
    { id: 2, name: 'Nike Air Force 1', price: 2200000, originalPrice: 2800000, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop', rating: 4.7 },
    { id: 3, name: 'Nike React Infinity', price: 2800000, originalPrice: 3500000, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop', rating: 4.9 },
    { id: 4, name: 'Nike Zoom Pegasus', price: 2300000, originalPrice: 3000000, image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=300&h=300&fit=crop', rating: 4.6 },
    { id: 5, name: 'Nike Air Zoom', price: 2600000, originalPrice: 3200000, image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300&h=300&fit=crop', rating: 4.8 }
  ];

  const handleQuantityChange = (type) => {
    if (!selectedSize) return;
    
    const sizeData = product.sizes.find(s => s.size === selectedSize);
    const maxQuantity = sizeData ? sizeData.quantity : 0;

    if (type === 'increase' && quantity < maxQuantity) {
      setQuantity(quantity + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    // Reset quantity về 1 khi đổi size
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      message.error('Vui lòng chọn size!');
      return;
    }

    try {
      await ApiService.addToCart({
        product_id: product.id,
        size: selectedSize,
        quantity: quantity
      });

      alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      alert(error);
      console.error('Add to cart failed:', error);
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Vui lòng chọn size!');
      return;
    }
    setShowQuickBuyModal(true);
    
  };
  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      message.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setSubmittingReview(true);

      await ApiService.submitReview(product.id, {
        rating: reviewRating,
        review_text: reviewText
      });

      message.success('Đánh giá thành công');

      // Reset form
      setReviewRating(5);
      setReviewText('');

      // Reload product để cập nhật review mới
      const data = await ApiService.getProductDetail(productId);
      setProduct(prev => ({
        ...prev,
        reviews: data.reviews,
        reviewCount: data.review_count,
        rating: data.avg_rating
      }));

    } catch (error) {
      message.error(error.message);
    } finally {
      setSubmittingReview(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-800 to-blue-900 text-white py-4">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center hover:text-blue-200 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <span className="hover:text-blue-600 cursor-pointer">Trang chủ</span>
          <span className="mx-2">/</span>
          <span className="hover:text-blue-600 cursor-pointer">{product.category}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>

        {/* Product Detail Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left - Images */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
              <div className="relative mb-4 group">
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-[500px] object-contain bg-white rounded-xl"
                />
                
              </div>
              
              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <div 
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <Truck className="mx-auto mb-2 text-blue-600" size={28} />
                <p className="text-xs font-semibold text-gray-800">Vận chuyển mọi nơi</p>
                <p className="text-xs text-gray-500">Nhanh - An Toàn - Uy Tín</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <ShieldCheck className="mx-auto mb-2 text-blue-600" size={28} />
                <p className="text-xs font-semibold text-gray-800">Chính hãng 100%</p>
                <p className="text-xs text-gray-500">Cam kết hoàn tiền</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <RotateCcw className="mx-auto mb-2 text-blue-600" size={28} />
                <p className="text-xs font-semibold text-gray-800">Đổi trả 30 ngày</p>
                <p className="text-xs text-gray-500">Miễn phí đổi size</p>
              </div>
            </div>
          </div>

          {/* Right - Product Info */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Brand */}
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {product.brand}
                </span>
                {product.inStock && (
                  <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full ml-2">
                    Còn hàng
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

              {/* Rating & Stats */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-800">{product.rating.toFixed(1)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">{product.reviewCount} đánh giá</span>
                </div>
                {product.soldCount > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-600">{product.soldCount} đã bán</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-red-600">
                    ${(product.price).toLocaleString('vi-VN')}
                  </span>
                  {product.originalPrice && product.originalPrice !== product.price && (
                    <span className="text-2xl text-gray-400 line-through">
                      ${(product.originalPrice).toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Giá đã bao gồm VAT</p>
              </div>

              

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Kích thước: {selectedSize && <span className="text-blue-600">{selectedSize}</span>}
                  </label>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Hướng dẫn chọn size
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {product.sizes.map((sizeData) => (
                    <button
                      key={sizeData.size}
                      onClick={() => handleSizeSelect(sizeData.size)}
                      disabled={sizeData.quantity === 0}
                      className={`py-3 border-2 rounded-lg font-semibold transition-all relative ${
                        selectedSize === sizeData.size
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : sizeData.quantity === 0
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:border-blue-400 text-gray-700'
                      }`}
                    >
                      {sizeData.size}
                      {sizeData.quantity > 0 && sizeData.quantity < 10 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {sizeData.quantity}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-xs text-gray-500 mt-2">
                    Còn {product.sizes.find(s => s.size === selectedSize)?.quantity} sản phẩm
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Số lượng: <span className="text-gray-600 font-normal">({product.stockCount} sản phẩm có sẵn)</span>
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={!selectedSize}
                    className="w-10 h-10 border-2 border-gray-300 rounded-l-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} className="mx-auto text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-16 h-10 border-t-2 border-b-2 border-gray-300 text-center font-semibold"
                  />
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    disabled={!selectedSize}
                    className="w-10 h-10 border-2 border-gray-300 rounded-r-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} className="mx-auto text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                >
                  <ShoppingCart size={20} />
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  Mua ngay
                </button>
              </div>

              {/* SKU */}
              <div className="text-sm text-gray-600">
                <span className="font-semibold">SKU:</span> {product.sku}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="border-b mb-6">
            <div className="flex gap-8">
              <button 
                onClick={() => setActiveTab('description')}
                className={`pb-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'description' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                Mô tả sản phẩm
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'reviews' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                Đánh giá ({product.reviewCount})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'description' && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Mô tả sản phẩm</h3>
              <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="mb-8">
              {/* Write Review */}
              <div className="mb-8 border rounded-xl p-6 bg-gray-50">
                <h4 className="text-lg font-semibold mb-4">
                  Viết đánh giá của bạn
                </h4>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      onClick={() => setReviewRating(star)}
                      className={`cursor-pointer mr-1 ${
                        star <= reviewRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-3 text-sm text-gray-600">
                    {reviewRating}/5
                  </span>
                </div>

                {/* Text */}
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Submit */}
                <div className="mt-4 text-right">
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Đánh giá từ khách hàng</h3>
              {product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.review_id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {review.customer?.full_name || 'Khách hàng'}
                          </p>

                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-3">
                              {new Date(review.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700">{review.review_text}</p>

                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
              )}
            </div>
            
          )}
        </div>

        
        {/* Sản phẩm gợi ý */}
      {isLoggedIn && <RecommendedProducts />}
      </div>
      <QuickBuyModal
        isOpen={showQuickBuyModal}
        onClose={() => setShowQuickBuyModal(false)}
        product={product}
        selectedSize={selectedSize}
        quantity={quantity}
      />
    </div>
  );
};

export default ProductDetail;