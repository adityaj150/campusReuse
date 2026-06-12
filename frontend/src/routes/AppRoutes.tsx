import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Listings from '../pages/Listings'
import ProductDetail from '../pages/ProductDetail'
import Dashboard from '../pages/Dashboard'
import CreateProduct from '../pages/CreateProduct'
import About from '../pages/About'
import NotFound from '../pages/NotFound'
import RequireAuth from '../components/RequireAuth'
import Login from '../pages/Login'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/listings" element={<RequireAuth><Listings /></RequireAuth>} />
      <Route path="/product/:id" element={<RequireAuth><ProductDetail /></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/create-product" element={<RequireAuth><CreateProduct /></RequireAuth>} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

