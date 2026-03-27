import { useState } from 'react'
import { Key, Plus, Trash2, Copy, Check } from 'lucide-react'

interface ApiKeyDisplay {
  id: string
  key: string
  name: string
  createdAt: string
  lastUsed?: string
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKeyDisplay[]>([
    {
      id: '1',
      key: 'sk-test-key-1',
      name: '默认密钥',
      createdAt: '2025-01-15T10:00:00Z',
      lastUsed: '刚刚',
    },
    {
      id: '2',
      key: 'sk-test-key-2',
      name: '测试密钥',
      createdAt: '2025-01-16T14:30:00Z',
    },
  ])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const deleteKey = (id: string) => {
    if (confirm('确定要删除此密钥吗？')) {
      setKeys(keys.filter((key) => key.id !== id))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API 密钥</h1>
          <p className="mt-2 text-gray-600">
            管理您的 LMRouter API 密钥
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>新建密钥</span>
        </button>
      </div>

      <div className="card">
        <div className="space-y-4">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Key className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{key.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                      {key.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(key.key, key.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="复制密钥"
                    >
                      {copiedId === key.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    创建于 {formatDate(key.createdAt)}
                    {key.lastUsed && ` · 最后使用于 ${key.lastUsed}`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteKey(key.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="删除密钥"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">使用说明</h4>
          <p className="text-sm text-blue-800">
            在请求头中添加 Authorization: Bearer YOUR_API_KEY 来认证您的请求。
          </p>
        </div>
      </div>
    </div>
  )
}
