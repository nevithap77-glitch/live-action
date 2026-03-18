import React from 'react'
import { Row, Col, Button, message, Tooltip } from 'antd'
import { HeartFilled, DeleteOutlined, ThunderboltOutlined, ShoppingOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

function Timer({ seed }) {
  const [left, setLeft] = React.useState(() => 95 + ((seed * 57) % 185))
  React.useEffect(() => {
    const s = left
    const i = setInterval(() => setLeft(p => p > 0 ? p - 1 : s), 1000)
    return () => clearInterval(i)
  }, [])
  const m = String(Math.floor(left / 60)).padStart(2, '0')
  const s = String(left % 60).padStart(2, '0')
  return <span className={`mono ${left < 30 ? 'timer-urgent' : 'countdown-anim'}`}>{m}:{s}</span>
}

export default function WishlistPage() {
  const { wishlist, remove } = useWishlist()

  const handleRemove = (id) => {
    remove(id)
    message.success('Removed from wishlist')
  }

  if (wishlist.length === 0) return (
    <div className="page-enter" style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="mesh-bg" />
      <div style={{ fontSize: 90, marginBottom: 28, opacity: 0.35 }}>💜</div>
      <h2 className="futuristic-title" style={{ color: '#fff', fontSize: 32, marginBottom: 16 }}>Wishlist is empty</h2>
      <p style={{ color: '#6b7280', marginBottom: 40, fontSize: 16 }}>Click the ❤️ on any product card to save it here.</p>
      <Link to="/products">
        <Button type="primary" size="large" icon={<ShoppingOutlined />} style={{ height: 56, padding: '0 44px', borderRadius: 14, fontSize: 16 }}>
          Browse Marketplace
        </Button>
      </Link>
    </div>
  )

  return (
    <div className="page-enter" style={{ minHeight: '100vh', padding: '40px 24px 100px', maxWidth: 1200, margin: '0 auto' }}>
      <div className="mesh-bg" />

      <div style={{ marginBottom: 52, textAlign: 'center' }}>
        <h1 className="futuristic-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff', marginBottom: 14 }}>
          <HeartFilled style={{ color: '#f87171', marginRight: 10 }} />My <span className="gradient-text">Wishlist</span>
        </h1>
        <p style={{ color: '#6b7280' }}>{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved — bid before they end!</p>
      </div>

      <Row gutter={[26, 26]}>
        {wishlist.map((item, idx) => (
          <Col xs={24} sm={12} lg={8} key={item.id}>
            <div className="glass-card product-card-hover" style={{ border: '1px solid rgba(123,47,255,0.2)', position: 'relative' }}>
              <Tooltip title="Remove from wishlist">
                <button onClick={() => handleRemove(item.id)} style={{
                  position: 'absolute', top: 12, right: 12, zIndex: 10,
                  background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)',
                  borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <DeleteOutlined style={{ color: '#f87171', fontSize: 14 }} />
                </button>
              </Tooltip>
              <HeartFilled style={{ color: '#f87171', position: 'absolute', top: 14, left: 14, fontSize: 16, zIndex: 5 }} />

              <div style={{ height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,0,26,0.5)', fontSize: 80, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(123,47,255,0.1), transparent 70%)' }} />
                {item.emoji}
              </div>

              <div style={{ padding: 22 }}>
                <div style={{ fontSize: 10, color: '#d8b4fe', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{item.cat}</div>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 17, color: '#fff', marginBottom: 18 }}>{item.title}</h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: 12, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase' }}>Current Bid</div>
                    <div className="mono" style={{ color: '#d8b4fe', fontWeight: 900, fontSize: 18 }}>${item.bid.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase' }}>Ends</div>
                    <Timer seed={item.id + idx} />
                  </div>
                </div>

                <Link to={`/bidding/${item.id}`}>
                  <Button type="primary" block style={{ height: 46, borderRadius: 12, fontWeight: 700 }}>
                    <ThunderboltOutlined /> Bid Now
                  </Button>
                </Link>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}
