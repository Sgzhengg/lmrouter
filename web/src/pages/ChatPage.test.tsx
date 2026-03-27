import { useState } from 'react'
import { apiClient } from '../api/client'
import type { Message } from '../types'

export default function ChatTestPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const testChat = async () => {
    setLoading(true)
    setResult('发送中...')

    try {
      const response = await apiClient.chat({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: '你好' }],
      })

      setResult(`成功！响应：${JSON.stringify(response, null, 2)}`)
      setMessages([
        { role: 'user', content: '你好' },
        { role: 'assistant', content: response.choices[0].message.content },
      ])
    } catch (error) {
      setResult(`错误：${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>聊天 API 测试</h1>
      <button onClick={testChat} disabled={loading}>
        {loading ? '发送中...' : '测试聊天 API'}
      </button>
      <div style={{ marginTop: '20px' }}>
        <h3>状态：</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px' }}>
          {result || '等待测试...'}
        </pre>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>消息记录：</h3>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  )
}
