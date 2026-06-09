import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Listings from '../pages/Listings'
import ProductDetail from '../pages/ProductDetail'
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
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
