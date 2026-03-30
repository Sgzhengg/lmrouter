// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { useEffect, useState } from 'react'
import { providersApi } from '../../api/admin'
import type { Provider, ProviderAccount } from '../../types/admin'
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [accounts, setAccounts] = useState<ProviderAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false)

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await providersApi.getProviders()
      setProviders(data.providers)
    } catch (err: any) {
      console.error('加载供应商列表失败:', err)
      // 使用模拟数据进行演示
      const mockProviders: Provider[] = [
        {
          id: 'openai-official',
          name: 'OpenAI Official',
          type: 'openai',
          baseUrl: 'https://api.openai.com/v1',
          status: 'active',
          enabled: true,
          priority: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'azure-openai',
          name: 'Azure OpenAI',
          type: 'openai',
          baseUrl: 'https://azure.openai.com/v1',
          status: 'active',
          enabled: true,
          priority: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'anthropic-official',
          name: 'Anthropic Official',
          type: 'anthropic',
          baseUrl: 'https://api.anthropic.com/v1',
          status: 'active',
          enabled: true,
          priority: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setProviders(mockProviders)

      // 模拟账号数据
      const mockAccounts: ProviderAccount[] = [
        {
          id: 'openai-account-1',
          providerId: 'openai-official',
          accountName: 'OpenAI Account 1',
          apiKey: 'sk-*********************',
          status: 'active',
          enabled: true,
          priority: 1,
          weight: 100,
          metrics: {
            avgTtftMs: 120,
            avgThroughput: 80,
            successRate: 99.5,
            rpmUsed: 45,
            rpmLimit: 100,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'azure-account-1',
          providerId: 'azure-openai',
          accountName: 'Azure Account 1',
          apiKey: 'sk-*********************',
          status: 'active',
          enabled: true,
          priority: 1,
          weight: 90,
          metrics: {
            avgTtftMs: 150,
            avgThroughput: 70,
            successRate: 99.0,
            rpmUsed: 30,
            rpmLimit: 100,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'anthropic-account-1',
          providerId: 'anthropic-official',
          accountName: 'Anthropic Account 1',
          apiKey: 'sk-ant-*******************',
          status: 'active',
          enabled: true,
          priority: 1,
          weight: 95,
          metrics: {
            avgTtftMs: 180,
            avgThroughput: 75,
            successRate: 98.5,
            rpmUsed: 25,
            rpmLimit: 50,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setAccounts(mockAccounts)

      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const loadAccounts = async (providerId: string) => {
    try {
      const data = await providersApi.getProviderAccounts(providerId)
      setAccounts(data.accounts)
    } catch (err: any) {
      console.error('加载账号失败:', err)
    }
  }

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider)
    loadAccounts(provider.id)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'inactive':
        return <XCircle className="w-5 h-5 text-gray-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      banned: 'bg-red-100 text-red-800',
      rate_limited: 'bg-yellow-100 text-yellow-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getProviderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google',
      cohere: 'Cohere',
      other: '其他',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">供应商管理</h1>
          <p className="mt-2 text-gray-600">
            管理AI模型供应商和账号池
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadProviders}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加供应商
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总供应商数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{providers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">活跃供应商</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {providers.filter((p) => p.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">已启用</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {providers.filter((p) => p.enabled).length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总账号数</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {accounts.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 供应商列表 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">供应商列表</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名称
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  优先级
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  账号数量
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {providers.map((provider) => (
                <tr
                  key={provider.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedProvider?.id === provider.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectProvider(provider)}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(provider.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {provider.name}
                        </div>
                        <div className="text-xs text-gray-500">{provider.baseUrl}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800">
                      {getProviderTypeLabel(provider.type)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-md ${getStatusBadge(
                        provider.status
                      )}`}
                    >
                      {provider.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {provider.priority}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {accounts.filter((a) => a.providerId === provider.id).length}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: 实现编辑功能
                      }}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: 实现删除功能
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 账号列表详情 */}
      {selectedProvider && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedProvider.name} - 账号列表
            </h2>
            <button
              onClick={() => setShowAddAccountDialog(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加账号
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    账号名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    优先级
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    权重
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    成功率
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平均TTFT
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts
                  .filter((a) => a.providerId === selectedProvider.id)
                  .map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {account.accountName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.apiKey.replace(/.(?=.{4})/g, '*')}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-md ${getStatusBadge(
                            account.status
                          )}`}
                        >
                          {account.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {account.priority}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {account.weight}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {account.metrics?.successRate
                          ? `${account.metrics.successRate.toFixed(1)}%`
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {account.metrics?.avgTtftMs
                          ? `${account.metrics.avgTtftMs.toFixed(0)}ms`
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            // TODO: 实现编辑功能
                          }}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // TODO: 实现删除功能
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {accounts.filter((a) => a.providerId === selectedProvider.id).length ===
            0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">该供应商暂无账号</p>
            </div>
          )}
        </div>
      )}

      {/* 添加供应商对话框 */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">添加供应商</h2>

              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const data = {
                  name: formData.get('name') as string,
                  type: formData.get('type') as "openai" | "anthropic" | "google" | "cohere",
                  baseUrl: formData.get('baseUrl') as string,
                  priority: parseInt(formData.get('priority') as string) || 50,
                }

                try {
                  await providersApi.createProvider(data)
                  setShowAddDialog(false)
                  loadProviders()
                } catch (err: any) {
                  console.error('创建供应商失败:', err)
                  alert('创建失败: ' + (err.message || '未知错误'))
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      供应商名称
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例如: OpenAI 官方"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      类型
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
                      <option value="cohere">Cohere</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API 地址
                    </label>
                    <input
                      type="url"
                      name="baseUrl"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://api.openai.com/v1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      优先级
                    </label>
                    <input
                      type="number"
                      name="priority"
                      defaultValue="50"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    添加
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 添加账号对话框 */}
      {showAddAccountDialog && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                添加账号 - {selectedProvider.name}
              </h2>

              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const data = {
                  accountName: formData.get('accountName') as string,
                  apiKey: formData.get('apiKey') as string,
                  rpmLimit: parseInt(formData.get('rpmLimit') as string) || 10000,
                  tpmLimit: parseInt(formData.get('tpmLimit') as string) || 200000,
                  weight: parseInt(formData.get('weight') as string) || 100,
                  priority: parseInt(formData.get('priority') as string) || 0,
                }

                try {
                  await providersApi.createAccount(selectedProvider.id, data)
                  setShowAddAccountDialog(false)
                  loadAccounts(selectedProvider.id)
                } catch (err: any) {
                  console.error('创建账号失败:', err)
                  alert('创建失败: ' + (err.message || '未知错误'))
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      账号名称
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例如: Account 1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      name="apiKey"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="sk-..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RPM 限制
                      </label>
                      <input
                        type="number"
                        name="rpmLimit"
                        defaultValue="10000"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TPM 限制
                      </label>
                      <input
                        type="number"
                        name="tpmLimit"
                        defaultValue="200000"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        权重
                      </label>
                      <input
                        type="number"
                        name="weight"
                        defaultValue="100"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        优先级
                      </label>
                      <input
                        type="number"
                        name="priority"
                        defaultValue="0"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddAccountDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    添加
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
