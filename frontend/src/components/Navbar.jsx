import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Drawer, Dropdown, Avatar, message, Badge, Tooltip } from 'antd'
import {
  HomeOutlined, AppstoreOutlined, HeartOutlined, HeartFilled,
  OrderedListOutlined, TeamOutlined, MenuOutlined, CloseOutlined,
  LogoutOutlined, UserOutlined, LoginOutlined, DashboardOutlined,
  PlusCircleOutlined, ShoppingOutlined, ThunderboltOutlined,
  BlockOutlined, HistoryOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'

export default function Navbar() {
  const { user, isAuthenticated, isBuyer, isSeller, logout } = useAuth()
  const { wishlist } = useWishlist()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const isActive = (p) => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)

  const doLogout = () => {
    logout()
    message.success({ content: 'Nexus Connection Terminated. Goodbye.', style: { marginTop: '10vh' } })
    navigate('/')
    setDrawerOpen(false)
  }

  // Role-specific navigation links
  const BUYER_LINKS = [
    { to: '/',              label: 'HOME',     icon: <HomeOutlined />,          side: 'left'  },
    { to: '/products',      label: 'AUCTIONS', icon: <AppstoreOutlined />,      side: 'left'  },
    { to: '/group-bidding', label: 'GROUPS',   icon: <TeamOutlined />,          side: 'right' },
    { to: '/history',        label: 'HISTORY',  icon: <HistoryOutlined />,      side: 'right' },
    { to: '/orders',         label: 'ORDERS',   icon: <OrderedListOutlined />,   side: 'right' },
  ]

  const SELLER_LINKS = [
    { to: '/',       label: 'HOME',       icon: <HomeOutlined />,        side: 'left'  },
    { to: '/seller', label: 'TERMINAL',   icon: <DashboardOutlined />,   side: 'left'  },
    { to: '/seller', label: 'LISTING',    icon: <PlusCircleOutlined />,  side: 'right' },
  ]

  const PUBLIC_LINKS = [
    { to: '/', label: 'HOME', icon: <HomeOutlined />, side: 'left' },
  ]

  const links = isAuthenticated ? (isBuyer ? BUYER_LINKS : SELLER_LINKS) : PUBLIC_LINKS

  const userMenu = { items: [
    { key: 'info', label: (
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontWeight: 800, color: isBuyer ? '#7b2fff' : '#fbbf24', fontFamily: 'Syne, sans-serif', fontSize: 13 }}>{user?.name}</div>
        <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 }}>
          {isBuyer ? '⚡ AUTHENTICATED BUYER' : '🏪 VERIFIED MERCHANT'}
        </div>
      </div>
    ), disabled: true },
    { type: 'divider' },
    isBuyer && { key: 'wishlist', label: (
      <Link to="/wishlist" style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
        <HeartFilled style={{ color: '#f87171' }} /> My Wishlist <Badge count={wishlist.length} size="small" offset={[5, -2]} />
      </Link>
    )},
    { key: 'logout', label: (
      <span style={{ color: '#f87171', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
        <LogoutOutlined /> DISCONNECT
      </span>
    ), onClick: doLogout },
  ].filter(Boolean) }

  const NavLink = ({ to, label, icon, mobile }) => {
    const active = isActive(to)
    const color = active ? (isSeller ? '#fbbf24' : '#d8b4fe') : '#666670'
    
    const style = mobile ? {
      display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px',
      background: active ? (isSeller ? 'rgba(251,191,36,0.1)' : 'rgba(123,47,255,0.12)') : 'transparent',
      border: `1px solid ${active ? (isSeller ? '#fbbf24' : '#7b2fff') : 'rgba(255,255,255,0.05)'}`,
      borderRadius: 14, color: color,
      fontSize: 15, fontWeight: 800, marginBottom: 10, textDecoration: 'none', transition: '0.3s',
      fontFamily: 'Syne, sans-serif'
    } : {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px', borderRadius: 10,
      color: color, fontSize: 11, fontWeight: 800, textDecoration: 'none', transition: '0.3s',
      fontFamily: 'Syne, sans-serif', letterSpacing: 1.5,
      position: 'relative'
    }
    return (
      <Link to={to} onClick={() => setDrawerOpen(false)} style={style}>
        {icon} {label}
        {!mobile && active && (
          <div style={{ position: 'absolute', bottom: -18, left: '20%', right: '20%', height: 2, background: isSeller ? '#fbbf24' : '#7b2fff', boxShadow: `0 0 10px ${isSeller ? '#fbbf24' : '#7b2fff'}` }} />
        )}
      </Link>
    )
  }

  const leftLinks  = links.filter(l => l.side === 'left')
  const rightLinks = links.filter(l => l.side === 'right')

  const borderColor = scrolled ? (isSeller ? 'rgba(251,191,36,0.25)' : 'rgba(123,47,255,0.3)') : 'rgba(255,255,255,0.05)'

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 80,
        display: 'flex', alignItems: 'center', padding: '0 40px',
        background: scrolled ? 'rgba(2,0,8,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${borderColor}`,
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
      }}>

        {/* Left Section */}
        <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center' }} className="nav-desktop">
          {leftLinks.map(l => <NavLink key={l.to + l.label} {...l} />)}
        </div>

        {/* CENTER LOGO */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{
              fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: 22,
              letterSpacing: 3, color: '#fff',
              textShadow: isSeller ? '0 0 25px rgba(251,191,36,0.6)' : '0 0 25px rgba(123,47,255,0.6)',
              transition: 'all 0.4s ease', display: 'flex', alignItems: 'center', gap: 10
            }}>
              <ThunderboltOutlined style={{ color: isSeller ? '#fbbf24' : '#7b2fff' }} className="pulse-glow" /> 
              HNP <span style={{ color: isSeller ? '#fbbf24' : '#d8b4fe' }}>LIVE</span>
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }} className="nav-desktop">
          {rightLinks.map(l => <NavLink key={l.to + l.label} {...l} />)}

          {isBuyer && (
            <Link to="/wishlist" style={{ marginLeft: 10 }}>
              <Tooltip title="NEXUS WISHLIST">
                <Badge count={wishlist.length} size="small" color="#f87171" offset={[-2, 6]}>
                  <Button type="text" shape="circle" icon={<HeartOutlined style={{ fontSize: 20, color: wishlist.length > 0 ? '#f87171' : '#666670' }} />} />
                </Badge>
              </Tooltip>
            </Link>
          )}

          <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.08)', margin: '0 12px' }} />

          {isAuthenticated ? (
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']} overlayStyle={{ paddingTop: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '6px 16px 6px 6px', borderRadius: 14,
                background: isSeller ? 'rgba(251,191,36,0.06)' : 'rgba(123,47,255,0.06)',
                border: `1px solid ${isSeller ? 'rgba(251,191,36,0.25)' : 'rgba(123,47,255,0.25)'}`,
                transition: '0.3s'
              }} className="nav-user-btn">
                <Avatar size={34} style={{ background: isSeller ? 'linear-gradient(135deg,#b8860b,#fbbf24)' : 'linear-gradient(135deg,#7b2fff,#22d3ee)', fontSize: 16 }}>
                  {user?.avatar}
                </Avatar>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 800, fontFamily: 'Syne', lineHeight: 1 }}>{user?.name}</div>
                  <div style={{ fontSize: 8, color: isSeller ? '#fbbf24' : '#d8b4fe', fontWeight: 900, letterSpacing: 1, marginTop: 4 }}>
                     {isSeller ? 'MERCHANT' : 'BUYER'}
                  </div>
                </div>
              </div>
            </Dropdown>
          ) : (
            <Link to="/login">
              <Button type="primary" icon={<LoginOutlined />} style={{ height: 46, borderRadius: 12, padding: '0 24px', fontSize: 13, fontWeight: 800, letterSpacing: 1, fontFamily: 'Syne' }}>
                ACCESS TERMINAL
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="nav-mobile" style={{ display: 'none', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Orbitron', fontWeight: 900, color: '#fff', fontSize: 16, letterSpacing: 2 }}>HNP LIVE</span>
          <Button type="text" icon={<MenuOutlined style={{ color: '#fff', fontSize: 24 }} />} onClick={() => setDrawerOpen(true)} />
        </div>
      </nav>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} placement="right" width={320}
        styles={{ body: { background: '#050010', padding: 24 }, header: { background: '#050010', borderBottom: '1px solid rgba(255,255,255,0.05)' } }}
        title={<span style={{ fontFamily: 'Orbitron', color: '#fff', fontWeight: 900, fontSize: 18 }}>NEXUS MENU</span>}
        closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
      >
        <div style={{ marginBottom: 32, padding: '20px', background: 'rgba(123,47,255,0.05)', borderRadius: 16, border: '1px solid rgba(123,47,255,0.1)' }}>
           {isAuthenticated ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar size={50} style={{ background: isSeller ? '#fbbf24' : '#7b2fff' }}>{user?.avatar}</Avatar>
                <div>
                   <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'Syne' }}>{user?.name}</div>
                   <div style={{ color: isSeller ? '#fbbf24' : '#d8b4fe', fontSize: 10, fontWeight: 900 }}>{isSeller ? 'VERIFIED MERCHANT' : 'NEXUS BUYER'}</div>
                </div>
             </div>
           ) : (
             <div style={{ color: '#666670', fontSize: 13 }}>Please sign in to access auctions.</div>
           )}
        </div>

        {links.map(l => <NavLink key={l.to + l.label} {...l} mobile />)}
        
        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          {isAuthenticated
            ? <Button block danger size="large" onClick={doLogout} style={{ height: 56, borderRadius: 14, fontWeight: 800 }}><LogoutOutlined /> DISCONNECT TERMINAL</Button>
            : <Link to="/login" onClick={() => setDrawerOpen(false)}><Button type="primary" block size="large" style={{ height: 56, borderRadius: 14 }}>ACCESS TERMINAL</Button></Link>
          }
        </div>
      </Drawer>

      <style>{`
        @media (max-width: 1050px) { .nav-desktop{ display:none!important; } .nav-mobile{ display:flex!important; } }
        @media (min-width: 1051px) { .nav-mobile{ display:none!important; } .nav-desktop{ display:flex!important; } }
        .nav-user-btn:hover { border-color: #fff !important; transform: translateY(-1px); }
      `}</style>
      <div style={{ height: scrolled ? 80 : 0 }} />
    </>
  )
}
