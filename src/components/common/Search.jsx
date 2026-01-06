import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/api';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tìm kiếm với debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300); // Đợi 300ms sau khi user ngừng gõ

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSearch = async (query) => {
    try {
      setIsSearching(true);
      const response = await ApiService.searchProducts(query);
      
      // Giả sử API trả về array products
      setSearchResults(response.slice(0, 8)); // Giới hạn 8 kết quả
      setShowDropdown(true);
      setIsSearching(false);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleProductClick = (productId,category_id) => {
    setShowDropdown(false);
    setSearchTerm('');
    navigate(`/${category_id}/${productId}`);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="relative flex-1 max-w-2xl mx-8" ref={searchRef}>
      <form className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowDropdown(true)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full px-4 py-3 pr-24 bg-white rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        />
        
        {/* Clear Button */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Search Button */}
        <button
          
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition-colors flex items-center gap-1"
        >
          <Search size={18} />
        </button>
      </form>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Đang tìm kiếm...
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-600 font-medium">
                  Tìm thấy {searchResults.length} kết quả cho "{searchTerm}"
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {searchResults.map((product) => (
                  <div
                    key={product.product_id}
                    onClick={() => handleProductClick(product.product_id, product.category_id)}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={product.url_image || 'https://via.placeholder.com/64'}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 truncate mb-1">
                        {product.product_name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold text-base">
                          ${formatPrice(product.base_price)}
                        </span>
                        {product.original_price && (
                          <span className="text-gray-400 text-xs line-through">
                            ${formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0 text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Search className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="font-medium">Không tìm thấy kết quả</p>
              <p className="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;