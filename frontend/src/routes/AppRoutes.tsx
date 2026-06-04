import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Listings from '../pages/Listings'
import ProductDetail from '../pages/ProductDetail'
import About from '../pages/About'
import NotFound from '../pages/NotFound'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
