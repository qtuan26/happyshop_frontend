import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, LogOut, MessageCircle,Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/api';
import SearchBar from './Search';

const Header = () => {
  const [currentPage, setCurrentPage] = useState(null);
  const [cartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  // ================== CHECK LOGIN ==================
  const checkLogin = () => {
    const token = sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  // ================== INIT ==================
  useEffect(() => {
    checkLogin();

    // Lắng nghe login/logout từ nơi khác
    window.addEventListener('auth-change', checkLogin);
    window.addEventListener('storage', checkLogin);

    return () => {
      window.removeEventListener('auth-change', checkLogin);
      window.removeEventListener('storage', checkLogin);
    };
  }, []);

  // ================== FETCH CATEGORY ==================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await ApiService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Lỗi lấy categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // ================== LOGOUT ==================
  const handleLogout = () => {
    if (!window.confirm('Bạn có chắc muốn đăng xuất?')) return;

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    setIsLoggedIn(false);
    window.dispatchEvent(new Event('auth-change'));

    navigate('/login');
  };

  // ================== MỞ CHAT ==================
  const handleOpenChat = () => {
    if (!isLoggedIn) {
      // Nếu chưa đăng nhập, chuyển đến trang login
      navigate('/login');
      return;
    }
    
    // Dispatch event để Main layout bắt và mở chat
    // window.dispatchEvent(new Event('open-chat'));
    navigate('/chatbot');
  };

  const handleCategoryClick = (category) => {
    setCurrentPage(category.category_id);
    navigate(`/${category.category_id}`);
  };

  return (
    <div className="bg-gray-50">
      <header className="bg-linear-to-r from-blue-800 to-blue-900 text-white">

        {/* ================= TOP BAR ================= */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            {/* LOGO */}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/introduction')}
            >
              <h1 className="text-3xl font-bold">happyshop</h1>
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                🇻🇳
              </span>
            </div>

            {/* SEARCH */}
            <SearchBar />

            {/* SUPPORT - Sửa thành mở chat */}
            <button
              className="px-4 py-3 hover:bg-blue-800 transition-colors rounded-lg flex items-center gap-2"
              onClick={handleOpenChat}
            >
              <MessageCircle size={20} />
              <span className="font-bold">Hỗ trợ với AI</span>
            </button>

            {/* USER + CART */}
            <div className="flex items-center space-x-6">

              {/* USER */}
              {isLoggedIn ? (
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/account')}
                    className="flex items-center gap-2 hover:text-blue-300"
                  >
                    <User size={20} />
                    <span className="font-semibold">Tài khoản</span>
                  </button>
                  {/* Đơn hàng */}
                  <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 hover:text-blue-300 transition-colors"
                  >
                    <Package size={20} />
                    <span className="font-medium hidden lg:block">Đơn hàng</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 hover:text-red-400"
                  >
                    <LogOut size={20} />
                    <span className="font-semibold">Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-2 hover:text-blue-300"
                >
                  <User size={20} />
                  <div className="text-left text-sm">
                    <p>Tài khoản</p>
                    <p className="font-semibold">Đăng nhập / Đăng ký</p>
                  </div>
                </button>
              )}

              {/* CART */}
              <div
                className="relative cursor-pointer hover:text-blue-300"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ================= NAV ================= */}
        <nav className="bg-blue-900 border-t border-blue-700">
          <div className="container mx-auto px-4 flex">
            <button
              className="px-15 py-3 hover:bg-blue-800 flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="font-bold">SALE</span>
            </button>

            {categories.map(category => (
              <button
                key={category.category_id}
                onClick={() => handleCategoryClick(category)}
                className={`px-15 py-3 hover:bg-blue-800 ${
                  currentPage === category.category_id ? 'bg-blue-800' : ''
                }`}
              >
                {category.category_name}
              </button>
            ))}
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;