import React, { createContext, useContext, useState, useEffect } from 'react'

const AuctionContext = createContext(null)

const DEFAULT_LIVE = [
  { 
    id: 'live1', emoji: '🥽', title: 'Neural AR Glasses X2', cat: 'High-Tech Gadgets', 
    startPrice: 3200, currentBid: 4200, seller: 'TechVault99', timeLeft: 240, status: 'live',
    bids: [
      { buyer: 'AuctionKing99', amount: 4200, time: '2m ago', id: 'b1', timestamp: Date.now() - 120000 },
      { buyer: 'BidMaster_X',   amount: 3800, time: '4m ago', id: 'b2', timestamp: Date.now() - 240000 },
    ]
  },
  { 
    id: 'live2', emoji: '🎁', title: 'Titan Mystery Box Ultra', cat: 'Mystery Boxes', 
    startPrice: 900, currentBid: 1800, seller: 'SecretDrops', timeLeft: 178, status: 'live',
    bids: [
      { buyer: 'MysterySeeker', amount: 1800, time: '1m ago', id: 'b3', timestamp: Date.now() - 60000 },
    ]
  },
]

export function AuctionProvider({ children }) {
  const [liveAuctions, setLiveAuctions] = useState(DEFAULT_LIVE)
  const [endedAuctions, setEndedAuctions] = useState(() => {
    try {
      const saved = localStorage.getItem('hnp_ended_auctions')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  
  const [userBids, setUserBids] = useState(() => {
    try {
      const saved = localStorage.getItem('hnp_user_bids')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('hnp_user_bids', JSON.stringify(userBids))
  }, [userBids])

  useEffect(() => {
     localStorage.setItem('hnp_ended_auctions', JSON.stringify(endedAuctions))
  }, [endedAuctions])

  const addLiveAuction = (product) => {
    const item = {
      id: `live_${Date.now()}`,
      emoji: product.emoji || '📦',
      title: product.title,
      cat: product.category,
      startPrice: product.startPrice,
      currentBid: product.startPrice,
      seller: product.sellerName || 'Anonymous Seller',
      timeLeft: (product.duration || 5) * 60,
      status: 'live',
      bids: []
    }
    setLiveAuctions(prev => [item, ...prev])
    return item.id
  }

  const placeBidOnLive = (auctionId, amount, bidderName) => {
    const newBid = {
      id: `bid_${Date.now()}`,
      buyer: bidderName,
      amount: amount,
      time: 'Just now',
      timestamp: Date.now()
    }

    setLiveAuctions(prev =>
      prev.map(a => {
        if (a.id === auctionId) {
          return { 
            ...a, 
            currentBid: Math.max(a.currentBid, amount), 
            bids: [newBid, ...a.bids] 
          }
        }
        return a
      })
    )

    // Track for buyer history
    // We update/add the bid record for this specific user
    setUserBids(prev => {
      const existing = prev.find(b => b.auctionId === auctionId)
      if (existing) {
        // Only update if the new bid is higher than what we recorded
        return prev.map(b => b.auctionId === auctionId ? { ...b, myBid: Math.max(b.myBid, amount), status: 'Ongoing', lastUpdate: Date.now() } : b)
      }
      
      const auction = liveAuctions.find(a => a.id === auctionId)
      return [...prev, { 
        auctionId, 
        title: auction?.title || 'Unknown Asset', 
        emoji: auction?.emoji || '📦',
        myBid: amount, 
        status: 'Ongoing',
        timestamp: Date.now(),
        lastUpdate: Date.now()
      }]
    })
  }

  const endAuction = (auctionId, currentUserName) => {
    setLiveAuctions(prev => {
      const ended = prev.find(a => a.id === auctionId)
      if (ended) {
        const winnerBid = ended.bids[0] // Correct: Bids are unshift'ed, so latest/highest is [0]
        const result = { 
          ...ended, 
          status: 'ended', 
          winner: winnerBid ? winnerBid.buyer : 'No Winner',
          finalBid: ended.currentBid,
          endTime: Date.now()
        }
        setEndedAuctions(e => [result, ...e])
        
        // Update user histories
        setUserBids(history => history.map(h => {
          if (h.auctionId === auctionId) {
            // Check if the current user name matches the winner
            const isWinner = winnerBid && winnerBid.buyer === currentUserName
            return { 
              ...h, 
              status: isWinner ? 'Won 🏆' : 'Lost ❌', 
              finalBid: ended.currentBid,
              winner: winnerBid?.buyer
            }
          }
          return h
        }))
      }
      return prev.filter(a => a.id !== auctionId)
    })
  }

  return (
    <AuctionContext.Provider value={{ 
      liveAuctions, 
      endedAuctions, 
      userBids,
      addLiveAuction, 
      placeBidOnLive, 
      endAuction 
    }}>
      {children}
    </AuctionContext.Provider>
  )
}

export const useAuction = () => useContext(AuctionContext)
