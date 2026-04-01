import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // 从localStorage恢复登录状态
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 模拟API调用
      // TODO: 实现真实的API调用
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      }

      // 模拟验证（实际应该调用后端API）
      if (email && password.length >= 6) {
        setUser(mockUser)
        localStorage.setItem('user', JSON.stringify(mockUser))
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // 模拟API调用
      // TODO: 实现真实的API调用
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
      }

      // 模拟注册（实际应该调用后端API）
      if (email && password.length >= 6 && name) {
        setUser(mockUser)
        localStorage.setItem('user', JSON.stringify(mockUser))
        return true
      }

      return false
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
