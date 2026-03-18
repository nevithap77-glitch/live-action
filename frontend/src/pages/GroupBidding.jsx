import React, { useState, useRef, useEffect } from 'react'
import { Row, Col, Button, Input, Form, Progress, message, Avatar, Space, Tooltip } from 'antd'
import {
  TeamOutlined, PlusOutlined, LinkOutlined, ThunderboltOutlined,
  CrownOutlined, CopyOutlined, CheckOutlined, InfoCircleOutlined,
  SafetyCertificateOutlined, SendOutlined, FireOutlined, LockOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const MEMBERS = [
  { name: 'AuctionKing99', contribution: 2800, avatar: '👑', status: 'online' },
  { name: 'BidMaster_X',   contribution: 1500, avatar: '⚡', status: 'online' },
  { name: 'LuxuryHunter',  contribution: 900,  avatar: '💎', status: 'idle' },
]
const POOL_TARGET = 9900
const POOL_ITEM = { emoji: '👜', title: 'Hermès Birkin Bag', cat: 'Luxury & Fashion', bids: 42 }

const SEED_CHAT = [
  { user: 'AuctionKing99', msg: "Team, we're at 52%. Let's push for the Birkin!", avatar: '👑' },
  { user: 'BidMaster_X',   msg: "Just added 1.5k. Let's secure it ⚡", avatar: '⚡' },
  { user: 'LuxuryHunter',  msg: "Market logic says we need at least 10k to stay safe.", avatar: '💎' },
]

export default function GroupBidding() {
  const { user, isAuthenticated } = useAuth()
  const [members, setMembers]         = useState(MEMBERS)
  const [form]                        = Form.useForm()
  const [chatForm]                    = Form.useForm()
  const [copied, setCopied]           = useState(false)
  const [userContrib, setUserContrib] = useState(0)
  const [chatMsgs, setChatMsgs]       = useState(SEED_CHAT)
  const chatBottom                    = useRef()
  const inviteLink = 'https://hnp.live/nexus/pool_J7K2'

  useEffect(() => { chatBottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMsgs])

  const totalPool = members.reduce((s, m) => s + m.contribution, 0) + userContrib
  const progress  = Math.min((totalPool / POOL_TARGET) * 100, 100)
  const remaining = Math.max(POOL_TARGET - totalPool, 0)

  const onContribute = ({ amount }) => {
    if (!isAuthenticated) return message.error('Authentication Required')
    const n = Number(amount)
    if (n <= 0) return
    setUserContrib(prev => prev + n)
    setChatMsgs(p => [...p, { user: user?.name || 'You', msg: `💎 Added $${n.toLocaleString()} to the pool!`, avatar: user?.avatar || '👤' }])
    form.resetFields()
    message.success(`$${n.toLocaleString()} contributed to Nexus Pool`)
  }

  const sendChat = ({ chatMsg }) => {
    if (!chatMsg?.trim()) return
    setChatMsgs(p => [...p, { user: user?.name || 'You', msg: chatMsg, avatar: user?.avatar || '👤' }])
    chatForm.resetFields()
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    message.success('Nexus invite copied')
  }

  return (
    <div className="page-enter" style={{ minHeight: '100vh', padding: '40px 24px 100px', maxWidth: 1300, margin: '0 auto' }}>
      <div className="mesh-bg" />

      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Collaborative Asset Acquisition</div>
        <h1 className="futuristic-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', color: '#fff', marginBottom: 14 }}>
          Nexus <span className="gradient-text">Pooling</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: 16 }}>Unite your bidding power with trusted members to secure high-value assets.</p>
      </div>

      <Row gutter={[32, 32]}>
        {/* LEFT: Pool Details & Chat */}
        <Col xs={24} lg={16}>
          {/* Pool Card */}
          <div className="glass-card pulse-glow" style={{ marginBottom: 32, border: '1px solid rgba(123,47,255,0.35)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 320px', height: 320, background: 'rgba(5,0,15,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 140, position: 'relative' }}>
                 <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(123,47,255,0.2) 0%, transparent 75%)' }} />
                 <span style={{ position: 'relative', zIndex: 2 }}>{POOL_ITEM.emoji}</span>
                 <div className="live-badge" style={{ position: 'absolute', top: 20, left: 20 }}>POOL ACTIVE</div>
              </div>
              <div style={{ flex: 1, padding: '34px 40px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, color: '#d8b4fe', fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>{POOL_ITEM.cat}</div>
                <h2 className="futuristic-title" style={{ fontSize: 32, color: '#fff', marginBottom: 20 }}>{POOL_ITEM.title}</h2>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: 24, borderRadius: 16, border: '1px solid rgba(123,47,255,0.15)', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ color: '#acacb8', fontSize: 12, fontWeight: 700 }}>COLLECTED POWER</span>
                    <span className="mono" style={{ color: progress >= 100 ? '#34d399' : '#fff', fontWeight: 900, fontSize: 18 }}>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress percent={progress} showInfo={false} strokeColor="linear-gradient(90deg, #7b2fff, #22d3ee)" trailColor="rgba(255,255,255,0.05)" strokeWidth={12} style={{ marginBottom: 20 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase' }}>Current Pool</div>
                      <div className="mono" style={{ color: '#fff', fontSize: 24, fontWeight: 900 }}>${totalPool.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase' }}>Target Goal</div>
                      <div className="mono" style={{ color: '#d8b4fe', fontSize: 24, fontWeight: 900 }}>${POOL_TARGET.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="glass-card" style={{ height: 440, display: 'flex', flexDirection: 'column', border: '1px solid rgba(123,47,255,0.2)' }}>
             <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="futuristic-title" style={{ color: '#fff', fontSize: 17, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                   <MessageOutlined /> Pool Transmission
                </h3>
                <Tag color="purple" style={{ borderRadius: 20, fontSize: 10 }}>{members.length + (isAuthenticated ? 1 : 0)} Active Nodes</Tag>
             </div>
             
             <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {chatMsgs.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <Avatar size={40} style={{ background: 'rgba(123,47,255,0.15)', flexShrink: 0 }}>{m.avatar}</Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                         <span style={{ fontWeight: 800, color: '#d8b4fe', fontSize: 12 }}>{m.user}</span>
                         <span style={{ fontSize: 9, color: '#6b7280' }}>JUST NOW</span>
                      </div>
                      <div style={{ 
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(123,47,255,0.1)', 
                        padding: '12px 18px', borderRadius: '0 16px 16px 16px', color: '#e5e7eb', fontSize: 14, lineHeight: 1.6 
                      }}>
                        {m.msg}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatBottom} />
             </div>

             <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Form form={chatForm} onFinish={sendChat} layout="inline" style={{ display: 'flex', gap: 12 }}>
                  <Form.Item name="chatMsg" style={{ flex: 1, margin: 0 }}>
                    <Input placeholder="Message pool members..." style={{ height: 48, borderRadius: 24, paddingLeft: 20 }} disabled={!isAuthenticated} />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" shape="circle" icon={<SendOutlined />} style={{ width: 48, height: 48 }} disabled={!isAuthenticated} />
                </Form>
             </div>
          </div>
        </Col>

        {/* RIGHT: Stats & Members */}
        <Col xs={24} lg={8}>
          {/* Contribution Tracker */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 24, border: '1px solid rgba(123,47,255,0.2)' }}>
             <h3 className="futuristic-title" style={{ color: '#fff', fontSize: 18, marginBottom: 24 }}>Nexus Contributors</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  ...(isAuthenticated ? [{ name: user?.name || 'You', contribution: userContrib, avatar: user?.avatar || '👤', isMe: true, status: 'online' }] : []),
                  ...members
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <Badge dot color={m.status === 'online' ? '#34d399' : '#6b7280'} offset={[-4, 32]}>
                         <Avatar size={44} style={{ background: m.isMe ? 'linear-gradient(135deg,#7b2fff,#22d3ee)' : 'rgba(255,255,255,0.05)' }}>{m.avatar}</Avatar>
                       </Badge>
                       <div>
                         <div style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>{m.name} {m.isMe && '(You)'}</div>
                         <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase' }}>Verified Miner</div>
                       </div>
                    </div>
                    <div className="mono" style={{ fontWeight: 900, color: '#d8b4fe', fontSize: 18 }}>${m.contribution.toLocaleString()}</div>
                  </div>
                ))}
             </div>

             <Form form={form} onFinish={onContribute} style={{ marginTop: 32 }}>
                <Form.Item name="amount" style={{ marginBottom: 16 }}>
                   <Input prefix={<span style={{ color: '#7b2fff', fontWeight: 900 }}>$</span>} type="number" placeholder="Enter Power (Amount)" size="large" style={{ height: 52, fontSize: 18, fontWeight: 900 }} />
                </Form.Item>
                <Button type="primary" htmlType="submit" block icon={<PlusOutlined />} style={{ height: 52, borderRadius: 14 }}>CONTRIBUTE POWER</Button>
             </Form>
          </div>

          {/* Share & Bid */}
          <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
             <div style={{ marginBottom: 24 }}>
               <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: 2, marginBottom: 12 }}>POOL INVITE LINK</div>
               <div style={{ 
                 background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: 10, 
                 fontSize: 11, fontFamily: 'monospace', color: '#a855f7', border: '1px solid rgba(123,47,255,0.2)', marginBottom: 14 
               }}>{inviteLink}</div>
               <Button block onClick={copyLink} icon={copied ? <CheckOutlined /> : <LinkOutlined />} 
                 style={{ height: 48, borderRadius: 12, fontWeight: 800, background: copied ? 'rgba(52,211,153,0.1)' : 'transparent', color: copied ? '#34d399' : '#fff' }}>
                 {copied ? 'LINK COPIED' : 'INVITE MEMBERS'}
               </Button>
             </div>

             <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 28 }}>
                <div className="mono" style={{ fontSize: 44, fontWeight: 900, color: '#fff', marginBottom: 6 }}>${totalPool.toLocaleString()}</div>
                <div style={{ color: progress >= 100 ? '#34d399' : '#6b7280', fontSize: 12, marginBottom: 24, fontWeight: 700 }}>
                   {progress >= 100 ? '✅ POOL READY TO STRIKE' : `$${remaining.toLocaleString()} NEEDED FOR ACTIVATION`}
                </div>
                <Button type="primary" block size="large" disabled={totalPool < POOL_TARGET} className={progress >= 100 ? 'pulse-glow' : ''} style={{ height: 64, borderRadius: 18, fontSize: 18 }}>
                   {progress >= 100 ? <><ThunderboltOutlined /> PLACE NEXUS BID</> : <><LockOutlined /> POOL LOCKED</>}
                </Button>
             </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}
