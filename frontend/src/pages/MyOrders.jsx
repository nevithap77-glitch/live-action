import React from 'react'
import { Row, Col, Button, Space, Tag, Statistic } from 'antd'
import { TrophyOutlined, CheckCircleOutlined, ClockCircleOutlined, ThunderboltOutlined, ShoppingOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const ORDERS = [
  { id: 1,  emoji:'⌚', title:'Vintage Rolex Submariner', cat:'Luxury & Fashion',   bid:4550, status:'Completed', date:'Mar 14, 2026', no:'HNP-00412' },
  { id: 2,  emoji:'👕', title:"Cristiano Signed Jersey",  cat:'Collectibles',        bid:6620, status:'Completed', date:'Mar 12, 2026', no:'HNP-00398' },
  { id: 3,  emoji:'🥽', title:'Neural AR Glasses',        cat:'High-Tech Gadgets',   bid:4200, status:'Pending',   date:'Mar 16, 2026', no:'HNP-00431' },
  { id: 4,  emoji:'🏎️', title:'F1 Paddock Pass 2025',   cat:'Experiences',          bid:3100, status:'Pending',   date:'Mar 17, 2026', no:'HNP-00441' },
]

const StatusBadge = ({ s }) => {
  const ok = s === 'Completed'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: 1,
      background: ok ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
      border: `1px solid ${ok ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
      color: ok ? '#34d399' : '#fbbf24'
    }}>
      {ok ? <CheckCircleOutlined /> : <ClockCircleOutlined />} {s}
    </div>
  )
}

export default function MyOrders() {
  const total = ORDERS.reduce((s, o) => s + o.bid, 0)

  return (
    <div className="page-enter" style={{ minHeight: '100vh', padding: '40px 24px 120px', maxWidth: 1200, margin: '0 auto' }}>
      <div className="mesh-bg" />

      <div style={{ marginBottom: 52, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#7b2fff', fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>Inventory Management</div>
        <h1 className="futuristic-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#fff', marginBottom: 16 }}>
          My <span className="gradient-text">Wins</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: 16 }}>Review your collection and track delivery of acquired assets.</p>
      </div>

      {/* Stats Portfolio */}
      <div className="glass-card" style={{ padding: '40px 50px', marginBottom: 56, border: '1px solid rgba(123,47,255,0.2)' }}>
        <Row gutter={[32, 32]} justify="center">
          {[
            { v: ORDERS.length, l: 'Total Wins', icon: <TrophyOutlined />, c: '#fbbf24' },
            { v: ORDERS.filter(o => o.status === 'Completed').length, l: 'Delivered', icon: <CheckCircleOutlined />, c: '#34d399' },
            { v: ORDERS.filter(o => o.status === 'Pending').length, l: 'In Transit', icon: <ClockCircleOutlined />, c: '#22d3ee' },
            { v: `$${total.toLocaleString()}`, l: 'Portfolio Value', icon: <ThunderboltOutlined />, c: '#d8b4fe' },
          ].map(({ v, l, icon, c }, i) => (
            <Col xs={12} sm={6} key={l}>
              <div style={{ textAlign: 'center', borderRight: i < 3 && window.innerWidth > 600 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontSize: 34, color: c, marginBottom: 14 }}>{icon}</div>
                <div className="mono" style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{v}</div>
                <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 2, marginTop: 8 }}>{l}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, color: '#fff', fontSize: 18, fontWeight: 800, fontFamily: 'Syne' }}>
           <ShoppingOutlined style={{ color: '#7b2fff' }} /> Acquisition History
        </div>
        {ORDERS.map(({ id, emoji, title, cat, bid, status, date, no }) => (
          <div key={id} className="glass-card" style={{ 
            padding: '26px 36px', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', 
            border: '1px solid rgba(123,47,255,0.15)', background: 'rgba(10,0,24,0.7)' 
          }}>
            <div style={{ 
              width: 76, height: 76, borderRadius: 16, flexShrink: 0, 
              background: 'rgba(123,47,255,0.08)', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: 40, border: '1px solid rgba(123,47,255,0.2)' 
            }}>{emoji}</div>
            
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 10, color: '#d8b4fe', fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>{cat}</div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 19, color: '#fff', marginBottom: 6 }}>{title}</div>
              <div className="mono" style={{ fontSize: 11, color: '#6b7280', letterSpacing: 1 }}>{no} · SECURED ON {date.toUpperCase()}</div>
            </div>

            <div style={{ textAlign: 'right', minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
               <div className="mono" style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>${bid.toLocaleString()}</div>
               <StatusBadge s={status} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
               <Tooltip title="View Certificate">
                  <Button type="text" icon={<SafetyCertificateOutlined style={{ color: '#34d399' }} />} />
               </Tooltip>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <Link to="/products">
          <Button type="primary" size="large" icon={<ThunderboltOutlined />} 
            style={{ height: 64, padding: '0 48px', borderRadius: 18, fontSize: 17, fontWeight: 800 }}>
            EXPLORE NEW AUCTIONS
          </Button>
        </Link>
      </div>
    </div>
  )
}
