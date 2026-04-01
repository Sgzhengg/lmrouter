import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Shuffle, Activity, DollarSign, Cpu } from 'lucide-react'
import ProvidersPage from './pages/ProvidersPage'
import RoutingPage from './pages/RoutingPage'
import PerformancePage from './pages/PerformancePage'
import CostsPage from './pages/CostsPage'

// 管理后台导航配置
const adminNavItems = [
  { path: '/providers', label: '供应商管理', icon: LayoutGrid },
  { path: '/routing', label: '路由策略', icon: Shuffle },
  { path: '/performance', label: '性能监控', icon: Activity },
  { path: '/costs', label: '成本分析', icon: DollarSign },
]

// 管理后台布局组件
function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen w-full bg-[#f9fafb]">
      {/* 顶部导航栏 */}
      <nav className="w-full h-16 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：Logo */}
            <div className="flex items-center">
              <Link to="/providers" className="flex items-center space-x-3">
                <div className="p-2 bg-[#0284c7] rounded-lg">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">LMRouter 管理后台</span>
              </Link>
            </div>

            {/* 右侧：导航菜单 */}
            <div className="hidden md:flex items-center space-x-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-[#0284c7] text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/providers" replace />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/routing" element={<RoutingPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/costs" element={<CostsPage />} />
        </Routes>
      </AdminLayout>
    </Router>
  )
}

export default App
