import React, { createContext, useContext, useState } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])   // array of product objects

  const toggle = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id)
      return exists ? prev.filter(p => p.id !== product.id) : [...prev, product]
    })
  }

  const remove = (id) => setWishlist(prev => prev.filter(p => p.id !== id))

  const isInWishlist = (id) => wishlist.some(p => p.id === id)

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, remove, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
