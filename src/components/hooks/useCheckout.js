// src/hooks/useCheckout.js
import { useState } from 'react';

export const useCheckout = (items) => {
  const [coupon, setCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const subtotal = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  let shippingFee = 20;
  let discount = 0;

  if (coupon) {
    discount = coupon.discount || 0;
    if (coupon.discount_type === 'freeship') shippingFee = 0;
  }

  const total = subtotal + shippingFee - discount;

  return {
    subtotal,
    shippingFee,
    discount,
    total,
    coupon,
    setCoupon,
    paymentMethod,
    setPaymentMethod
  };
};
