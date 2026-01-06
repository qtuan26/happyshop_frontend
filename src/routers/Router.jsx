import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";

const Login = lazy(() => import("../components/auth/Login.jsx"));
const Register = lazy(() => import("../components/auth/Register.jsx"));
const MainLayout = lazy(() => import("../components/layouts/Main.jsx"));
const ProductPage = lazy(() => import("../components/products/ProductPage.jsx"));
const ProductDetail = lazy(() => import("../components/products/ProductDetail.jsx"));
const ShoppingCart = lazy(() => import("../components/pages/ShoppingCart.jsx"));
const Home = lazy(() => import("../components/pages/Home.jsx"));
const Introduction = lazy(() => import("../components/pages/Introduction.jsx"));
const Account = lazy(() => import("../components/pages/Account.jsx"));
const Order = lazy(() => import("../components/pages/Order.jsx"));
const MoMoPayment = lazy(() => import("../components/pages/MoMOoPayment.jsx"));

// Admin Components
const AdminLayout = lazy(() => import("../components/admin/AdminLayout.jsx"));
const AdminProducts = lazy(() => import("../components/admin/AdminProducts.jsx"));
const AdminOrders = lazy(() => import("../components/admin/AdminOrders.jsx"));
const AdminCustomers = lazy(() => import("../components/admin/AdminCustomers.jsx"));
const AdminCoupons = lazy(() => import("../components/admin/AdminCoupons.jsx"));
const AdminChat = lazy(() => import("../components/chat/AdminChat.jsx"));


const routers = [
  // Auth routes
  { path: "login", component: Login },
  { path: "register", component: Register },
  
  // Standalone routes
  { path: "cart", component: ShoppingCart },
  { path: "account", component: Account },
  { path: "orders", component: Order },
  { path: "momo-payment", component: MoMoPayment },
  
  
  // Admin routes - Protected
  // {
  //   path: "admin",
  //   component: AdminLayout,
  //   role: "admin",
  //   children: [
  //     { index: true, component: AdminProducts },
  //     // { path: "products", component: AdminProducts },
  //     { path: "orders", component: AdminOrders },
  //     { path: "customers", component: AdminCustomers },
  //     { path: "coupons", component: AdminCoupons },
  //     { path: "chat", component: AdminChat },
  //   ],
  // },
  {
  path: "admin",
    component: (props) => (
      <ProtectedRoute role="admin">
        <AdminLayout {...props} />
      </ProtectedRoute>
    ),
    children: [
      { index: true, component: AdminProducts },
      { path: "orders", component: AdminOrders },
      { path: "customers", component: AdminCustomers },
      { path: "coupons", component: AdminCoupons },
      { path: "chat", component: AdminChat },
    ],
  },

  
  // Main layout routes
  {
    path: "",
    component: MainLayout,
    children: [
      { index: true, component: Home },
      { path: "introduction", component: Introduction },

      // Product routes
      {
        path: ":categoryId",
        component: ProductPage,
      },
      {
        path: ":categoryId/:productId",
        component: ProductDetail,
      },
    ],
  },
];

export { routers };

// Note: CustomerChat giờ được tích hợp vào MainLayout
// Không cần route /support nữa