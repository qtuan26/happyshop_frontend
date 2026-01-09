import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Check } from 'lucide-react';
import ApiService from '../../service/api';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name) {
      newErrors.name = 'Họ và tên là bắt buộc';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    
    // Phone number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại phải có 10 chữ số';
    }
    
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword, 
        phone: formData.phoneNumber,                     
      };

      const res = await ApiService.register(payload);
      message.success(res);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login');
    } catch (err) {
      if (err?.errors) {
        setErrors(err.errors); // lỗi validation từ Laravel
      } else {
        message.error(err?.message || 'Đăng ký thất bại');
      }
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return { strength: 33, label: 'Yếu', color: 'bg-red-500' };
    if (strength <= 3) return { strength: 66, label: 'Trung bình', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Mạnh', color: 'bg-green-500' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-blue-700 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="font-medium">Quay lại trang chủ</span>
        </button>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-800 to-blue-900 p-8 text-center">
            <div className="inline-block bg-white rounded-full p-4 mb-4">
              <h1 className="text-3xl font-bold text-blue-800">myshoes</h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Đăng Ký Tài Khoản</h2>
            <p className="text-blue-200">Tạo tài khoản để trải nghiệm mua sắm tuyệt vời!</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="0123456789"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.phoneNumber 
                          ? 'border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
                      <span className={`text-xs font-semibold ${
                        strength.label === 'Yếu' ? 'text-red-500' :
                        strength.label === 'Trung bình' ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>{strength.label}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${strength.color}`}
                        style={{ width: `${strength.strength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500">
                      <Check size={20} />
                    </div>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-linear-to-r from-blue-800 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-900 hover:to-blue-800 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Đăng Ký
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Hoặc đăng ký với</span>
                </div>
              </div>

             
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Đã có tài khoản?{' '}
                <a href="/login" className="text-blue-700 hover:text-blue-800 font-semibold">
                  Đăng nhập ngay
                </a>
              </p>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Register;