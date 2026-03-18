import React, { useState, useEffect } from 'react'
import { Row, Col, Button, Input, Select, Form, Tag, message, Empty, Statistic, Modal, Avatar, Space } from 'antd'
import {
  PlusOutlined, TrophyOutlined, AppstoreOutlined, ThunderboltOutlined,
  DollarOutlined, RocketOutlined, HistoryOutlined, TeamOutlined,
  EyeOutlined, RiseOutlined, CloseOutlined, GlobalOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { useAuction } from '../context/AuctionContext'

const { Option } = Select
const CATS = ['High-Tech Gadgets', 'Mystery Boxes', 'Collectibles', 'Luxury & Fashion', 'Experiences', 'Art & Memorabilia']

function useSellerTimer(endSec) {
  const [t, setT] = useState(endSec)
  useEffect(() => {
    if (t === null || t <= 0) return
    const i = setInterval(() => setT(p => (p > 0 ? p - 1 : 0)), 1000)
    return () => clearInterval(i)
  }, [t])
  if (t === null || t <= 0) return 'Terminated'
  const m = String(Math.floor(t / 60)).padStart(2, '0')
  const s = String(t % 60).padStart(2, '0')
  return `${m}:${s}`
}

function ProductRow({ p, onViewBids }) {
  const timer = useSellerTimer(p.timeLeft)
  const isLive = p.status === 'live' && timer !== 'Terminated'
  
  return (
    <div className="glass-card" style={{
      padding: '24px 32px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 24,
      border: `1px solid ${isLive ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.06)'}`,
      flexWrap: 'wrap', background: 'rgba(10,0,26,0.6)'
    }}>
      <div style={{ 
        width: 70, height: 70, background: 'rgba(251,191,36,0.08)', borderRadius: 16, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, 
        border: '1px solid rgba(251,191,36,0.2)' 
      }}>{p.emoji}</div>
      
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontWeight: 800, color: '#fff', fontSize: 18, marginBottom: 6, fontFamily: 'Syne' }}>{p.title}</div>
        <Tag color="gold" style={{ fontSize: 9, fontWeight: 900, borderRadius: 4 }}>{p.cat}</Tag>
      </div>

      <div style={{ textAlign: 'center', minWidth: 120 }}>
        <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Current Bid</div>
        <div className="mono" style={{ fontWeight: 900, fontSize: 20, color: '#fbbf24' }}>₹{p.currentBid.toLocaleString()}</div>
      </div>

      <div style={{ textAlign: 'center', minWidth: 80 }}>
        <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Bidders</div>
        <div className="mono" style={{ fontWeight: 900, fontSize: 19, color: '#fff' }}>{(p.bids || []).length}</div>
      </div>

      <div style={{ textAlign: 'center', minWidth: 90 }}>
        <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Status</div>
        <div className={`mono ${p.timeLeft < 60 && isLive ? 'timer-urgent' : ''}`} style={{ fontSize: 15, fontWeight: 700, color: isLive ? '#22d3ee' : '#f87171' }}>
          {timer === 'Terminated' ? 'LOCKED' : timer}
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Button ghost size="small" icon={<RiseOutlined />} onClick={() => onViewBids(p)} 
          style={{ borderRadius: 10, borderColor: 'rgba(251,191,36,0.4)', color: '#fbbf24', height: 38, padding: '0 16px', fontWeight: 800 }}>
          INSIGHTS
        </Button>
        {isLive ? <Tag color="green" style={{ borderRadius: 4, fontWeight: 900 }}>LIVE HUD</Tag> : <Tag color="default" style={{ borderRadius: 4, fontWeight: 900 }}>ENDED</Tag>}
      </div>
    </div>
  )
}

