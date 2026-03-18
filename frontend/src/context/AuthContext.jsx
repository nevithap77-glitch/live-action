import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hnp_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const login = (username, role = 'buyer') => {
    const newUser = {
      username,
      role,                                          // 'buyer' | 'seller'
      name: username.split('@')[0] || 'Member',
      avatar: role === 'seller' ? '🏪' : '⚡',
      joinedAt: new Date().toISOString(),
    }
    setUser(newUser)
    localStorage.setItem('hnp_user', JSON.stringify(newUser))
    return newUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hnp_user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isBuyer:  user?.role === 'buyer',
      isSeller: user?.role === 'seller',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
