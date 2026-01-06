import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Circle } from 'lucide-react';

// Dummy data
const DUMMY_CONVERSATIONS = [
  {
    id: 1,
    customerName: 'John Doe',
    lastMessage: 'Thanks for your help with the order!',
    timestamp: '12:40 PM',
    unreadCount: 2,
    isOnline: true,
    messages: [
      { id: 1, text: 'Hi, I have a question about my order', isOwn: false, timestamp: '12:35 PM' },
      { id: 2, text: 'Hello John! I\'d be happy to help. What\'s your order number?', isOwn: true, timestamp: '12:36 PM' },
      { id: 3, text: 'It\'s #12345', isOwn: false, timestamp: '12:37 PM' },
      { id: 4, text: 'Let me look that up for you right away.', isOwn: true, timestamp: '12:38 PM' },
      { id: 5, text: 'Thanks for your help with the order!', isOwn: false, timestamp: '12:40 PM' },
    ]
  },
  {
    id: 2,
    customerName: 'Alice Smith',
    lastMessage: 'Hi, I need help with my account',
    timestamp: '09:10 AM',
    unreadCount: 0,
    isOnline: false,
    messages: [
      { id: 1, text: 'Hi, I need help with my account', isOwn: false, timestamp: '09:10 AM' },
      { id: 2, text: 'Hello Alice! I can help you with that. What seems to be the issue?', isOwn: true, timestamp: '09:11 AM' },
    ]
  },
  {
    id: 3,
    customerName: 'Bob Johnson',
    lastMessage: 'When will my package arrive?',
    timestamp: 'Yesterday',
    unreadCount: 1,
    isOnline: true,
    messages: [
      { id: 1, text: 'When will my package arrive?', isOwn: false, timestamp: 'Yesterday' },
    ]
  },
  {
    id: 4,
    customerName: 'Emma Wilson',
    lastMessage: 'Perfect, that solved it!',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
    messages: [
      { id: 1, text: 'I\'m having trouble logging in', isOwn: false, timestamp: 'Yesterday' },
      { id: 2, text: 'Let me help you reset your password.', isOwn: true, timestamp: 'Yesterday' },
      { id: 3, text: 'Perfect, that solved it!', isOwn: false, timestamp: 'Yesterday' },
    ]
  },
];

// MessageBubble Component
const MessageBubble = ({ text, isOwn, timestamp }) => {
  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-800 rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed">{text}</p>
        </div>
        <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {timestamp}
        </p>
      </div>
    </div>
  );
};

// ConversationItem Component
const ConversationItem = ({ conversation, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{conversation.customerName}</h3>
          {conversation.isOnline && (
            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {conversation.unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {conversation.unreadCount}
            </span>
          )}
          <span className="text-xs text-gray-500">{conversation.timestamp}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
    </div>
  );
};

// ConversationList Component
const ConversationList = ({ conversations, selectedId, onSelectConversation }) => {
  return (
    <div className="w-full lg:w-80 xl:w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
        <p className="text-sm text-gray-600 mt-1">
          {conversations.filter(c => c.unreadCount > 0).length} unread
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isSelected={selectedId === conv.id}
            onClick={() => onSelectConversation(conv.id)}
          />
        ))}
      </div>
    </div>
  );
};

// MessageInput Component
const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ChatWindow Component
const ChatWindow = ({ conversation, onSendMessage }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">{conversation.customerName}</h2>
          <div className="flex items-center gap-1">
            <Circle
              className={`w-2 h-2 ${
                conversation.isOnline
                  ? 'fill-green-500 text-green-500'
                  : 'fill-gray-400 text-gray-400'
              }`}
            />
            <span className="text-sm text-gray-600">
              {conversation.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {conversation.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            text={msg.text}
            isOwn={msg.isOwn}
            timestamp={msg.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

// Main SupportDashboard Component
const SupportDashboard = () => {
  const [conversations, setConversations] = useState(DUMMY_CONVERSATIONS);
  const [selectedConversationId, setSelectedConversationId] = useState(1);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const handleSendMessage = (text) => {
    if (!selectedConversationId) return;

    const newMessage = {
      id: Date.now(),
      text,
      isOwn: true,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };

    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === selectedConversationId
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: text,
              timestamp: 'Just now',
            }
          : conv
      )
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Customer Support Dashboard</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />
        <ChatWindow
          conversation={selectedConversation}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default SupportDashboard;