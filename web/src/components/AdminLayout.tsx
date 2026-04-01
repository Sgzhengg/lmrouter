import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cpu, Settings, BarChart3, DollarSign, Activity, ChevronLeft } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

const adminNavItems = [
  { path: '/admin/providers', label: '供应商管理', icon: Settings },
  { path: '/admin/routing', label: '路由策略', icon: Activity },
  { path: '/admin/performance', label: '性能监控', icon: BarChart3 },
  { path: '/admin/costs', label: '成本分析', icon: DollarSign },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 管理后台顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：Logo和返回按钮 */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">返回前台</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Link to="/admin/providers" className="flex items-center space-x-2">
                <Cpu className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">LMRouter 管理后台</span>
              </Link>
            </div>

            {/* 中间：管理导航菜单 */}
            <div className="flex items-center space-x-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
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
            </div>

            {/* 右侧：用户信息（可扩展） */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">管理员</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
