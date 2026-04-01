import { useEffect, useState } from 'react'
import { modelsClient } from '../api/client'
import type { Model } from '../types'
import { Cpu, Search } from 'lucide-react'

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      // 调用后端API获取模型列表
      const data = await modelsClient.getModels()
      setModels(data.models)
    } catch (error) {
      console.error('Failed to load models:', error)
      // 如果API调用失败，设置空数组
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  const filteredModels = models.filter(model =>
    model.id.toLowerCase().includes(search.toLowerCase())
  )

  const getProviderBadge = (provider: string) => {
    const colors: Record<string, string> = {
      'mock-openai': 'bg-green-100 text-green-800',
      'mock-anthropic': 'bg-orange-100 text-orange-800',
      'mock-google': 'bg-blue-100 text-blue-800',
    }
    return colors[provider] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">模型列表</h1>
          <p className="mt-2 text-gray-600">
            共 {models.length} 个可用模型
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索模型..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredModels.map((model) => (
          <div key={model.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Cpu className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {model.id}
                </h3>
                <div className="mt-2 space-y-1">
                  {model.providers.map((provider) => (
                    <span
                      key={`${model.id}-${provider.provider}`}
                      className={`inline-block px-2 py-1 text-xs rounded-md mr-1 ${getProviderBadge(provider.provider)}`}
                    >
                      {provider.provider}
                      {provider.model && ` → ${provider.model}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <Cpu className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">没有找到匹配的模型</p>
        </div>
      )}
    </div>
  )
}
