import React from 'react'
import { Row, Col, Button, Tag, Space, Empty, Card, Badge } from 'antd'
import {
  HistoryOutlined, TrophyOutlined, CloseCircleOutlined,
  ClockCircleOutlined, ThunderboltOutlined, RiseOutlined,
  ArrowRightOutlined, GlobalOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useAuction } from '../context/AuctionContext'

export default function BidHistory() {
  const { userBids } = useAuction()

  if (userBids.length === 0) return (
    <div className="page-enter" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
      <div className="mesh-bg" />
      <div style={{ fontSize: 110, marginBottom: 36, opacity: 0.25, filter: 'drop-shadow(0 0 30px rgba(123,47,255,0.4))' }}>📉</div>
      <h2 className="futuristic-title" style={{ color: '#fff', fontSize: 36, marginBottom: 18, letterSpacing: 1.5 }}>EMPTY TRANSMISSION LOG</h2>
      <p style={{ color: '#666670', marginBottom: 44, fontSize: 17, maxWidth: 500, textAlign: 'center' }}>No bidding nodes detected in your history. Initiate a bid in the Nexus to start tracking acquisitions.</p>
      <Link to="/products">
        <Button type="primary" size="large" icon={<ThunderboltOutlined />} 
          style={{ height: 64, padding: '0 56px', borderRadius: 18, fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>
          EXPLORE OPEN SECTORS ⚡
        </Button>
      </Link>
    </div>
  )

  const sorted = [...userBids].sort((a,b) => (b.lastUpdate || b.timestamp) - (a.lastUpdate || a.timestamp))

  return (
    <div className="page-enter" style={{ minHeight: '100vh', padding: '50px 24px 120px', maxWidth: 1300, margin: '0 auto' }}>
      <div className="mesh-bg" />

      <div style={{ marginBottom: 70, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#7b2fff', fontWeight: 900, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 18 }}>Nexus Central Ledger</div>
        <h1 className="futuristic-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', color: '#fff', marginBottom: 16 }}>
          My <span className="gradient-text">Transmission History</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: 17 }}>Syncing {userBids.length} entries with the global asset database.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sorted.map((item, idx) => {
          const isWon = item.status === 'Won 🏆'
          const isLost = item.status === 'Lost ❌'
          const statusColor = isWon ? '#34d399' : isLost ? '#f87171' : '#7b2fff'
          const glowColor = isWon ? 'rgba(52,211,153,0.1)' : isLost ? 'rgba(248,113,113,0.05)' : 'rgba(123,47,255,0.08)'

          return (
            <div key={idx} className="glass-card pageIn-anim" style={{ 
              padding: '32px 40px', display: 'flex', alignItems: 'center', gap: 36, flexWrap: 'wrap', 
              borderLeft: `6px solid ${statusColor}`,
              background: `linear-gradient(90deg, ${glowColor}, transparent)`,
              animation: `pageIn 0.6s ease both ${idx * 0.08}s`,
              border: `1px solid rgba(255,255,255,0.05)`,
              boxShadow: isWon ? '0 0 40px rgba(52,211,153,0.08)' : 'none'
            }}>
              <div style={{ 
                width: 84, height: 84, background: 'rgba(5,0,15,0.85)', borderRadius: 18, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, 
                boxShadow: `0 0 25px ${statusColor}22`, border: '1px solid rgba(255,255,255,0.05)'
              }}>{item.emoji}</div>

              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 900, fontSize: 22, color: '#fff', margin: 0 }}>{item.title}</h3>
                  {isWon ? <Tag color="green" style={{ borderRadius: 6, fontWeight: 900 }}>🏆 WON</Tag> : 
                   isLost ? <Tag color="red" style={{ borderRadius: 6, fontWeight: 900 }}>❌ LOST</Tag> : 
                   <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 900 }}>⏳ ONGOING</Tag>}
                </div>
                <div style={{ color: '#4b5563', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <GlobalOutlined style={{ color: '#7b2fff' }} /> NODE ID: <span className="mono" style={{ color: '#6b7280' }}>{item.auctionId.split('_').pop().toUpperCase()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>MY HIGHEST BID</div>
                    <div className="mono" style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>₹{item.myBid.toLocaleString()}</div>
                 </div>
                 
                 {item.finalBid && (
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>TERMINAL PRICE</div>
                     <div className="mono" style={{ fontSize: 24, fontWeight: 900, color: isWon ? '#34d399' : '#f87171' }}>₹{item.finalBid.toLocaleString()}</div>
                   </div>
                 )}

                 <Link to={`/bidding/${item.auctionId}`}>
                    <Button type="primary" shape="circle" size="large" icon={<ArrowRightOutlined />} 
                      style={{ width: 56, height: 56, background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.3)', color: '#d8b4fe' }} />
                 </Link>
              </div>
            </div>
          )
        })}
      </div>
      
      <div style={{ marginTop: 80, textAlign: 'center', opacity: 0.6 }}>
         <div style={{ fontSize: 12, color: '#6b7280', letterSpacing: 2 }}>NEXUS PROTOCOL v4.2 // END OF TRANSMISSION LOG</div>
      </div>
    </div>
  )
}
