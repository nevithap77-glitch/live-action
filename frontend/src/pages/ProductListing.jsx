import React, { useState, useEffect, useRef } from 'react'
import { Row, Col, Button, Input, Select, Tooltip, message, Badge } from 'antd'
import {
  SearchOutlined, FilterOutlined, ClockCircleOutlined,
  ThunderboltOutlined, HeartOutlined, HeartFilled,
  MessageOutlined, SendOutlined, RobotOutlined, CloseOutlined,
  FireOutlined, HistoryOutlined
} from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useAuction } from '../context/AuctionContext'

const { Option } = Select

// ── Static Catalog Data ──
const STATIC_PRODUCTS = [
  { id:1,  emoji:'🥽', title:'Neural AR Glasses Ultra',    cat:'High-Tech Gadgets',  bid:4200,  hot:true,  tag:'RARE'    },
  { id:2,  emoji:'🚁', title:'Quantum Drone X9',           cat:'High-Tech Gadgets',  bid:3100,  hot:false, tag:'NEW'     },
  { id:20, emoji:'🤖', title:'AI Home Bot Gen-5',         cat:'High-Tech Gadgets',  bid:2600,  hot:true,  tag:'HOT'     },
  { id:3,  emoji:'🎁', title:'Legendary Mystery Box',      cat:'Mystery Boxes',      bid:1800,  hot:true,  tag:'HOT'     },
  { id:23, emoji:'💜', title:'Luxury Enigma Bundle',       cat:'Mystery Boxes',      bid:2400,  hot:true,  tag:'RARE'    },
  { id:4,  emoji:'👕', title:"Cristiano Signed Jersey",    cat:'Collectibles',       bid:6500,  hot:true,  tag:'LEGEND'  },
  { id:5,  emoji:'🏏', title:"MSD Cricket Bat – Signed",   cat:'Collectibles',       bid:7200,  hot:true,  tag:'LEGEND'  },
  { id:11, emoji:'👜', title:'Hermès Birkin Bag',          cat:'Luxury & Fashion',   bid:8900,  hot:true,  tag:'RARE'    },
  { id:12, emoji:'🏎️', title:'F1 Paddock Pass 2025',      cat:'Experiences',        bid:3100,  hot:true,  tag:'EVENT'   },
  { id:13, emoji:'岛', title:'Private Island Getaway',    cat:'Experiences',        bid:9900,  hot:true,  tag:'ULTRA'   },
  { id:27, emoji:'🚀', title:'Space Voyage Ticket',       cat:'Experiences',        bid:12500, hot:true,  tag:'ULTRA'   },
  { id:16, emoji:'📸', title:'Apollo 11 Original Photo',   cat:'Art & Memorabilia',  bid:4400,  hot:true,  tag:'HISTORIC'},
  { id:28, emoji:'🖼️', title:'Limited Picasso Litho',     cat:'Art & Memorabilia',  bid:7800,  hot:false, tag:'RARE'    },
]

function useCountdown(initialSec) {
  const [t, setT] = useState(() => Math.max(initialSec - (Math.floor(Math.random() * 200)), 5))
  useEffect(() => {
    const i = setInterval(() => setT(p => p > 0 ? p - 1 : initialSec), 1000)
    return () => clearInterval(i)
  }, [initialSec])
  const m = String(Math.floor(t / 60)).padStart(2, '0')
  const s = String(t % 60).padStart(2, '0')
  return { display: `${m}:${s}`, urgent: t < 30 }
}

