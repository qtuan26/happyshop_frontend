import axiosInstance from './axiosConfig';

class AdminApiService {
  
  

  // ===== CUSTOMERS =====
  static async getCustomers(params = {}) {
    const response = await axiosInstance.get('/admin/customers', { params });
    return response.data.data;
  }

  static async getCustomerDetail(customerId) {
    const response = await axiosInstance.get(`/admin/customers/${customerId}`);
    return response.data.data;
  }

  static async createCustomer(customerData) {
    const response = await axiosInstance.post('/admin/customers', customerData);
    return response.data;
  }

  static async updateCustomer(customerId, customerData) {
    const response = await axiosInstance.put(`/admin/customers/${customerId}`, customerData);
    return response.data;
  }

  static async deleteCustomer(customerId) {
    const response = await axiosInstance.delete(`/admin/customers/${customerId}`);
    return response.data;
  }

  static async bulkDeleteCustomers(customerIds) {
    const response = await axiosInstance.post('/admin/customers/bulk-delete', {
      customer_ids: customerIds
    });
    return response.data;
  }

  static async getCustomerStatistics() {
    const response = await axiosInstance.get('/admin/customers/statistics');
    return response.data.data;
  }
  

  // ===== ORDERS =====
  static async getOrders(params = {}) {
      const response = await axiosInstance.get('/admin/orders', { params });
      return response.data.data;
  }

  static async getOrderDetail(orderId) {
      const response = await axiosInstance.get(`/admin/orders/${orderId}`);
      return response.data.data;
  }

  static async updateOrderStatus(orderId, status) {
      const response = await axiosInstance.put(`/admin/orders/${orderId}/status`, { status });
      return response.data;
  }

  static async cancelOrder(orderId) {
      const response = await axiosInstance.put(`/admin/orders/${orderId}/cancel`);
      return response.data;
  }

    // ===== COUPONS =====
  static async getCoupons(params = {}) {
    const response = await axiosInstance.get('/admin/coupons', { params });
    // Xử lý cả 2 trường hợp: có hoặc không có wrapper "success"
    return response.data.data ? response.data : { data: response.data };
  }

  static async getCouponDetail(couponId) {
    const response = await axiosInstance.get(`/admin/coupons/${couponId}`);
    return response.data;
  }

  static async createCoupon(formData) {
    const response = await axiosInstance.post('/admin/coupons', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  static async updateCoupon(couponId, formData) {
    const response = await axiosInstance.post(`/admin/coupons/${couponId}?_method=PUT`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  static async deleteCoupon(couponId) {
    const response = await axiosInstance.delete(`/admin/coupons/${couponId}`);
    return response.data;
  }

  static async toggleCouponActive(couponId) {
    const response = await axiosInstance.put(`/admin/coupons/${couponId}/toggle`);
    return response.data;
  }

  // ===== PRODUCTS =====
static async getProducts(params = {}) {
  const response = await axiosInstance.get('/admin/products', { params });
  return response.data.data; // Laravel pagination wrapper
}

static async getProductDetail(productId) {
  const response = await axiosInstance.get(`/admin/products/${productId}`);
  return response.data.data;
}

static async getProductStatistics() {
  const response = await axiosInstance.get('/admin/products/statistics');
  return response.data.data;
}

static async createProduct(formData) {
  const response = await axiosInstance.post('/admin/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

static async updateProduct(productId, formData) {
  // Sử dụng POST với _method=PUT vì FormData không support PUT
  const response = await axiosInstance.post(`/admin/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

static async deleteProduct(productId) {
  const response = await axiosInstance.delete(`/admin/products/${productId}`);
  return response.data;
}

static async toggleProductActive(productId) {
  const response = await axiosInstance.post(`/admin/products/${productId}/toggle`);
  return response.data;
}

// Inventory Management
static async getProductInventory(productId) {
  const response = await axiosInstance.get(`/admin/products/${productId}/inventory`);
  return response.data.data;
}

static async updateProductInventory(productId, data) {
  const response = await axiosInstance.post(`/admin/products/${productId}/inventory`, data);
  return response.data;
}

// Reviews
static async getProductReviews(productId) {
  const response = await axiosInstance.get(`/admin/products/${productId}/reviews`);
  return response.data.data;
}

// Sales History
static async getProductSalesHistory(productId) {
  const response = await axiosInstance.get(`/admin/products/${productId}/sales-history`);
  return response.data.data;
}


}

export default AdminApiService;