import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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
      <Layout>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat-test" element={<ChatTestPage />} />
          <Route path="/keys" element={<KeysPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/admin/providers" element={<ProvidersPage />} />
          <Route path="/admin/routing" element={<RoutingPage />} />
          <Route path="/admin/performance" element={<PerformancePage />} />
          <Route path="/admin/costs" element={<CostsPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
