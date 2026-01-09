import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, Bot, User, ArrowLeft } from 'lucide-react';
import ApiService from '../../service/api';

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: 'Xin chào! Tôi là trợ lý AI của cửa hàng. Tôi có thể giúp bạn:\n\n• Xem đơn hàng gần đây\n• Tìm kiếm sản phẩm\n• Gợi ý sản phẩm phù hợp\n• Trả lời thắc mắc\n\nBạn cần hỗ trợ gì ạ?',
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to AI:', messageToSend);
      const response = await ApiService.chatWithAI(messageToSend);
      console.log('AI Response:', response);
      
      // API trả về { reply: "..." }
      const replyText = response.reply || response.message || 'Không nhận được phản hồi từ AI';
      
      const aiMessage = {
        id: Date.now() + 1,
        text: replyText,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error Details:', {
        message: error.message,
        error: error
      });
      
      let errorText = 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.';
      
      if (error.message.includes('đăng nhập')) {
        errorText = error.message; // Hiển thị message yêu cầu đăng nhập
      } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        errorText = '⚠️ Lỗi kết nối đến server AI. Backend cần cấu hình CORS.';
      } else if (error.message.includes('401')) {
        errorText = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.message.includes('500')) {
        errorText = 'Lỗi server AI. Vui lòng thử lại sau ít phút.';
      } else if (error.message) {
        errorText = error.message;
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot size={28} />
            </div>
            <div>
              <h1 className="font-bold text-xl">Trợ lý AI</h1>
              <p className="text-sm text-blue-100">Luôn sẵn sàng hỗ trợ bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  msg.sender === 'user'
                    ? 'bg-blue-600'
                    : msg.isError
                    ? 'bg-red-500'
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User size={20} className="text-white" />
                ) : (
                  <Bot size={20} className="text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex flex-col max-w-2xl ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`px-5 py-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                      : 'bg-white text-gray-800 shadow-md border border-gray-200 rounded-tl-sm'
                  }`}
                >
                  <p className="text-base whitespace-pre-wrap break-words leading-relaxed">
                    {msg.text}
                  </p>
                </div>
                <span className="text-xs text-gray-400 mt-1 px-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm shadow-md border border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={isLoading}
              className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              aria-label="Gửi tin nhắn"
            >
              {isLoading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Nhấn Enter để gửi • Shift + Enter để xuống dòng
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;