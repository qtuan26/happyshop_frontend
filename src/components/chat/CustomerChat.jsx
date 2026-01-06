import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

const CustomerChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", isOwn: false, timestamp: "Just now" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: input,
        isOwn: true,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    ]);

    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white font-semibold text-lg shadow">
        Support Chat
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-3 ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs ${
                msg.isOwn ? "bg-blue-600 text-white" : "bg-white text-gray-800 border"
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-xs text-gray-300 mt-1">{msg.timestamp}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          onClick={sendMessage}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CustomerChat;
