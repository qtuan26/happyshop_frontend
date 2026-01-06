import React, { useEffect, useState } from 'react'
import { ShoppingCart, X, Copy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ApiService from '../../service/api'

const Home = () => {
  const [topProducts, setTopProducts] = useState([])
  const [coupons, setCoupons] = useState([])
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [loading, setLoading] = useState(true) // thêm state loading
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true) // bắt đầu loading
        const products = await ApiService.getTopSellingProducts()
        const couponList = await ApiService.getActiveCoupons()

        setTopProducts(products)
        setCoupons(couponList)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false) // kết thúc loading
      }
    }

    fetchData()
  }, [])

  const handleCouponClick = async (couponId) => {
    try {
      const coupon = await ApiService.getCouponDetail(couponId)
      setSelectedCoupon(coupon)
    } catch (error) {
      console.error(error)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(selectedCoupon.coupon_code)
    alert('Đã copy mã giảm giá 🎉')
  }

  // Nếu đang loading, hiển thị loading message
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Đang tải dữ liệu...
      </div>
    )
  }

  return (
    <div className="space-y-10">

      {/* ===== COUPON SECTION ===== */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Ưu Đãi Hấp Dẫn</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map(coupon => (
            <div
              key={coupon.coupon_id}
              onClick={() => handleCouponClick(coupon.coupon_id)}
              className="cursor-pointer bg-white rounded-lg shadow hover:shadow-xl transition"
            >
              <img
                src={coupon.url_image}
                alt={coupon.title}
                className="w-full h-64 object-contain bg-gray-100 rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">{coupon.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {coupon.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== PRODUCT SECTION ===== */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Sản Phẩm Nổi Bật</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {topProducts.map(item => (
            <div
              key={item.product_id}
              onClick={() => navigate(`/${item.category_id}/${item.product_id}`)}
              className="bg-white rounded-lg shadow hover:shadow-xl cursor-pointer"
            >
              <img
                src={item.url_image}
                alt={item.product_name}
                className="w-full h-48 object-contain"
              />

              <div className="p-4">
                <h3 className="text-sm font-semibold">
                  {item.product_name}
                </h3>

                <div className="flex justify-between items-center mt-2">
                  <div>
                    <p className="text-red-500 font-bold">
                      ${Number(item.base_price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Đã bán: {item.total_sold}
                    </p>
                  </div>

                  <button className="bg-blue-600 text-white p-2 rounded-full">
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== COUPON MODAL ===== */}
      {selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setSelectedCoupon(null)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>

            <img
              src={selectedCoupon.url_image}
              alt=""
              className="w-full h-40 object-cover rounded mb-4"
            />

            <h3 className="text-xl font-bold mb-2">
              {selectedCoupon.title}
            </h3>

            <p className="text-gray-600 mb-4">
              {selectedCoupon.description}
            </p>

            <div className="bg-gray-100 p-3 rounded flex justify-between items-center">
              <span className="font-bold text-lg">
                {selectedCoupon.coupon_code}
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-blue-600 font-semibold"
              >
                <Copy size={16} /> Copy
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Đơn tối thiểu: ${selectedCoupon.condition.min_order_value}
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

export default Home
