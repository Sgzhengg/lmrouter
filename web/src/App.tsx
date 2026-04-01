import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import ModelsPage from './pages/ModelsPage'
import ChatPage from './pages/ChatPage'
import ChatTestPage from './pages/ChatPage.test'
import KeysPage from './pages/KeysPage'
import StatsPage from './pages/StatsPage'
import ProvidersPage from './pages/admin/ProvidersPage'
import RoutingPage from './pages/admin/RoutingPage'
import PerformancePage from './pages/admin/PerformancePage'
import CostsPage from './pages/admin/CostsPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* 前台页面使用普通Layout */}
        <Route path="/" element={<Layout><ChatPage /></Layout>} />
        <Route path="/models" element={<Layout><ModelsPage /></Layout>} />
        <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
        <Route path="/chat-test" element={<Layout><ChatTestPage /></Layout>} />
        <Route path="/keys" element={<Layout><KeysPage /></Layout>} />
        <Route path="/stats" element={<Layout><StatsPage /></Layout>} />

        {/* 管理后台页面使用AdminLayout */}
        <Route path="/admin" element={<Navigate to="/admin/providers" replace />} />
        <Route path="/admin/providers" element={<AdminLayout><ProvidersPage /></AdminLayout>} />
        <Route path="/admin/routing" element={<AdminLayout><RoutingPage /></AdminLayout>} />
        <Route path="/admin/performance" element={<AdminLayout><PerformancePage /></AdminLayout>} />
        <Route path="/admin/costs" element={<AdminLayout><CostsPage /></AdminLayout>} />
      </Routes>
    </Router>
  )
}

export default App
