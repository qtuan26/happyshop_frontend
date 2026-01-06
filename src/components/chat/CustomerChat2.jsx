import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import ApiService from '../../service/api';

const CustomerChat = ({ forceOpen = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);
  const lastMessageIdRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const maxId = Math.max(...messages.map(m => parseInt(m.message_id) || 0));
      lastMessageIdRef.current = maxId;
    }
  }, [messages]);

  // Xử lý forceOpen từ props
  useEffect(() => {
    if (forceOpen && !isOpen) {
      handleOpen();
    }
  }, [forceOpen]);

  useEffect(() => {
    if (isOpen && !conversationId) {
      initConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && conversationId && !isMinimized) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [isOpen, conversationId, isMinimized]);

  const initConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getOrCreateConversation();
      setConversationId(data.conversation_id);
      setMessages(data.messages || []);
      
      if (data.messages && data.messages.length > 0) {
        const maxId = Math.max(...data.messages.map(m => parseInt(m.message_id) || 0));
        lastMessageIdRef.current = maxId;
      }
    } catch (error) {
      console.error('Init conversation failed:', error);
      setError('Không thể kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    stopPolling();
    
    pollingInterval.current = setInterval(async () => {
      if (!conversationId) return;

      try {
        const data = await ApiService.getNewMessages(conversationId, lastMessageIdRef.current);
        
        if (data.messages && data.messages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.message_id));
            const newMessages = data.messages.filter(m => !existingIds.has(m.message_id));
            
            if (newMessages.length > 0) {
              const maxId = Math.max(...newMessages.map(m => parseInt(m.message_id) || 0));
              lastMessageIdRef.current = Math.max(lastMessageIdRef.current, maxId);
              
              const newUnread = newMessages.filter(msg => msg.sender_type === 'admin').length;
              if (isMinimized && newUnread > 0) {
                setUnreadCount(prevCount => prevCount + newUnread);
              }
              
              return [...prev, ...newMessages];
            }
            
            return prev;
          });
        }
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
    if (!newMessage.trim() || !conversationId) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      message_id: tempId,
      sender_type: 'customer',
      message: messageText,
      created_at: new Date().toISOString(),
      isTemp: true
    };
    
    setMessages(prev => [...prev, tempMessage]);

    try {
      const data = await ApiService.sendChatMessage(conversationId, messageText);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === tempId ? { ...data, isTemp: false } : msg
        )
      );
      
      lastMessageIdRef.current = Math.max(lastMessageIdRef.current, parseInt(data.message_id) || 0);
    } catch (error) {
      console.error('Send message failed:', error);
      setMessages(prev => 
        prev.filter(msg => msg.message_id !== tempId)
      );
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    setError(null);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    stopPolling();
    if (onClose) onClose();
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 hover:scale-110"
          aria-label="Mở chat hỗ trợ"
        >
          <MessageCircle size={28} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          }`}
        >
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Hỗ trợ khách hàng</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Trực tuyến
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {!isMinimized && (
                <button
                  onClick={handleMinimize}
                  className="hover:bg-blue-700 p-1 rounded transition"
                  aria-label="Thu nhỏ"
                >
                  <Minimize2 size={18} />
                </button>
              )}
              <button
                onClick={handleClose}
                className="hover:bg-blue-700 p-1 rounded transition"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {isMinimized ? (
            <button
              onClick={handleMaximize}
              className="flex-1 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
            >
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mr-2 animate-pulse">
                  {unreadCount} tin mới
                </span>
              )}
              <span>Nhấn để mở</span>
            </button>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {loading ? (
                  <div className="text-center text-gray-500 mt-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p>Đang tải...</p>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 mt-10">
                    <p>{error}</p>
                    <button 
                      onClick={initConversation}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-semibold">Chào bạn! 👋</p>
                    <p className="text-sm mt-2">Chúng tôi có thể giúp gì cho bạn?</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`flex ${
                        msg.sender_type === 'customer'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.sender_type === 'customer'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border'
                        } ${msg.isTemp ? 'opacity-60' : ''}`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender_type === 'customer'
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

              <div className="p-4 border-t bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading || !conversationId}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !conversationId}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    aria-label="Gửi tin nhắn"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CustomerChat;