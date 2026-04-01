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
  const [showCreateDialog, setShowCreateDialog] = useState(false)

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

  const createKey = (name: string) => {
    // 生成随机密钥
    const newKey = `sk-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
    const newKeyData: ApiKeyDisplay = {
      id: Date.now().toString(),
      key: newKey,
      name,
      createdAt: new Date().toISOString(),
      lastUsed: undefined,
    }
    setKeys([newKeyData, ...keys])
    setShowCreateDialog(false)
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
        <button
          onClick={() => setShowCreateDialog(true)}
          className="btn-primary flex items-center space-x-2"
        >
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

      {/* 创建密钥对话框 */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">创建 API 密钥</h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const name = formData.get('name') as string
                  createKey(name)
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      密钥名称
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例如: 生产环境密钥"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      为此密钥取一个易于识别的名称
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ 创建后请立即复制密钥，出于安全原因，您将无法再次看到完整的密钥。
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
