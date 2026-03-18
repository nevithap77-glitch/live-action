import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { AuthProvider, useAuth } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuctionProvider } from './context/AuctionContext'
import Navbar from './components/Navbar'
import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import ProductListing from './pages/ProductListing'
import BiddingPage from './pages/BiddingPage'
import WishlistPage from './pages/WishlistPage'
import BidHistory from './pages/BidHistory'
import MyOrders from './pages/MyOrders'
import GroupBidding from './pages/GroupBidding'
import SellerDashboard from './pages/SellerDashboard'

const hnpTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#7b2fff',
    colorBgBase: '#030008',
    colorTextBase: '#ffffff',
    borderRadius: 14,
    fontFamily: "'Open Sans', sans-serif",
    fontWeightStrong: 700,
    colorBorder: 'rgba(123,47,255,0.25)',
    colorBgContainer: 'rgba(13,0,30,0.85)',
    colorBgElevated: '#0a001a',
    colorLink: '#a855f7',
    colorLinkHover: '#d8b4fe',
    fontSize: 15,
  },
  components: {
    Button: { colorPrimary: '#7b2fff', algorithm: true, fontWeight: 700 },
    Input: { borderRadius: 12 },
    Select: { borderRadius: 12 },
  },
}

function LockedPage({ msg }) {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🔒</div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#fff', fontSize: 28, marginBottom: 16 }}>{msg}</h2>
      <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 32 }}>Login with the correct role to access this area.</p>
      <a href="/login">
        <button style={{ background: 'linear-gradient(135deg,#7b2fff,#6366f1)', border: 'none', color: '#fff', padding: '14px 40px', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
          Go to Login ⚡
        </button>
      </a>
    </div>
  )
}

function BuyerRoute({ children }) {
  const { isAuthenticated, isBuyer } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isBuyer) return <LockedPage msg="🔒 This section is for Buyers only." />
  return children
}

function SellerRoute({ children }) {
  const { isAuthenticated, isSeller } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isSeller) return <LockedPage msg="🔒 This section is for Sellers only." />
  return children
}

function AppRoutes() {
  const { isAuthenticated, isSeller } = useAuth()
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"              element={<Homepage />} />
        <Route path="/login"         element={isAuthenticated ? <Navigate to={isSeller ? '/seller' : '/products'} replace /> : <LoginPage />} />
        <Route path="/products"      element={<BuyerRoute><ProductListing /></BuyerRoute>} />
        <Route path="/bidding/:id?"  element={<BuyerRoute><BiddingPage /></BuyerRoute>} />
        <Route path="/wishlist"      element={<BuyerRoute><WishlistPage /></BuyerRoute>} />
        <Route path="/orders"        element={<BuyerRoute><MyOrders /></BuyerRoute>} />
        <Route path="/history"       element={<BuyerRoute><BidHistory /></BuyerRoute>} />
        <Route path="/group-bidding" element={<BuyerRoute><GroupBidding /></BuyerRoute>} />
        <Route path="/seller"        element={<SellerRoute><SellerDashboard /></SellerRoute>} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuctionProvider>
        <WishlistProvider>
          <ConfigProvider theme={hnpTheme}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ConfigProvider>
        </WishlistProvider>
      </AuctionProvider>
    </AuthProvider>
  )
}
