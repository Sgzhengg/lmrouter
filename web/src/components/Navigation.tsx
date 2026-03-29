import { Link, useLocation } from 'react-router-dom'
import { MessageSquare, Cpu, Key, BarChart3, Settings, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  {path: '/chat', label: '聊天测试', icon: MessageSquare },
  { path: '/models', label: '模型列表', icon: Cpu },
  { path: '/keys', label: 'API 密钥', icon: Key },
  { path: '/stats', label: '用量统计', icon: BarChart3 },
]

const adminNavItems = [
  {path: '/admin/providers', label: '供应商管理'},
  {path: '/admin/routing', label: '路由策略'},
  {path: '/admin/performance', label: '性能监控'},
  {path: '/admin/costs', label: '成本分析'},
]

export default function Navigation() {
  const location = useLocation()
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Cpu className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">LMRouter</span>
          </Link>
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path ||
                              (item.path === '/chat' && location.pathname === '/')
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* 管理菜单 */}
            <div className="relative">
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isAdminRoute
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>管理</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {adminMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setAdminMenuOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