export default function SellerDashboard() {
  const { user } = useAuth()
  const { liveAuctions, endedAuctions, addLiveAuction } = useAuction()
  const [form] = Form.useForm()
  const [listing, setListing] = useState(false)
  const [biddersModal, setBiddersModal] = useState(null)

  const myAuctions = liveAuctions.filter(a => a.seller === (user?.name || 'Seller'))
  const myEnded = endedAuctions.filter(a => a.seller === (user?.name || 'Seller'))
  
  const totalRev = myEnded.reduce((s, p) => s + p.currentBid, 0)

  const onFinish = (values) => {
    setListing(true)
    setTimeout(() => {
      addLiveAuction({
        ...values,
        sellerName: user?.name || 'Seller',
        startPrice: Number(values.startPrice),
        duration: Number(values.duration)
      })
      form.resetFields()
      setListing(false)
      message.success({ 
        content: `🚀 "${values.title}" launched to Nexus Hub!`, 
        style: { marginTop: '10vh' },
        icon: <ThunderboltOutlined style={{ color: '#fbbf24' }} />
      })
    }, 1200)
  }

  return (
    <div className="page-enter" style={{ padding: '50px 24px 120px', maxWidth: 1450, margin: '0 auto' }}>
      <div className="mesh-bg" />

      <div style={{ marginBottom: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32 }}>
        <div>
          <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 900, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>Merchant Control Terminal</div>
          <h1 className="futuristic-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#fff' }}>Sector <span style={{ color: '#fbbf24' }}>Insights</span></h1>
          <p style={{ color: '#6b7280', fontSize: 17 }}>Authenticated Node: <span style={{ color: '#fbbf24', fontWeight: 700 }}>{user?.name}</span></p>
        </div>
        
        <div style={{ display: 'flex', gap: 20 }}>
           <Statistic title={<span style={{ color: '#6b7280', letterSpacing: 1.5, fontSize: 10 }}>ACCUMULATED REVENUE</span>} value={totalRev} prefix="₹" className="glass-card" style={{ padding: '20px 40px', border: '1px solid rgba(251,191,36,0.2)' }} valueStyle={{ color: '#fbbf24', fontFamily: 'Orbitron', fontWeight: 900, fontSize: 28 }} />
           <Statistic title={<span style={{ color: '#6b7280', letterSpacing: 1.5, fontSize: 10 }}>ACTIVE TRANSMISSIONS</span>} value={myAuctions.length} className="glass-card" style={{ padding: '20px 40px', border: '1px solid rgba(123,47,255,0.2)' }} valueStyle={{ color: '#7b2fff', fontFamily: 'Orbitron', fontWeight: 900, fontSize: 28 }} />
        </div>
      </div>

      <Row gutter={[44, 44]}>
        <Col xs={24} lg={16}>
          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
            <TeamOutlined style={{ color: '#fbbf24', fontSize: 24 }} />
            <h2 className="futuristic-title" style={{ color: '#fff', fontSize: 24, marginBottom: 0 }}>Asset Fleet Management</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myAuctions.map(a => <ProductRow key={a.id} p={a} onViewBids={setBiddersModal} />)}
            {myEnded.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 70, marginBottom: 32, opacity: 0.6 }}>
                  <HistoryOutlined style={{ color: '#6b7280', fontSize: 24 }} />
                  <h2 className="futuristic-title" style={{ color: '#6b7280', fontSize: 24, marginBottom: 0 }}>Terminated Cycles</h2>
                </div>
                {myEnded.map(a => <ProductRow key={a.id} p={a} onViewBids={setBiddersModal} />)}
              </>
            )}
            {myAuctions.length === 0 && myEnded.length === 0 && (
              <div style={{ padding: 100, textAlign: 'center', background: 'rgba(255,191,36,0.02)', borderRadius: 24, border: '1px dashed rgba(251,191,36,0.2)' }}>
                <Empty description={<span style={{ color: '#6b7280', fontSize: 16 }}>No active transmissions detected. Launch an asset to begin.</span>} />
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div className="glass-card" style={{ padding: '44px 36px', border: '1px solid rgba(251,191,36,0.25)', position: 'sticky', top: 110, background: 'rgba(10,0,26,0.8)' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 900, fontSize: 22, color: '#fff', marginBottom: 36, letterSpacing: 1.5 }}><PlusOutlined style={{ color: '#fbbf24' }} /> INITIATE TRANSMISSION</div>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item name="emoji" label={<span style={{ color: '#555', fontSize: 11, fontWeight: 800 }}>ASSET ICON</span>} rules={[{ required: true }]} initialValue="📦">
                 <Input placeholder="🎁" style={{ height: 56, fontSize: 28, textAlign: 'center', borderRadius: 14 }} />
              </Form.Item>
              <Form.Item name="title" label={<span style={{ color: '#555', fontSize: 11, fontWeight: 800 }}>ASSET NAME</span>} rules={[{ required: true }]}>
                 <Input placeholder="Rare Tech Asset #401" style={{ height: 56, borderRadius: 14 }} />
              </Form.Item>
              <Form.Item name="category" label={<span style={{ color: '#555', fontSize: 11, fontWeight: 800 }}>SECTOR CATEGORY</span>} rules={[{ required: true }]}>
                 <Select size="large" style={{ height: 56 }}>
                   {CATS.map(c => <Option key={c} value={c} style={{ fontFamily: 'Syne', fontWeight: 600 }}>{c}</Option>)}
                 </Select>
              </Form.Item>
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item name="startPrice" label={<span style={{ color: '#555', fontSize: 11, fontWeight: 800 }}>RESERVE (₹)</span>} rules={[{ required: true }]}>
                    <Input type="number" prefix={<span style={{ color: '#fbbf24', fontWeight: 900 }}>₹</span>} style={{ height: 56, borderRadius: 14 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="duration" label={<span style={{ color: '#555', fontSize: 11, fontWeight: 800 }}>CYCLE (MIN)</span>} rules={[{ required: true }]} initialValue={5}>
                    <Select size="large" style={{ height: 56 }}>
                       {[1, 5, 10, 15, 30, 60].map(v => <Option key={v} value={v}>{v}m</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" loading={listing} block icon={<RocketOutlined />} 
                style={{ height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #b8860b, #fbbf24)', border: 'none', fontWeight: 900, fontSize: 17, letterSpacing: 1, marginTop: 12 }}>
                LAUNCH TO NEXUS HUB
              </Button>
            </Form>
          </div>
        </Col>
      </Row>

      {/* Bidder Insights Modal */}
      <Modal 
        title={<span style={{ fontFamily: 'Syne', fontWeight: 900, fontSize: 20, color: '#fff' }}><GlobalOutlined style={{ color: '#fbbf24' }} /> Transmission Logs: {biddersModal?.title}</span>}
        open={!!biddersModal} 
        onCancel={() => setBiddersModal(null)} 
        footer={null} 
        width={650}
        closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
        styles={{ body: { background: '#080018', padding: 0 } }}
      >
        <div style={{ padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, background: 'rgba(251,191,36,0.08)', padding: '20px 24px', borderRadius: 18, border: '1px solid rgba(251,191,36,0.15)' }}>
            <div><div style={{ fontSize: 10, color: '#666', letterSpacing: 1 }}>TOP TRANSMISSION</div><div className="mono" style={{ fontSize: 28, fontWeight: 900, color: '#fbbf24' }}>₹{biddersModal?.currentBid.toLocaleString()}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: '#666', letterSpacing: 1 }}>TOTAL ACTIVITY</div><div className="mono" style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{(biddersModal?.bids || []).length} NODES</div></div>
          </div>
          
          <div style={{ maxHeight: 450, overflowY: 'auto', paddingRight: 8 }}>
            {(biddersModal?.bids || []).length === 0 ? <Empty description={<span style={{ color: '#4b5563' }}>No bid activity detected.</span>} /> : biddersModal.bids.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Space size={14}>
                  <Avatar size={40} style={{ background: i === 0 ? '#fbbf24' : '#1a1a1a', border: `1px solid ${i === 0 ? '#fbbf24' : '#333'}`, color: i === 0 ? '#000' : '#fff' }}>{b.buyer[0]}</Avatar>
                  <div>
                    <div style={{ fontWeight: 800, color: i === 0 ? '#fbbf24' : '#fff', fontSize: 16 }}>{b.buyer} {i === 0 && <Tag color="gold" style={{ fontSize: 9, marginLeft: 10, fontWeight: 900 }}>CHAMPION NODE</Tag>}</div>
                    <div style={{ fontSize: 11, color: '#4b5563' }}>{b.time} // Log ID: {b.id.split('_').pop()}</div>
                  </div>
                </Space>
                <div className="mono" style={{ fontWeight: 900, fontSize: 20, color: i === 0 ? '#fbbf24' : '#6b7280' }}>₹{b.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
