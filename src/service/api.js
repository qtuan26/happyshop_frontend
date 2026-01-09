// src/api/api.js
import axiosInstance from './axiosConfig';
import axios from 'axios';

export default class ApiService {
  // ===== AUTH =====

  static async login(loginDetails) {
    try {
      const response = await axiosInstance.post('/login', loginDetails);

      // Backend bạn trả: { message, user, token }
      return response.data;
    } catch (error) {
      throw error.response?.message || 'Đăng nhập thất bại';
    }
  }

  static async register(registerDetails) {
    try {
      const response = await axios.post('/register', registerDetails);
      return response.message;
    } catch (error) {
      throw error.response?.message || 'Đăng ký thất bại';
    }
  }

  static async getMe() {
    try {
      const response = await axiosInstance.get('/me');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không lấy được thông tin user';
    }
  }

  static async logout() {
    try {
      await axiosInstance.post('/logout');
      sessionStorage.clear();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      sessionStorage.clear();
    }
  }

  // ===== CUSTOMER =====
  // Lấy thông tin cá nhân
  static async getCustomerProfile() {
    try {
      const response = await axiosInstance.get('/customer/profile');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không lấy được thông tin cá nhân';
    }
  }

  // Cập nhật thông tin cá nhân
  static async updateCustomerProfile(profileData) {
    try {
      const response = await axiosInstance.put(
        '/customer/profile',
        profileData
      );
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Cập nhật thông tin thất bại';
    }
  }



  // ===== CATEGORY =====
  static async getCategories() {
    try {
      const response = await axiosInstance.get('/categories');
      return response.data.data; // lấy mảng categories
    } catch (error) {
      throw error.response?.data?.message || 'Không lấy được categories';
    }
  }
  static async getProductsByCategory(categoryId) {
    try {
      const response = await axiosInstance.get(`/categories/${categoryId}/products`);
      return response.data.products; // lấy mảng products
    } catch (error) {
      throw error.response?.data?.message || 'Không lấy được products của category';
    }
  }


  // ===== PRODUCT =====

