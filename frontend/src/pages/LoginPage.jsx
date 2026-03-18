import React, { useState } from 'react'
import { Form, Input, Button, message, Divider } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, RocketOutlined, ShoppingOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [role, setRole] = useState('buyer')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = role === 'seller'
    ? '/seller'
    : (location.state?.from?.pathname || '/products')

  const onFinish = ({ username }) => {
    setLoading(true)
    setTimeout(() => {
      login(username, role)
      message.success({ content: `Welcome, ${username}! Logged in as ${role === 'buyer' ? '⚡ Buyer' : '🏪 Seller'}`, duration: 3, style: { marginTop: '10vh' } })
      navigate(from, { replace: true })
      setLoading(false)
    }, 1100)
  }

  const isBuyer = role === 'buyer'

  return (
    <div className="page-enter" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden'
    }}>
      <div className="mesh-bg" />
      {/* Ray lights */}
      <div style={{ position: 'absolute', top: '12%', right: '10%', width: 450, height: 450, background: isBuyer ? 'rgba(123,47,255,0.16)' : 'rgba(212,175,55,0.1)', filter: 'blur(130px)', borderRadius: '50%', transition: 'background 0.5s', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '8%', width: 320, height: 320, background: 'rgba(34,211,238,0.07)', filter: 'blur(110px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 5, width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, letterSpacing: 2, color: '#fff', textShadow: '0 0 30px rgba(123,47,255,0.7)', marginBottom: 8 }}>
            ⚡ HNP <span style={{ color: '#d8b4fe' }}>LIVE</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: 12, letterSpacing: 2.5, textTransform: 'uppercase' }}>
            THE ULTIMATE AUCTION PLATFORM
          </div>
        </div>

        <div className="glass-card" style={{
          padding: '44px 48px',
          border: isBuyer ? '1px solid rgba(123,47,255,0.35)' : '1px solid rgba(212,175,55,0.35)',
          boxShadow: isBuyer ? '0 0 60px rgba(123,47,255,0.18)' : '0 0 60px rgba(212,175,55,0.12)',
          transition: 'all 0.4s ease'
        }}>

          {/* Role Toggle */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 36, background: 'rgba(0,0,0,0.35)', padding: 8, borderRadius: 16 }}>
            {[
              { v: 'buyer',  label: '⚡ Buyer',  sub: 'Bid & Win' },
              { v: 'seller', label: '🏪 Seller', sub: 'List & Sell' },
            ].map(({ v, label, sub }) => (
              <button key={v} onClick={() => setRole(v)} style={{
                flex: 1, padding: '14px 10px', borderRadius: 12, border: 'none',
                cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', transition: 'all 0.3s',
                background: role === v
                  ? (v === 'buyer' ? 'linear-gradient(135deg,#7b2fff,#6366f1)' : 'linear-gradient(135deg,#b8860b,#d4af37)')
                  : 'transparent',
                color: role === v ? '#fff' : '#6b7280',
                boxShadow: role === v ? (v === 'buyer' ? '0 4px 18px rgba(123,47,255,0.5)' : '0 4px 18px rgba(212,175,55,0.4)') : 'none',
              }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{label}</div>
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{sub}</div>
              </button>
            ))}
          </div>

          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              name="username"
              label={<span style={{ color: '#acacb8', fontSize: 13 }}>Email / Username</span>}
              rules={[{ required: true, message: 'Enter your handle' }]}
            >
              <Input prefix={<UserOutlined style={{ color: isBuyer ? '#a855f7' : '#d4af37' }} />}
                placeholder="your@email.com" size="large" style={{ height: 54 }} />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ color: '#acacb8', fontSize: 13 }}>Password</span>}
              rules={[{ required: true, message: 'Password required' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: isBuyer ? '#a855f7' : '#d4af37' }} />}
                placeholder="Your password" size="large" style={{ height: 54 }}
                iconRender={v => v ? <EyeTwoTone twoToneColor={isBuyer ? '#7b2fff' : '#d4af37'} /> : <EyeInvisibleOutlined style={{ color: '#555' }} />}
              />
            </Form.Item>

            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <Button type="link" size="small" style={{ color: '#555', fontSize: 12 }}>Forgot password?</Button>
            </div>

            <Button type="primary" htmlType="submit" block loading={loading}
              style={{
                height: 60, fontSize: 17, borderRadius: 14, fontWeight: 800,
                background: isBuyer ? 'linear-gradient(135deg,#7b2fff,#6366f1)' : 'linear-gradient(135deg,#b8860b,#d4af37)',
                border: 'none',
                boxShadow: isBuyer ? '0 5px 20px rgba(123,47,255,0.5)' : '0 5px 20px rgba(212,175,55,0.4)',
              }}
              icon={isBuyer ? <RocketOutlined /> : <ShoppingOutlined />}>
              {loading ? 'Authenticating...' : `Enter as ${isBuyer ? '⚡ Buyer' : '🏪 Seller'}`}
            </Button>
          </Form>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#555', fontSize: 11, margin: '28px 0' }}>No account yet?</Divider>
          <Button block ghost
            style={{ height: 50, borderRadius: 12, borderColor: isBuyer ? 'rgba(123,47,255,0.3)' : 'rgba(212,175,55,0.3)', color: isBuyer ? '#d8b4fe' : '#d4af37', fontWeight: 700 }}>
            Register Free
          </Button>
        </div>

        {/* Role description info */}
        <div style={{ marginTop: 20, padding: '14px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: `1px solid ${isBuyer ? 'rgba(123,47,255,0.1)' : 'rgba(212,175,55,0.1)'}`, fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
          {isBuyer
            ? '⚡ Buyer: Access Marketplace, Bidding, Wishlist, Orders & Group Bidding'
            : '🏪 Seller: Access Dashboard, List Products, Manage Auctions & View Bids'}
        </div>
      </div>
    </div>
  )
}