function ProductCard({ p, index }) {
  const { toggle, isInWishlist } = useWishlist()
  const { isBuyer } = useAuth()
  const inWish = isInWishlist(p.id)
  const countdown = useCountdown(300)
  const cardRef = useRef()

  const onMouseMove = (e) => {
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width - 0.5) * 16
    const y = -((e.clientY - top) / height - 0.5) * 16
    cardRef.current.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) translateY(-5px)`
  }
  const onMouseLeave = () => { cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)' }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(p)
    message.success({ 
      content: inWish ? 'Removed from Wishlist' : '⚡ Nexus Node Wishlisted', 
      style: { marginTop: '10vh' } 
    })
  }

  return (
    <div ref={cardRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      className={`glass-card product-card-hover ${p.hot ? 'pulse-glow' : ''}`}
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        border: `1px solid ${p.hot ? 'rgba(251,191,36,0.25)' : 'rgba(123,47,255,0.18)'}`,
        animation: `pageIn 0.5s ease both ${index * 0.04}s`,
        background: 'rgba(10,0,26,0.92)'
      }}>

      {/* Floating Badges */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: 6 }}>
        <Badge status={p.hot ? "warning" : "processing"} />
        <span style={{ 
          background: p.hot ? 'rgba(251,191,36,0.1)' : 'rgba(123,47,255,0.08)', 
          color: p.hot ? '#fbbf24' : '#d8b4fe',
          border: `1px solid ${p.hot ? '#fbbf24' : '#7b2fff'}`,
          borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 900, letterSpacing: 1.5
        }}>{p.tag || 'LIVE HUD'}</span>
      </div>

      {isBuyer && (
        <button onClick={handleWishlist} style={{
          position: 'absolute', top: 12, right: 12, zIndex: 20,
          background: inWish ? 'rgba(248,113,113,0.15)' : 'rgba(0,0,0,0.5)',
          border: `1px solid ${inWish ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '50%', width: 38, height: 38, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s'
        }}>
          {inWish ? <HeartFilled style={{ color: '#f87171' }} /> : <HeartOutlined style={{ color: '#fff' }} />}
        </button>
      )}

      {/* Visual Display */}
      <div style={{ 
        height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: 90, position: 'relative', background: 'rgba(5,0,15,0.6)' 
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(123,47,255,0.22), transparent 75%)' }} />
        <span style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 0 25px rgba(123,47,255,0.4))' }}>{p.emoji}</span>
      </div>

      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 10, color: '#a855f7', fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{p.cat}</div>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 19, color: '#fff', marginBottom: 22, lineHeight: 1.4 }}>{p.title}</h3>

        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(123,47,255,0.15)', display: 'flex', justifyContent: 'space-between', marginTop: 'auto', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Leading Bid</div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>₹{(p.bid || p.currentBid).toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Time Remaining</div>
            <div className={`mono ${countdown.urgent ? 'timer-urgent' : 'countdown-anim'}`} style={{ fontSize: 16, fontWeight: 700 }}>
               {countdown.display}
            </div>
          </div>
        </div>

        <Link to={`/bidding/${p.id}`}>
          <Button type="primary" block style={{ height: 52, borderRadius: 12, fontWeight: 800, letterSpacing: 1.5 }}>
            <ThunderboltOutlined /> VIEW AUCTION HUD
          </Button>
        </Link>
      </div>
    </div>
  )
}

function AIChat({ onClose }) {
  const [msgs, setMsgs] = useState([{ role: 'bot', text: '⚡ virtual terminal online. market logic analysis active.' }])
  const [input, setInput] = useState('')
  const bottom = useRef()
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = () => {
    if (!input.trim()) return
    setMsgs(p => [...p, { role: 'user', text: input }])
    setInput('')
    setTimeout(() => {
      const resp = ["Buy logic suggests bidding in the final 10 seconds.", "This sector has a 92% win rate today.", "Market peak detected. Bids are rising for AR assets.", "Bidding now will establish market leadership."]
      setMsgs(p => [...p, { role: 'bot', text: resp[Math.floor(Math.random()*resp.length)] }])
    }, 800)
  }

  return (
    <div className="glass-card" style={{ width: 380, height: 500, display: 'flex', flexDirection: 'column', border: '1px solid var(--purple)', boxShadow: '0 0 50px rgba(123,47,255,0.3)' }}>
       <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(123,47,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><RobotOutlined style={{ color: '#22d3ee' }} /> <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: 2 }}>NOVABID AI</span></div>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} size="small" />
       </div>
       <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ background: m.role === 'user' ? 'var(--purple)' : 'rgba(255,255,255,0.04)', padding: '12px 18px', borderRadius: 16, fontSize: 14, color: '#e5e7eb', lineHeight: 1.6 }}>{m.text}</div>
            </div>
          ))}
          <div ref={bottom} />
       </div>
       <div style={{ padding: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Input placeholder="Query AI Terminal..." value={input} onChange={e => setInput(e.target.value)} onPressEnter={send} suffix={<SendOutlined onClick={send} style={{ color: 'var(--purple)', cursor: 'pointer' }} />} style={{ borderRadius: 24, height: 48 }} />
       </div>
    </div>
  )
}

