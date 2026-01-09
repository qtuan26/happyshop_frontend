import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/api';

const RecommendedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendedProducts();
  }, []);

  const fetchRecommendedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.getRecommendedProducts();
      
      // Format data để hiển thị
      const formattedProducts = response.data.map(product => ({
        id: product.product_id,
        name: product.product_name,
        price: parseFloat(product.base_price),
        originalPrice: parseFloat(product.base_price) * 1.3, // Giả sử giảm giá 23%
        image: product.url_image || 'https://via.placeholder.com/300',
        rating: 4.5 // Có thể lấy từ API nếu có
      }));

      setProducts(formattedProducts);
    } catch (err) {
      console.error('Error fetching recommended products:', err);
      setError('Không thể tải sản phẩm gợi ý');
      // Fallback to empty array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    // Scroll to top khi chuyển trang
    window.scrollTo(0, 0);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Ngăn không trigger click vào product
    
    try {
      // Có thể hiển thị modal chọn size trước khi thêm vào giỏ
      alert('Vui lòng vào trang chi tiết để chọn size và thêm vào giỏ hàng');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm gợi ý cho bạn</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-56 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm gợi ý cho bạn</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchRecommendedProducts}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Không hiển thị gì nếu không có sản phẩm
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm gợi ý cho bạn</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((item) => (
          <div 
            key={item.id} 
            onClick={() => handleProductClick(item.id)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="relative">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-56 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
              {item.originalPrice > item.price && (
                <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[40px]">
                {item.name}
              </h3>
              <div className="flex items-center mb-2">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-500 font-bold text-lg">
                    ${item.price.toFixed(2)}
                  </p>
                  {item.originalPrice > item.price && (
                    <p className="text-gray-400 text-xs line-through">
                      ${item.originalPrice.toFixed(2)}
                    </p>
                  )}
                </div>
                <button 
                  onClick={(e) => handleAddToCart(e, item)}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;