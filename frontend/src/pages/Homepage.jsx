import React from 'react'
import { Row, Col, Button, Tag, Space, Statistic } from 'antd'
import {
  ThunderboltOutlined, AppstoreOutlined, 
  RocketOutlined, SafetyCertificateOutlined,
  GlobalOutlined, RiseOutlined, TeamOutlined
} from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuction } from '../context/AuctionContext'

export default function Homepage() {
  const navigate = useNavigate()
  const { liveAuctions } = useAuction()

  return (
    <div className="page-enter" style={{ minHeight: '100vh', padding: '0 0 100px' }}>
      <div className="mesh-bg" />
      
      {/* ── HERO SECTION ── */}
      <section style={{ 
        height: '85vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '0 24px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Animated Background Rays */}
        <div className="hero-rays" />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(123,47,255,0.08), transparent 70%)' }} />

        <div className="pageIn-anim" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: 13, color: '#7b2fff', fontWeight: 900, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 24 }}>
            Neural Bidding Protocol v4.2
          </div>
          <h1 className="futuristic-title" style={{ fontSize: 'clamp(3rem, 10vw, 6.5rem)', color: '#fff', lineHeight: 1, marginBottom: 20 }}>
            HNP <span className="gradient-text">NEXUS</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: 'clamp(1rem, 2vw, 1.4rem)', maxWidth: 800, margin: '0 auto 48px', lineHeight: 1.8 }}>
            Enter the global decentralized auction terminal. Experience real-time multi-bid tracking, 
            AI-driven market insights, and guaranteed asset transparency.
          </p>

          <Space size={24} wrap>
            <Button type="primary" size="large" onClick={() => navigate('/products')} className="pulse-glow"
              style={{ height: 64, padding: '0 44px', borderRadius: 16, fontSize: 18, fontWeight: 900, letterSpacing: 1.5 }}>
              EXPLORE HUB ⚡
            </Button>
            <Button size="large" onClick={() => navigate('/login')}
              style={{ height: 64, padding: '0 44px', borderRadius: 16, fontSize: 18, fontWeight: 900, background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
              INITIALIZE LOGON
            </Button>
          </Space>
        </div>
      </section>

      {/* ── LIVE HUD SECTION (ONLY IF ACTIVE) ── */}
      {liveAuctions.length > 0 && (
        <section style={{ maxWidth: 1400, margin: '0 auto 120px', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 44 }}>
             <div className="live-badge" style={{ animation: 'pulseGlow 2s infinite' }}>NOW LIVE</div>
             <h2 className="futuristic-title" style={{ fontSize: 32, marginBottom: 0, color: '#fff' }}>Sector Transmissions</h2>
          </div>
          
          <Row gutter={[32, 32]}>
            {liveAuctions.slice(0, 3).map((a, i) => (
              <Col xs={24} md={8} key={a.id}>
                <div className="glass-card pageIn-anim" onClick={() => navigate(`/bidding/${a.id}`)}
                  style={{ 
                    padding: '36px', border: '1px solid rgba(123,47,255,0.25)', cursor: 'pointer',
                    animation: `pageIn 0.5s ease both ${i * 0.15}s`, height: '100%',
                    background: 'rgba(5,0,15,0.7)'
                  }}>
                  <div style={{ fontSize: 72, marginBottom: 24, textAlign: 'center', filter: 'drop-shadow(0 0 20px rgba(123,47,255,0.3))' }}>{a.emoji}</div>
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 900, color: '#fff', fontSize: 20, marginBottom: 12 }}>{a.title}</h3>
                  <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: '16px', display: 'flex', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div>
                       <div style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase' }}>Highest Bid</div>
                       <div className="mono" style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>₹{a.currentBid.toLocaleString()}</div>
                     </div>
                     <div style={{ textAlign: 'center' }}>
                       <div style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase' }}>Bids</div>
                       <div className="mono" style={{ fontSize: 18, fontWeight: 900, color: '#7b2fff' }}>{(a.bids || []).length}</div>
                     </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </section>
      )}

      {/* ── FEATURES GRID ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[48, 48]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <GlobalOutlined style={{ fontSize: 44, color: '#7b2fff', marginBottom: 24 }} />
              <h3 className="futuristic-title" style={{ fontSize: 20, color: '#fff', marginBottom: 16 }}>Multi-Bid Hub</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.8 }}>Concurrent bidding transmissions via decentralized AI nodes. Zero lag, high intensity.</p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <HistoryOutlined style={{ fontSize: 44, color: '#34d399', marginBottom: 24 }} />
              <h3 className="futuristic-title" style={{ fontSize: 20, color: '#fff', marginBottom: 16 }}>Immutable Logs</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.8 }}>Every bid is recorded in your personal transmission history. Track wins and losses live.</p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <RiseOutlined style={{ fontSize: 44, color: '#fbbf24', marginBottom: 24 }} />
              <h3 className="futuristic-title" style={{ fontSize: 20, color: '#fff', marginBottom: 16 }}>Merchant Insights</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.8 }}>Advanced analytics for sellers. Monitor every bidder node and market movement instantly.</p>
            </div>
          </Col>
        </Row>
      </section>

      {/* ── COUNTER SECTION ── */}
      <div style={{ marginTop: 150, padding: '80px 0', background: 'rgba(123,47,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Row gutter={[32, 32]} style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <Col xs={12} md={6}>
            <Statistic title={<span style={{ color: '#666', fontSize: 10, letterSpacing: 2 }}>NODES ONLINE</span>} value={1204} className="mono-stat" valueStyle={{ color: '#fff', fontWeight: 900, fontFamily: 'Orbitron' }} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title={<span style={{ color: '#666', fontSize: 10, letterSpacing: 2 }}>TOTAL ₹ LOCKED</span>} value={48200} prefix="₹" className="mono-stat" valueStyle={{ color: '#fbbf24', fontWeight: 900, fontFamily: 'Orbitron' }} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title={<span style={{ color: '#666', fontSize: 10, letterSpacing: 2 }}>WINNERS CROWNED</span>} value={842} className="mono-stat" valueStyle={{ color: '#34d399', fontWeight: 900, fontFamily: 'Orbitron' }} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title={<span style={{ color: '#666', fontSize: 10, letterSpacing: 2 }}>NEXUS UPTIME</span>} value={99.9} suffix="%" className="mono-stat" valueStyle={{ color: '#22d3ee', fontWeight: 900, fontFamily: 'Orbitron' }} />
          </Col>
        </Row>
      </div>
    </div>
  )
}
