import React from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductList = ({ products,categoryId  }) => {
  const navigate = useNavigate();
  

  const handleClick = (id) => {
    navigate(`/${categoryId}/${id}`);
  };

  return (
    <div className="mt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleClick(product.id)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="relative h-48 bg-gray-50 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-500 font-bold">${product.price}</p>
                  
                </div>
                <button
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