  static async getProductDetail(productId) {
    try {
      const response = await axiosInstance.get(`/products/${productId}`);
      return response.data.product;
    } catch (error) {
      throw error.response?.data?.message || 'Không lấy được chi tiết sản phẩm';
    }
  }
  // filter products
  static async filterProducts(categoryId, filters) {
    try {
      const params = {};

      if (filters.minPrice) {
        params.min_price = filters.minPrice;
      }

      if (filters.gender.length > 0) {
        params.gender = filters.gender; // gender[]=nam&gender[]=nu
      }

      if (filters.sizes.length > 0) {
        params.sizes = filters.sizes; // sizes[]=40&sizes[]=42
      }

      const response = await axiosInstance.get(
        `/categories/${categoryId}/products/filter`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không lọc được sản phẩm';
    }
  }
  // search products
  static async searchProducts(keyword) {
    try {
      const response = await axiosInstance.get('/products/search', {
        params: { q: keyword }
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không tìm được sản phẩm';
    }
  }

  // Top 6 sản phẩm bán chạy
  static async getTopSellingProducts() {
    try {
      const response = await axiosInstance.get('/products/top-selling');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không lấy được sản phẩm bán chạy';
    }
  }

  // ===== CART =====
  // src/api/api.js
  static async getCart() {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data; // { cart_id, items }
    } catch (error) {
      throw error.response?.data?.message || 'Không lấy được giỏ hàng';
    }
  }
  
  static async updateCartItem(id, data) {
    return axiosInstance.put(`/cart/item/${id}`, data);
  }

  static async removeCartItem(id) {
    return axiosInstance.delete(`/cart/item/${id}`);
  } 
  //api thêm vào giỏ hàng
  static async addToCart(data) {
    try {
      const response = await axiosInstance.post('/cart/add', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thêm được vào giỏ hàng';
    }
  }

  // ===== COUPON =====

  // Lấy danh sách coupon (trang chủ)
  static async getActiveCoupons() {
    try {
      const response = await axiosInstance.get('/coupons');
      return response.data.data; // array coupons
    } catch (error) {
      throw error.response?.data?.message || 'Không lấy được danh sách coupon';
    }
  }

  // Lấy chi tiết coupon khi click
  static async getCouponDetail(couponId) {
    try {
      const response = await axiosInstance.get(`/coupons/${couponId}`);
      return response.data.data; // object coupon
    } catch (error) {
      throw error.response?.data?.message || 'Không lấy được chi tiết coupon';
    }
  }
  static async applyCoupon(data) {
    try {
      const response = await axiosInstance.post('/cart/apply-coupon', data);
      return response.data; // { coupon: {...} }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Áp dụng coupon thất bại');
    }
  }

  // ===== CHECKOUT =====
  static async checkout(data) {
    try {
      const response = await axiosInstance.post('/cart/checkout', data);
      return response.data; // { order_id, total_amount, message }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Thanh toán thất bại');
    }
  }

  // ===== QUICK BUY =====
  static async quickBuyApplyCoupon(data) {
    try {
      const response = await axiosInstance.post('/quick-buy/apply-coupon', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Áp dụng coupon thất bại');
    }
  }

  static async quickBuyCheckout(data) {
    try {
      const response = await axiosInstance.post('/quick-buy/checkout', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Thanh toán thất bại');
    }
  }
  static async confirmQuickBuyMomo(orderId) {
    try {
      const response = await axiosInstance.post('/quick-buy/confirm-momo', { order_id: orderId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Xác nhận thanh toán thất bại');
    }
  }
  // ===== ORDERS =====

  static async getOrders() {
    try {
      const response = await axiosInstance.get('/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Lỗi lấy danh sách đơn hàng';
    }
  }

  static async getOrderDetail(orderId) {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Lỗi lấy chi tiết đơn hàng';
    }
  }

  static async cancelOrder(orderId) {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Lỗi hủy đơn hàng';
    }
  }
  // ===== PRODUCT REVIEW =====
  static async submitReview(productId, data) {
    try {
      const response = await axiosInstance.post(
        `/products/${productId}/reviews`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Gửi đánh giá thất bại'
      );
    }
  }

  // ===== MOMO =====
  static async confirmMomo(orderId) {
    try {
      const response = await axiosInstance.post(
        '/checkout/momo/confirm',
        { order_id: orderId }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Xác nhận thanh toán MOMO thất bại'
      );
    }
  }

  // ===== CUSTOMER CHAT =====
  static async getOrCreateConversation() {
    try {
      const response = await axiosInstance.get('/chat/conversation');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể tạo cuộc trò chuyện';
    }
  }

  static async sendChatMessage(conversationId, message) {
    try {
      const response = await axiosInstance.post('/chat/send', {
        conversation_id: conversationId,
        message: message
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể gửi tin nhắn';
    }
  }

  static async getNewMessages(conversationId, afterMessageId = 0) {
    try {
      const response = await axiosInstance.get(
        `/chat/${conversationId}/messages`,
        { params: { after_message_id: afterMessageId } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể tải tin nhắn mới';
    }
  }

  // ===== ADMIN CHAT =====
  static async getAdminConversations() {
    try {
      const response = await axiosInstance.get('/admin/chat/conversations');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể tải danh sách cuộc trò chuyện';
    }
  }

  static async getConversationMessages(conversationId) {
    try {
      const response = await axiosInstance.get(`/admin/chat/${conversationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể tải tin nhắn';
    }
  }

  static async adminSendMessage(conversationId, message) {
    try {
      const response = await axiosInstance.post('/admin/chat/send', {
        conversation_id: conversationId,
        message: message
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể gửi tin nhắn';
    }
  }

  //recommend products
  static async getRecommendedProducts() {
    const response = await axiosInstance.get('/products/recommended');
    return response.data;
  }

  // ===== AI CHATBOT =====
  static async chatWithAI(message) {
    try {
      console.log('API Call - chatWithAI:', { message });
      
      // Lấy user từ sessionStorage (format: {id, email, role, ...})
      const userStr = sessionStorage.getItem('user');
      let userId = null;
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id; // Lấy id từ object user
          console.log('User ID found:', userId);
        } catch (e) {
          console.warn('Cannot parse user data:', e);
        }
      }
      
      if (!userId) {
        throw new Error('Vui lòng đăng nhập để sử dụng AI Chat');
      }
      
      // GIẢI PHÁP TẠM THỜI: Dùng CORS proxy
      const apiUrl = 'https://ai-recomment-chatbot-php.onrender.com/api/chat';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: String(userId),
          message: message
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('AI Response:', data);
      
      return data;
    } catch (error) {
      console.error('API Error:', {
        message: error.message,
        error: error
      });
      throw error;
    }
  }





}




