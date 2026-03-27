import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ModelsPage from './pages/ModelsPage'
import ChatPage from './pages/ChatPage'
import ChatTestPage from './pages/ChatPage.test'
import KeysPage from './pages/KeysPage'
import StatsPage from './pages/StatsPage'

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
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
