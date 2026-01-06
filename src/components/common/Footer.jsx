import React from 'react'
import { Smile } from 'lucide-react'

const Footer = () => {
  return (
    <div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 my-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Smile className="w-10 h-10 text-orange-400" />
                <h4 className="text-2xl font-bold">Happy Shop</h4>
              </div>
              <p className="text-gray-400">
                Nơi mọi bước chân đều tràn đầy hạnh phúc! 
                <br />
                <span className="text-yellow-400">Vì cuộc sống quá ngắn để đi giày dở! 😄</span>
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-4">Liên Hệ Vui Vẻ</h4>
              <p className="text-gray-400 mb-2">📍 123 Đường Hạnh Phúc, Q.1, TP.HCM</p>
              <p className="text-gray-400 mb-2">📞 Hotline: 1900-HAPPY</p>
              <p className="text-gray-400">✉️ hello@happyshop.vn</p>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-4">Giờ Mở Cửa</h4>
              <p className="text-gray-400 mb-2">Thứ 2 - Chủ Nhật</p>
              <p className="text-yellow-400 font-semibold">9:00 - 21:00</p>
              <p className="text-gray-400 text-sm mt-2">(Mở cửa cả ngày lễ vì chúng tôi thích làm việc! 🎉)</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p className="text-lg">
              © 2025 Happy Shop - Made with 💖 and a lot of ☕
            </p>
            <p className="text-sm mt-2">
              Keep calm and buy shoes! 👟✨
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer
