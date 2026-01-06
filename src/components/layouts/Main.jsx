import { Outlet } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import CustomerChat from "../chat/CustomerChat2";
import { useState, useEffect } from "react";

const Main = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Kiểm tra xem user có đăng nhập hay không
    const checkAuth = () => {
      const token = sessionStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    
    // Lắng nghe sự kiện auth change
    window.addEventListener('auth-change', checkAuth);
    
    // Lắng nghe sự kiện mở chat từ Header
    const handleOpenChat = () => {
      setIsChatOpen(true);
    };
    
    window.addEventListener('open-chat', handleOpenChat);
    
    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('open-chat', handleOpenChat);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Header cố định */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Nội dung chính */}
      <div className="pt-35 px-5 min-h-screen">
        <Outlet />
      </div>
      
      <Footer />
      
      {/* Chat Widget - Chỉ hiển thị khi đã đăng nhập */}
      {isAuthenticated && (
        <CustomerChat 
          forceOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default Main;