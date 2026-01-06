import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, AlertCircle, Search } from 'lucide-react';
import ApiService from '../../service/api';

const AdminChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.conversation_id);
      startPolling(selectedConv.conversation_id);
    }
    return () => stopPolling();
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await ApiService.getAdminConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Fetch conversations error:', error);
      setError('Không thể tải danh sách cuộc trò chuyện');
    }
  };

  const fetchMessages = async (convId) => {
    try {
      setLoading(true);
      const data = await ApiService.getConversationMessages(convId);
      setMessages(data.messages || []);
      setError(null);
    } catch (error) {
      console.error('Fetch messages error:', error);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (convId) => {
    stopPolling();
    pollingInterval.current = setInterval(async () => {
      try {
        const data = await ApiService.getConversationMessages(convId);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      message_id: tempId,
      sender_type: 'admin',
      message: messageText,
      created_at: new Date().toISOString(),
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const data = await ApiService.adminSendMessage(selectedConv.conversation_id, messageText);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === tempId ? { ...data, isTemp: false } : msg
        )
      );

      fetchConversations();
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => 
        prev.filter(msg => msg.message_id !== tempId)
      );
      setError('Không thể gửi tin nhắn');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Chat Dashboard</h1>
          <p className="text-gray-600 mt-1">Quản lý cuộc trò chuyện với khách hàng</p>
        </div>

        <div className="grid grid-cols-3 gap-6 h-[700px]">
          {/* Conversations List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  <h2 className="font-semibold">Cuộc trò chuyện</h2>
                </div>
                <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                  {conversations.length}
                </span>
              </div>

              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm khách hàng..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Users size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Không có cuộc trò chuyện nào</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.conversation_id}
                      onClick={() => setSelectedConv(conv)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedConv?.conversation_id === conv.conversation_id
                          ? 'bg-blue-50 border-blue-500 shadow-sm'
                          : 'hover:bg-gray-50 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-gray-800">{conv.customer_name}</p>
                        {conv.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {conv.last_message || 'Chưa có tin nhắn'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(conv.updated_at).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="col-span-2 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
            {selectedConv ? (
              <>
                {/* Header */}
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {selectedConv.customer_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: #{selectedConv.conversation_id}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {loading ? (
                    <div className="text-center text-gray-500 mt-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                      <p>Đang tải tin nhắn...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-500 mt-10">
                      <AlertCircle size={48} className="mx-auto mb-3" />
                      <p>{error}</p>
                      <button 
                        onClick={() => fetchMessages(selectedConv.conversation_id)}
                        className="mt-2 text-blue-600 hover:underline"
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                      <p>Chưa có tin nhắn nào</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.message_id}
                        className={`flex ${
                          msg.sender_type === 'admin'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.sender_type === 'admin'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800 border shadow-sm'
                          } ${msg.isTemp ? 'opacity-60' : ''}`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender_type === 'admin'
                                ? 'text-blue-100'
                                : 'text-gray-400'
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      <Send size={20} />
                      <span className="hidden sm:inline">Gửi</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
                <div className="text-center">
                  <Users size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold text-gray-600">
                    Chọn một cuộc trò chuyện
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Chọn khách hàng từ danh sách bên trái để bắt đầu
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;