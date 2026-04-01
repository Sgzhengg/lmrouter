// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { useEffect, useState } from 'react'
import type { Provider, ProviderAccount } from '../types/admin'
import {
  Plus,
  RefreshCw,
  CheckCircle2,
  Settings,
  Activity,
  Users,
  X,
} from 'lucide-react'

// 统计卡片组件
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  bgColor: string
  valueColor?: string
}

function StatCard({ icon, label, value, bgColor, valueColor = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className={`p-3 rounded-lg ${bgColor} mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  )
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [accounts, setAccounts] = useState<ProviderAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false)

  // 添加供应商表单状态
  const [newProvider, setNewProvider] = useState({
    name: '',
    type: 'openai' as 'openai' | 'anthropic' | 'google' | 'cohere',
    baseUrl: '',
    priority: 50,
  })

  // 添加账号表单状态
  const [newAccount, setNewAccount] = useState({
    accountName: '',
    apiKey: '',
    priority: 1,
    weight: 100,
  })

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = () => {
    setLoading(true)

    // 直接使用模拟数据
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
      {
        id: 'google-gemini',
        name: 'Google Gemini',
        type: 'google',
        baseUrl: 'https://generativelanguage.googleapis.com/v1',
        status: 'active',
        enabled: true,
        priority: 4,
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

    setLoading(false)
  }

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider)
  }

  const handleAddProvider = () => {
    // 模拟添加供应商
    const provider: Provider = {
      id: `provider-${Date.now()}`,
      name: newProvider.name,
      type: newProvider.type,
      baseUrl: newProvider.baseUrl,
      status: 'active',
      enabled: true,
      priority: newProvider.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setProviders([...providers, provider])
    setShowAddDialog(false)

    // 重置表单
    setNewProvider({
      name: '',
      type: 'openai',
      baseUrl: '',
      priority: 50,
    })

    alert(`供应商 "${newProvider.name}" 已成功添加！`)
  }

  const handleAddAccount = () => {
    if (!selectedProvider) {
      alert('请先选择一个供应商')
      return
    }

    // 模拟添加账号
    const account: ProviderAccount = {
      id: `account-${Date.now()}`,
      providerId: selectedProvider.id,
      accountName: newAccount.accountName,
      apiKey: newAccount.apiKey,
      status: 'active',
      enabled: true,
      priority: newAccount.priority,
      weight: newAccount.weight,
      metrics: {
        avgTtftMs: 0,
        avgThroughput: 0,
        successRate: 100,
        rpmUsed: 0,
        rpmLimit: 100,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setAccounts([...accounts, account])
    setShowAddAccountDialog(false)

    // 重置表单
    setNewAccount({
      accountName: '',
      apiKey: '',
      priority: 1,
      weight: 100,
    })

    alert(`账号 "${newAccount.accountName}" 已成功添加到 ${selectedProvider.name}！`)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
      inactive: 'bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
      error: 'bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
    }
    return styles[status] || styles.inactive
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

  return (
    <div className="space-y-8">
      {/* 页面标题 & 操作按钮 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">供应商管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理 AI 模型供应商和账号池，优化资源分配。</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadProviders}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-[#0284c7] hover:bg-[#0ea5e9] transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加供应商
          </button>
        </div>
      </div>

      {/* 统计卡片区域 - 使用 Grid 布局 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={<Settings className="w-6 h-6 text-blue-600" />}
          label="总供应商数"
          value={providers.length}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
          label="活跃供应商"
          value={providers.filter((p) => p.status === 'active').length}
          bgColor="bg-green-50"
          valueColor="text-green-600"
        />
        <StatCard
          icon={<Activity className="w-6 h-6 text-sky-600" />}
          label="已启用服务"
          value={providers.filter((p) => p.enabled).length}
          bgColor="bg-sky-50"
          valueColor="text-sky-600"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-purple-600" />}
          label="总账号数量"
          value={accounts.length}
          bgColor="bg-purple-50"
          valueColor="text-purple-600"
        />
      </div>

      {/* 供应商列表卡片 */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">供应商列表</h2>
          <span className="text-xs text-gray-400">共 {providers.length} 个供应商</span>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称/类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">优先级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">账号数</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {providers.map((provider) => (
                <tr
                  key={provider.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedProvider?.id === provider.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectProvider(provider)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                      <div className="text-sm text-gray-500 ml-2">• {getProviderTypeLabel(provider.type)}</div>
                    </div>
                    <div className="text-sm text-gray-500">{provider.baseUrl}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {provider.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {accounts.filter((a) => a.providerId === provider.id).length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      编辑
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 账号详情表格（点击供应商后展开） */}
      {selectedProvider && (
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedProvider.name} - 账号列表
            </h2>
            <button
              onClick={() => setShowAddAccountDialog(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-[#0284c7] hover:bg-[#0ea5e9] transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加账号
            </button>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">账号名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">优先级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">权重</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成功率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均 TTFT</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts
                  .filter((a) => a.providerId === selectedProvider.id)
                  .map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{account.accountName}</div>
                        <div className="text-sm text-gray-500 font-mono">
                          {account.apiKey.replace(/.(?=.{4})/g, '*')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(account.status)}>{account.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.weight}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.metrics?.successRate ? `${account.metrics.successRate.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.metrics?.avgTtftMs ? `${account.metrics.avgTtftMs.toFixed(0)}ms` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          编辑
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {accounts.filter((a) => a.providerId === selectedProvider.id).length === 0 && (
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">添加供应商</h2>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    供应商名称
                  </label>
                  <input
                    type="text"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                    placeholder="例如: OpenAI Official"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型
                  </label>
                  <select
                    value={newProvider.type}
                    onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
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
                    value={newProvider.baseUrl}
                    onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    优先级
                  </label>
                  <input
                    type="number"
                    value={newProvider.priority}
                    onChange={(e) => setNewProvider({ ...newProvider, priority: parseInt(e.target.value) || 50 })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddProvider}
                  className="px-4 py-2 bg-[#0284c7] text-white rounded-lg hover:bg-[#0ea5e9]"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加账号对话框 */}
      {showAddAccountDialog && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">添加账号</h2>
                <button
                  onClick={() => setShowAddAccountDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  为 <span className="font-semibold">{selectedProvider.name}</span> 添加新账号
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    账号名称
                  </label>
                  <input
                    type="text"
                    value={newAccount.accountName}
                    onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                    placeholder="例如: OpenAI Account 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API 密钥
                  </label>
                  <input
                    type="password"
                    value={newAccount.apiKey}
                    onChange={(e) => setNewAccount({ ...newAccount, apiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                    placeholder="sk-..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      优先级
                    </label>
                    <input
                      type="number"
                      value={newAccount.priority}
                      onChange={(e) => setNewAccount({ ...newAccount, priority: parseInt(e.target.value) || 1 })}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      权重
                    </label>
                    <input
                      type="number"
                      value={newAccount.weight}
                      onChange={(e) => setNewAccount({ ...newAccount, weight: parseInt(e.target.value) || 100 })}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddAccountDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddAccount}
                  className="px-4 py-2 bg-[#0284c7] text-white rounded-lg hover:bg-[#0ea5e9]"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
