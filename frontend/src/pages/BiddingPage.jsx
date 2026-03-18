import React, { useState, useEffect, useRef } from 'react'
import { Row, Col, Button, Input, Form, Tag, message, Avatar, Space, Badge } from 'antd'
import {
  ThunderboltOutlined, ClockCircleOutlined, TrophyOutlined,
  RobotOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, LockOutlined,
  HistoryOutlined, RiseOutlined, SendOutlined
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAuction } from '../context/AuctionContext'

const COLORS = ['#7b2fff','#22d3ee','#fbbf24','#f87171','#34d399','#a855f7','#fb923c','#60a5fa']

function Confetti() {
  const pieces = Array.from({ length: 85 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}vw`,
    top: `${Math.random() * -100}px`,
    color: COLORS[i % COLORS.length],
    duration: `${2.5 + Math.random() * 3.5}s`,
    delay: `${Math.random() * 1.5}s`,
    width: `${7 + Math.random() * 10}px`,
    height: `${12 + Math.random() * 14}px`,
    rotation: `${Math.random() * 360}deg`,
  }))

  return (
    <>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: p.left, top: p.top, background: p.color,
          width: p.width, height: p.height, transform: `rotate(${p.rotation})`,
          animationDuration: p.duration, animationDelay: p.delay,
        }} />
      ))}
    </>
  )
}

export default function BiddingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { liveAuctions, placeBidOnLive, endAuction } = useAuction()

  const liveAuction = liveAuctions.find(a => a.id === id)
  const [timeLeft, setTimeLeft] = useState(liveAuction?.timeLeft || 300)
  const [auctionEnded, setAuctionEnded] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const cardRef = useRef()

  if (!liveAuction) return (
    <div style={{ color: '#fff', textAlign: 'center', marginTop: 100, padding: 40 }}>
      <Empty description={<span style={{ color: '#6b7280' }}>Nexus Connection Lost: Auction Not Found</span>} />
      <Button ghost onClick={() => navigate('/products')} style={{ marginTop: 24, borderRadius: 12 }}>Back to Marketplace</Button>
    </div>
  )

  useEffect(() => {
    if (auctionEnded) return
    const i = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) {
          setAuctionEnded(true)
          setShowConfetti(true)
          endAuction(id, user?.name)
          return 0
        }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(i)
  }, [id, auctionEnded, endAuction, user?.name])

  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const s = String(timeLeft % 60).padStart(2, '0')
  const isUrgent = timeLeft < 60

  const onMouseMove = (e) => {
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width - 0.5) * 20
    const y = -((e.clientY - top) / height - 0.5) * 20
    cardRef.current.style.transform = `perspective(1200px) rotateX(${y}deg) rotateY(${x}deg)`
  }
  const onMouseLeave = () => { cardRef.current.style.transform = 'perspective(1200px) rotateX(0) rotateY(0)' }

  const placeBid = ({ bidAmount }) => {
    const amount = parseFloat(bidAmount)
    if (!amount || amount <= liveAuction.currentBid) {
      return message.error(`Bid must exceed ₹${liveAuction.currentBid.toLocaleString()}`)
    }
    setLoading(true)
    setTimeout(() => {
      placeBidOnLive(id, amount, user?.name || 'You')
      form.resetFields()
      message.success({ 
        content: `🔥 Bid of ₹${amount.toLocaleString()} Transmitted to Nexus!`, 
        style: { marginTop: '10vh' },
        icon: <RiseOutlined style={{ color: '#34d399' }} />
      })
      setLoading(false)
    }, 1000)
  }

  const bids = liveAuction.bids || []
  const highestBid = bids[0]

  return (
    <div className="page-enter" style={{ padding: '36px 24px 100px', maxWidth: 1300, margin: '0 auto', minHeight: '100vh' }}>
      <div className="mesh-bg" />
      {showConfetti && <Confetti />}

      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')} 
        style={{ color: '#d8b4fe', marginBottom: 28, fontWeight: 800, letterSpacing: 1.5 }}>
        RETURN TO MARKETPLACE
      </Button>

      {auctionEnded && highestBid && (
        <div className="winner-card" style={{
          marginBottom: 44, padding: '56px', borderRadius: 28, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(10,0,26,0.98), rgba(25,12,50,0.95))',
          border: '2px solid rgba(251,191,36,0.8)',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 0 80px rgba(251,191,36,0.15)'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.15), transparent 75%)' }} />
          <div className="trophy-anim" style={{ fontSize: 100, marginBottom: 20, display: 'inline-block' }}>🏆</div>
          <div style={{ fontFamily: 'Syne', fontWeight: 900, fontSize: 42, color: '#fbbf24', marginBottom: 14, letterSpacing: 2 }}>AUCTION TERMINATED</div>
          <div style={{ fontSize: 26, color: '#fff', fontWeight: 700 }}>CHAMPION NODE: <span className="mono" style={{ color: '#34d399', textShadow: '0 0 20px rgba(52,211,153,0.5)' }}>{highestBid.buyer}</span></div>
          <div className="mono" style={{ fontSize: 56, fontWeight: 900, color: '#fbbf24', marginTop: 18 }}>₹{liveAuction.currentBid.toLocaleString()}</div>
        </div>
      )}

      <Row gutter={[44, 44]}>
        {/* Visual Terminal */}
        <Col xs={24} lg={15}>
          <div className="glass-card" style={{ padding: 0, border: '1px solid rgba(123,47,255,0.25)', overflow: 'hidden', background: 'rgba(5,0,15,0.8)' }}>
            <div ref={cardRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
              style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,0,26,0.7)', fontSize: 180, transition: 'transform 0.1s ease', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(123,47,255,0.18), transparent 70%)' }} />
              <span style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 0 60px rgba(123,47,255,0.6))' }}>{liveAuction.emoji}</span>
              <div className="live-badge" style={{ position:'absolute', top:24, left:24 }}>VISUAL FEED [ACTIVE]</div>
            </div>
            
            <div style={{ padding: '36px 44px' }}>
              <div style={{ fontSize: 11, color: '#7b2fff', fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>{liveAuction.cat}</div>
              <h1 className="futuristic-title" style={{ fontSize: 32, color: '#fff', marginBottom: 18 }}>{liveAuction.title}</h1>
              <p style={{ color: '#acacb8', fontSize: 17, lineHeight: 1.8, marginBottom: 32 }}>Nexus ID: <span className="mono" style={{ color: '#7b2fff' }}>{id}</span>. Multi-user bidding protocols are currently active. All transmissions are recorded on the public ledger.</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 24px', background: 'rgba(52,211,153,0.04)', borderRadius: 16, border: '1px solid rgba(52,211,153,0.1)' }}>
                <Avatar size={48} style={{ background: 'linear-gradient(135deg, #7b2fff, #22d3ee)' }} icon={<SafetyCertificateOutlined />} />
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Nexus Shield Verified</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Bidding activity is monitored by NOVABID AI for market integrity.</div>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Transmission Controls */}
        <Col xs={24} lg={9}>
          <div className="glass-card" style={{ padding: '36px 28px', marginBottom: 24, textAlign: 'center', border: '1px solid rgba(34,211,238,0.2)' }}>
            <div className={`mono ${isUrgent && !auctionEnded ? 'timer-urgent' : ''}`} style={{ fontSize: 58, fontWeight: 900, color: auctionEnded ? '#fbbf24' : isUrgent ? '#f87171' : '#22d3ee' }}>
              {auctionEnded ? 'TERMINATED' : `${m}:${s}`}
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: 3, marginTop: 12, textTransform: 'uppercase' }}>TIME REMAINING IN CYCLE</div>
          </div>

          <div className="glass-card" style={{ padding: '36px 28px', marginBottom: 24 }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Highest Transmission</div>
              <div className="mono" style={{ fontSize: 52, fontWeight: 900, color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>₹{liveAuction.currentBid.toLocaleString()}</div>
            </div>
            
            <Form form={form} onFinish={placeBid}>
              <Form.Item name="bidAmount">
                <Input prefix={<span style={{ fontWeight: 900, color: '#7b2fff' }}>₹</span>} type="number" 
                  placeholder={`Min ₹${(liveAuction.currentBid + 100).toLocaleString()}`} 
                  size="large" style={{ height: 64, fontSize: 26, fontWeight: 900, borderRadius: 14 }} 
                  disabled={auctionEnded} 
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading} disabled={auctionEnded} 
                style={{ height: 64, borderRadius: 14, fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>
                {auctionEnded ? 'TERMINAL LOCKED' : <><SendOutlined /> TRANSMIT BID</>}
              </Button>
            </Form>
          </div>

          {/* Real-Time Transmission Log (Multiple Buyers) */}
          <div className="glass-card" style={{ border: '1px solid rgba(123,47,255,0.3)', overflow: 'hidden' }}>
            <div style={{ 
              padding: '20px 24px', background: 'rgba(123,47,255,0.12)', borderBottom: '1px solid rgba(255,255,255,0.05)', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}>
              <span style={{ fontWeight: 900, color: '#fff', fontSize: 13, letterSpacing: 1.5 }}><RiseOutlined /> LIVE ACTIVITY FEED</span>
              <Badge count={bids.length} color="#7b2fff" style={{ boxShadow: 'none' }} />
            </div>
            
            <div style={{ maxHeight: 340, overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
              {bids.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#4b5563' }}>
                  <HistoryOutlined style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }} />
                  <div>No bid nodes detected in this sector.</div>
                </div>
              ) : bids.map((b, i) => {
                const isWinner = i === 0
                const isOld = i > 0 && auctionEnded
                
                return (
                  <div key={b.id} className={isWinner ? "shimmer" : ""} style={{ 
                    padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isWinner ? 'rgba(52,211,153,0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    animation: isWinner ? 'pulseGlow 2.5s infinite' : 'none',
                    opacity: isOld ? 0.4 : 1,
                    transition: '0.4s'
                  }}>
                    <Space size={14}>
                      <Avatar size={36} src={b.avatar} style={{ 
                        background: isWinner ? 'linear-gradient(135deg, #34d399, #10b981)' : '#1a1a1a',
                        border: `1px solid ${isWinner ? '#34d399' : '#333'}`,
                        fontWeight: 800
                      }}>{b.buyer[0]}</Avatar>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: isWinner ? '#34d399' : '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {b.buyer} 
                          {isWinner && <span style={{ 
                            background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)',
                            fontSize: 9, padding: '2px 6px', borderRadius: 6, fontWeight: 900
                          }}>HIGHEST 🔥</span>}
                        </div>
                        <div style={{ fontSize: 10, color: '#6b7280' }}>{b.time}</div>
                      </div>
                    </Space>
                    <div className="mono" style={{ fontWeight: 900, fontSize: 19, color: isWinner ? '#34d399' : '#d8b4fe' }}>
                      ₹{b.amount.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {auctionEnded && (
              <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(248,113,113,0.05)', borderTop: '1px solid rgba(248,113,113,0.1)' }}>
                <span style={{ fontSize: 11, color: '#f87171', fontWeight: 800, letterSpacing: 1.5 }}>
                  <LockOutlined /> TRANSMISSIONS TERMINATED IN THIS SECTOR
                </span>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  )
}