export default function ProductListing() {
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')
  const [showAI, setShowAI] = useState(false)
  const { liveAuctions } = useAuction()
  const navigate = useNavigate()

  const CATS = ['All', ...new Set(STATIC_PRODUCTS.map(p => p.cat))]

  const filtered = STATIC_PRODUCTS.filter(p => {
    const mc = cat === 'All' || p.cat === cat
    const ms = p.title.toLowerCase().includes(search.toLowerCase())
    return mc && ms
  })

  return (
    <div className="page-enter" style={{ padding: '50px 24px 150px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="mesh-bg" />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
        <h1 className="futuristic-title" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.8rem)', color: '#fff', marginBottom: 16 }}>
          Asset <span className="gradient-text">Nexus</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: 19 }}>{filtered.length + liveAuctions.length} auctions active via verified AI nodes.</p>
      </div>

      {/* ── NOW LIVE AUCTIONS (TOP SECTION) ── */}
      {liveAuctions.length > 0 && (
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div className="live-badge" style={{ padding: '6px 14px' }}>NEXUS SYNC [LIVE]</div>
            <h2 className="futuristic-title" style={{ fontSize: 26, color: '#fff', marginBottom: 0 }}>Now Live auctions</h2>
          </div>
          <div className="live-scroll">
            {liveAuctions.map((a, i) => (
              <div key={a.id} className="glass-card live-card shimmer" onClick={() => navigate(`/bidding/${a.id}`)} 
                   style={{ border: '1px solid rgba(123,47,255,0.3)', animation: `pageIn 0.6s ease both ${i * 0.12}s`, cursor: 'pointer' }}>
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, background: 'rgba(10,0,26,0.55)', position: 'relative' }}>
                   <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(123,47,255,0.18) 0%, transparent 75%)' }} />
                   <span style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 30px rgba(123,47,255,0.4))' }}>{a.emoji}</span>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ fontSize: 9, color: 'var(--purple-light)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>{a.cat}</div>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: 16, marginBottom: 18, height: 44, overflow: 'hidden', fontFamily: 'Syne' }}>{a.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.35)', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div>
                        <div style={{ fontSize: 8, color: '#6b7280', letterSpacing: 1 }}>TOP BID</div>
                        <div className="mono" style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>₹{a.currentBid.toLocaleString()}</div>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 8, color: '#6b7280', letterSpacing: 1 }}>EXPIRES</div>
                        <div className="mono" style={{ fontSize: 14, color: '#22d3ee' }}>{Math.floor(a.timeLeft/60)}:{(a.timeLeft%60).toString().padStart(2,'0')}</div>
                     </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#4b5563', marginTop: 14, fontWeight: 700 }}>Merchant: <span style={{ color: '#7b2fff' }}>{a.seller}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── SEARCH & FILTER ── */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 56, border: '1px solid rgba(123,47,255,0.25)' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Input prefix={<SearchOutlined style={{ color: '#7b2fff' }} />} placeholder="Search the Nexus asset database..." size="large" onChange={e => setSearch(e.target.value)} style={{ height: 56, borderRadius: 16 }} />
          </Col>
          <Col xs={24} md={8}>
            <Select size="large" style={{ width: '100%', height: 56 }} value={cat} onChange={setCat} suffixIcon={<FilterOutlined style={{ color: '#7b2fff' }} />}>
              {CATS.map(c => <Option key={c} value={c} style={{ fontFamily: 'Syne', fontWeight: 600 }}>{c}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
             <Badge count={filtered.length} overflowCount={999} color="#7b2fff" style={{ boxShadow: 'none' }}>
               <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>NODES MATCHED</div>
             </Badge>
          </Col>
        </Row>
      </div>

      {/* ── MARKETPLACE GRID ── */}
      <Row gutter={[36, 36]}>
        {filtered.map((p, i) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={p.id}>
            <ProductCard p={p} index={i} />
          </Col>
        ))}
      </Row>

      {/* AI Bot */}
      <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 1000 }}>
        {showAI ? <AIChat onClose={() => setShowAI(false)} /> : (
          <Button type="primary" shape="circle" icon={<RobotOutlined />} onClick={() => setShowAI(true)}
            className="pulse-glow" style={{ width: 72, height: 72, fontSize: 32, boxShadow: '0 0 30px rgba(123,47,255,0.4)' }} />
        )}
      </div>
    </div>
  )
}
