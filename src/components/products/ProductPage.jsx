import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductList from "./ProductList";
import Filter from "../filters/Filter";
import ApiService from "../../service/api";

const ProductPage = () => {
  const { categoryId } = useParams();

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // FETCH PRODUCT
  // ===============================
  const fetchProducts = async (activeFilters = null) => {
    try {
      setLoading(true);

      const data = activeFilters
        ? await ApiService.filterProducts(categoryId, activeFilters)
        : await ApiService.getProductsByCategory(categoryId);

      const mappedProducts = data.map(p => ({
        id: p.product_id,
        name: p.product_name,
        image: p.url_image,
        price: Number(p.base_price).toLocaleString("vi-VN"),
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Lỗi load sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // RESET KHI ĐỔI CATEGORY
  // ===============================
  useEffect(() => {
    setFilters(null);    // reset filter state
    fetchProducts();     // load danh sách gốc
  }, [categoryId]);

  // ===============================
  // LOAD KHI FILTER THAY ĐỔI
  // ===============================
  useEffect(() => {
    if (!filters) return;

    const isEmptyFilter =
      filters.gender.length === 0 &&
      filters.sizes.length === 0 &&
      filters.minPrice === 0;

    if (isEmptyFilter) {
      fetchProducts();
    } else {
      fetchProducts(filters);
    }
  }, [filters]);

  return (
    <div className="container mx-auto px-4 flex gap-6">

      {/* FILTER */}
      <div className="w-64 shrink-0">
        <Filter
          key={categoryId}   // ⭐ QUAN TRỌNG: reset UI filter
          category={categoryId}
          onChange={setFilters}
        />
      </div>

      {/* PRODUCT LIST */}
      <div className="flex-1">
        {loading ? (
          <p className="text-gray-500 text-center">
            Đang tải sản phẩm...
          </p>
        ) : (
          <ProductList
            products={products}
            categoryId={categoryId}
          />
        )}
      </div>

    </div>
  );
};

export default ProductPage;
