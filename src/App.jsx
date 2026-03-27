import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import AddEditProduct from './pages/AddEditProduct'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Inventory from './pages/Inventory'
import Reviews from './pages/Reviews'
import Policies from './pages/Policies'
import AbandonedPayments from './pages/AbandonedPayments'
import ContactMessages from './pages/ContactMessages'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<AddEditProduct />} />
            <Route path="/products/:id/edit" element={<AddEditProduct />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/abandoned-payments" element={<AbandonedPayments />} />
            <Route path="/contact-messages" element={<ContactMessages />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
