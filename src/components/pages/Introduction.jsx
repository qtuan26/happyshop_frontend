import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Star, Smile, TrendingUp, Award, Users, Heart, Zap, RefreshCw, Shield, Crown, Sparkles, PartyPopper, Laugh, Package 
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const HappyShop = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);

  const testimonials = [
    {
      name: "Nguyễn Vui Vẻ",
      text: "Mua giày ở Happy Shop xong tôi hạnh phúc đến nỗi không biết đi về! (Cuối cùng phải gọi Grab 😂)",
      rating: 5
    },
    {
      name: "Trần Cười Nhiều",
      text: "Giày đẹp, giá tốt, còn được tặng kèm nụ cười! Không mua là phí cả đời!",
      rating: 5
    },
    {
      name: "Lê Hài Hước",
      text: "Từ khi mua giày ở đây, chân tôi vui đến mức muốn đi bộ khắp thế giới! 🌍",
      rating: 5
    }
  ];

  const funFacts = [
    { icon: Smile, number: "999,999+", text: "Nụ cười được tạo ra" },
    { icon: Users, number: "50,000+", text: "Bàn chân hạnh phúc" },
    { icon: Award, number: "#1", text: "Shop giày vui nhộn nhất" },
    { icon: Heart, number: "∞", text: "Tình yêu dành cho khách" }
  ];

  const whyChooseUs = [
    {
      icon: Laugh,
      title: "Vui Như Joker",
      description: "Nhân viên của chúng tôi cười nhiều hơn cả MC gameshow. Mua hàng còn được xem biểu diễn miễn phí!"
    },
    {
      icon: Shield,
      title: "Giày 100% Chính Hãng",
      description: "Chính hãng đến mức nếu fake, chúng tôi sẽ ăn luôn chiếc giày đó! (Nhưng đừng lo, chúng tôi chưa phải ăn lần nào 😎)"
    },
    {
      icon: Zap,
      title: "Giao Hàng Nhanh Như Chớp",
      description: "Nhanh đến nỗi bạn chưa kịp hối hận đã thấy shipper gõ cửa rồi! ⚡"
    },
    {
      icon: RefreshCw,
      title: "Đổi Trả Dễ Như Trở Bàn Tay",
      description: "Không vừa? Không sao! Đổi trả trong 30 ngày không cần lý do. Thậm chí lý do 'tôi đổi ý' cũng được!"
    },
    {
      icon: Crown,
      title: "Giá Cả Phải Chăng",
      description: "Rẻ đến mức bạn sẽ nghĩ chúng tôi bị điên! (Spoiler: Chúng tôi không điên, chỉ là yêu khách hàng thôi 💕)"
    },
    {
      icon: Sparkles,
      title: "Trải Nghiệm Thần Thánh",
      description: "Mua giày ở đây giống như đi du lịch - vui, thú vị, và luôn muốn quay lại!"
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-sky-50">

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-200/30 to-cyan-200/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto" data-aos="fade-down">
            <div className="mb-6 flex justify-center" data-aos="zoom-in">
              <PartyPopper className="w-16 h-16 text-blue-500 animate-bounce" />
            </div>
            <h2 className="text-6xl font-bold mb-6 bg-linear-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
              Chào Mừng Đến Với Happy Shop! 🎉
            </h2>
            <p className="text-2xl text-gray-700 mb-4 font-semibold" data-aos="fade-up">
              Nơi Bàn Chân Tìm Thấy Hạnh Phúc Thật Sự!
            </p>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed" data-aos="fade-up" data-aos-delay="200">
              Chúng tôi không chỉ bán giày - chúng tôi bán niềm vui, sự tự tin, và những bước chân vững chắc! 
              <br />
              <span className="text-blue-600 font-semibold">
                (Còn bán cả nụ cười nữa, nhưng cái này miễn phí! 😄)
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-4" data-aos="zoom-in" data-aos-delay="300">
              <button className="bg-linear-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg">
                Mua Ngay - Vui Luôn! 🛒
              </button>
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg border-2 border-blue-500 hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg">
                Tìm Hiểu Thêm 👀
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Fun Facts */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12 text-gray-800" data-aos="fade-up">
            Con Số Biết Nói 📊
            <span className="block text-lg text-gray-600 mt-2">(Và chúng đang nói rằng chúng tôi tuyệt vời lắm! 😎)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {funFacts.map((fact, index) => (
              <div 
                key={index}
                data-aos="zoom-in"
                data-aos-delay={index * 150}
                className="bg-linear-to-br from-blue-100 to-cyan-100 p-8 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <fact.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <div className="text-4xl font-bold text-blue-600 mb-2">{fact.number}</div>
                <div className="text-gray-700 font-semibold">{fact.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-linear-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
            <h3 className="text-5xl font-bold text-center mb-8 text-gray-800">
              Câu Chuyện Của Chúng Tôi 📖
            </h3>
            <div className="bg-white p-10 rounded-3xl shadow-2xl" data-aos="fade-right">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                <span className="text-3xl">🎭</span> Ngày xửa ngày xưa, có một nhóm bạn trẻ yêu giày đến phát điên. 
                Họ mua giày nhiều đến mức tủ giày chiếm 70% diện tích nhà. Một ngày nọ, họ nghĩ: 
                <span className="font-bold text-blue-600"> "Tại sao không mở một cửa hàng giày vui nhộn nhất thế giới?"</span>
              </p>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                <span className="text-3xl">💡</span> Và thế là <span className="font-bold text-cyan-600">Happy Shop</span> ra đời! 
                Sứ mệnh? Đơn giản thôi: Làm cho việc mua giày trở nên vui như đi công viên giải trí!
              </p>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                <span className="text-3xl">🚀</span> Từ một cửa hàng nhỏ với 3 đôi giày và vô số tiếng cười, 
                chúng tôi đã phát triển thành chuỗi cửa hàng với hàng nghìn đôi giày và... vẫn giữ được vô số tiếng cười!
              </p>
              <p className="text-xl text-gray-700 leading-relaxed font-bold text-center">
                <span className="text-3xl">🎪</span> Hôm nay, chúng tôi tự hào là nơi mà bạn đến để mua giày, 
                nhưng ở lại vì... quá vui! (Và giày đẹp nữa! 😄)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-5xl font-bold text-center mb-4 text-gray-800" data-aos="fade-up">
            Tại Sao Chọn Happy Shop? 🤔
          </h3>
          <p className="text-center text-xl text-gray-600 mb-12" data-aos="fade-up" data-aos-delay="150">
            (Câu hỏi hay! Để chúng tôi kể cho bạn nghe... 😉)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((reason, index) => (
              <div 
                key={index}
                data-aos="flip-left"
                data-aos-delay={index * 150}
                className="bg-linear-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-300"
              >
                <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <reason.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-4 text-center">{reason.title}</h4>
                <p className="text-gray-600 text-center leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-linear-to-br from-blue-50 to-sky-50" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h3 className="text-5xl font-bold text-center mb-4 text-gray-800">
            Khách Hàng Nói Gì? 💬
          </h3>
          <p className="text-center text-xl text-gray-600 mb-12">
            (Spoiler: Họ nói rất nhiều điều tốt đẹp! 🥰)
          </p>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-3xl shadow-2xl">
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-2xl text-gray-700 text-center mb-6 italic leading-relaxed">
                "{testimonials[activeTestimonial].text}"
              </p>
              <p className="text-xl text-blue-600 font-bold text-center">
                - {testimonials[activeTestimonial].name}
              </p>
            </div>
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all ${
                    activeTestimonial === index 
                      ? 'bg-blue-500 w-12' 
                      : 'bg-gray-300 hover:bg-blue-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-5xl font-bold text-center mb-4 text-gray-800" data-aos="fade-up">
            Giày Bán Chạy Nhất 🔥
          </h3>
          <p className="text-center text-xl text-gray-600 mb-12" data-aos="fade-up" data-aos-delay="150">
            (Chạy nhanh đến mức chúng tôi phải bổ sung hàng ngày! 🏃‍♂️)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                data-aos="zoom-in"
                data-aos-delay={item * 200}
                className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className="h-64 bg-linear-to-br from-blue-200 to-cyan-200 flex items-center justify-center">
                  <Package className="w-32 h-32 text-white opacity-50" />
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-bold mb-2">Giày Siêu Vui #{item}</h4>
                  <p className="text-gray-600 mb-4">Đi vào là vui, nhìn vào là mê, mua về là hạnh phúc!</p>
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold text-blue-600">999,000đ</span>
                    <button className="bg-linear-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105">
                      Mua Ngay!
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-linear-to-r from-blue-400 via-cyan-400 to-sky-400" data-aos="fade-up">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-5xl font-bold text-white mb-6">
            Sẵn Sàng Cho Một Trải Nghiệm Tuyệt Vời? 🎊
          </h3>
          <p className="text-2xl text-white mb-8 max-w-3xl mx-auto">
            Hãy đến Happy Shop - nơi mà việc mua giày không chỉ là mua sắm, 
            mà là một cuộc phiêu lưu đầy niềm vui!
          </p>
          <p className="text-xl text-blue-100 mb-8 font-semibold">
            ⚡ KHUYẾN MÃI ĐẶC BIỆT: Tặng kèm nụ cười cho mỗi đơn hàng! (Giá trị: Vô giá! 💎)
          </p>
          <button className="bg-white text-blue-600 px-12 py-5 rounded-full font-bold text-2xl hover:bg-blue-50 transition-all transform hover:scale-110 shadow-2xl">
            Ghé Thăm Ngay! 👟✨
          </button>
        </div>
      </section>

    </div>
  );
};

export default HappyShop;
