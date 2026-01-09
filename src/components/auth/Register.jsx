import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Check, Clock } from 'lucide-react';
import ApiService from '../../service/api';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(300); // 5 phút
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    otp: ''
  });
  
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Đếm ngược thời gian OTP
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Họ và tên là bắt buộc';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Mật khẩu không khớp';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại phải có 10 chữ số';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await ApiService.sendOtp({
        email: formData.email,
        name: formData.name
      });
      
      message.success(res.message || 'Mã OTP đã được gửi đến email của bạn');
      setStep(2);
      setTimer(300);
      setCanResend(false);
    } catch (err) {
      if (err?.errors) {
        setErrors(err.errors);
      } else {
        message.error(err?.message || 'Không thể gửi OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký với OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.otp || formData.otp.length !== 6) {
      setErrors({ otp: 'Vui lòng nhập đầy đủ mã OTP' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone,
        otp: formData.otp
      };

      const res = await ApiService.register(payload);
      message.success(res.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      if (err?.errors) {
        setErrors(err.errors);
      } else {
        message.error(err?.message || 'Đăng ký thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    setCanResend(false);
    setTimer(300);
    setFormData(prev => ({ ...prev, otp: '' }));
    
    setLoading(true);
    try {
      const res = await ApiService.sendOtp({
        email: formData.email,
        name: formData.name
      });
      message.success('Đã gửi lại mã OTP');
    } catch (err) {
      message.error('Không thể gửi lại OTP');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <button 
          onClick={() => step === 1 ? window.history.back() : setStep(1)}
          className="flex items-center text-blue-700 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="font-medium">{step === 1 ? 'Quay lại trang chủ' : 'Quay lại'}</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-8 text-center">
            <div className="inline-block bg-white rounded-full p-4 mb-4">
              <h1 className="text-3xl font-bold text-blue-800">myshoes</h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 1 ? 'Đăng Ký Tài Khoản' : 'Xác Thực Email'}
            </h2>
            <p className="text-blue-200">
              {step === 1 ? 'Tạo tài khoản để trải nghiệm mua sắm tuyệt vời!' : 'Nhập mã OTP đã được gửi đến email của bạn'}
            </p>
          </div>

          <div className="p-8">
            {/* BƯỚC 1: Form đăng ký */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">
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
                        errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                          errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

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
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0123456789"
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>

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
                        errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
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
                          strength.label === 'Trung bình' ? 'text-yellow-500' : 'text-green-500'
                        }`}>{strength.label}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${strength.color}`} style={{ width: `${strength.strength}%` }}></div>
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>

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
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.password_confirmation ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {formData.password_confirmation && formData.password === formData.password_confirmation && (
                      <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500">
                        <Check size={20} />
                      </div>
                    )}
                  </div>
                  {errors.password_confirmation && <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-900 hover:to-blue-800 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Hoặc đăng ký với</span>
                  </div>
                </div>
              </form>
            )}

            {/* BƯỚC 2: Nhập OTP */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Mail size={32} className="text-blue-700" />
                  </div>
                  <p className="text-gray-600 mb-2">Mã OTP đã được gửi đến</p>
                  <p className="text-blue-800 font-semibold text-lg">{formData.email}</p>
                </div>

                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                      Nhập mã OTP (6 chữ số)
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                          handleChange(e);
                        }
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg py-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    {errors.otp && <p className="mt-2 text-sm text-red-500 text-center">{errors.otp}</p>}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mb-4">
                    <div className="flex items-center justify-center gap-2 text-blue-800">
                      <Clock size={20} />
                      <span className="font-semibold">Hết hạn sau: {formatTime(timer)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || formData.otp.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-900 hover:to-blue-800 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 mb-4"
                  >
                    {loading ? 'Đang xác thực...' : 'Hoàn tất đăng ký'}
                  </button>

                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Không nhận được mã?</p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={!canResend || loading}
                      className="text-blue-700 font-semibold hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {canResend ? 'Gửi lại mã OTP' : `Gửi lại (${formatTime(timer)})`}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 1 && (
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Đã có tài khoản?{' '}
                  <a href="/login" className="text-blue-700 hover:text-blue-800 font-semibold">
                    Đăng nhập ngay
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;