import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ModelsPage from './pages/ModelsPage'
import ChatPage from './pages/ChatPage'
import KeysPage from './pages/KeysPage'
import StatsPage from './pages/StatsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<ChatPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/models" element={<ModelsPage />} />
                <Route path="/keys" element={<KeysPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/usage" element={<StatsPage />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
