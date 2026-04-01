import { useState, useRef, useEffect } from 'react'
import { apiClient, modelsClient } from '../api/client'
import type { Message, Model } from '../types'
import { Send, Bot, User, Loader2 } from 'lucide-react'

export default function ChatPage() {
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingModels, setLoadingModels] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadModels()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadModels = async () => {
    try {
      const data = await modelsClient.getModels()
      setModels(data.models)
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      setLoadingModels(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await apiClient.chat({
        model: selectedModel,
        messages: newMessages,
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.choices[0].message.content,
      }

      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '抱歉，发生了错误。请稍后重试。' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">聊天测试</h1>
        <p className="mt-2 text-gray-600">与 LMRouter 集成的模型进行对话测试</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择模型
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={loadingModels}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {loadingModels ? (
                <option>加载中...</option>
              ) : models && models.length > 0 ? (
                models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.id}
                  </option>
                ))
              ) : (
                <option>无可用模型</option>
              )}
            </select>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                当前模型提供商
              </h3>
              {models?.find((m) => m.id === selectedModel)
                ?.providers.map((provider) => (
                  <div
                    key={provider.provider}
                    className="text-sm text-gray-600 py-1"
                  >
                    <span className="font-medium">{provider.provider}</span>
                    {provider.model && (
                      <span className="text-gray-500">
                        {' '}
                        → {provider.model}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      开始与 AI 对话，输入消息并点击发送
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        message.role === 'user'
                          ? 'bg-primary-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Bot className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-gray-100">
                    <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <p className="text-gray-500">AI 正在思考...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入消息..."
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>发送</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
