// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Edit, Trash2, Shuffle, Zap, Clock, Play, X, Check } from 'lucide-react'

interface RoutingRule {
  id: string
  model: string
  provider: string
  priority: number
  weight: number
  strategy: 'nitro' | 'floor' | 'balanced' | 'round-robin'
}

interface TestResult {
  success: boolean
  selectedProvider: string
  latency: number
  message: string
}

export default function RoutingPage() {
  const [rules, setRules] = useState<RoutingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState<string>('balanced')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  // 添加规则表单状态
  const [newRule, setNewRule] = useState({
    model: '',
    provider: '',
    priority: 1,
    weight: 100,
    strategy: 'balanced' as 'nitro' | 'floor' | 'balanced' | 'round-robin',
  })

  // 测试表单状态
  const [testForm, setTestForm] = useState({
    model: 'gpt-4-turbo',
    message: 'Hello, how are you?',
  })

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      setLoading(true)
      // TODO: 实现 API 调用
      const mockRules: RoutingRule[] = [
        {
          id: '1',
          model: 'gpt-4-turbo',
          provider: 'OpenAI Official',
          priority: 1,
          weight: 100,
          strategy: 'nitro',
        },
        {
          id: '2',
          model: 'claude-3-opus',
          provider: 'Anthropic Official',
          priority: 1,
          weight: 100,
          strategy: 'balanced',
        },
        {
          id: '3',
          model: 'gemini-2.0-flash',
          provider: 'Google Official',
          priority: 2,
          weight: 80,
          strategy: 'floor',
        },
      ]
      setRules(mockRules)
    } catch (error) {
      console.error('Failed to load routing rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRule = () => {
    // 模拟添加规则
    const newId = `rule-${Date.now()}`
    const rule: RoutingRule = {
      id: newId,
      model: newRule.model,
      provider: newRule.provider,
      priority: newRule.priority,
      weight: newRule.weight,
      strategy: newRule.strategy,
    }

    setRules([...rules, rule])
    setShowAddDialog(false)

    // 重置表单
    setNewRule({
      model: '',
      provider: '',
      priority: 1,
      weight: 100,
      strategy: 'balanced',
    })

    alert(`路由规则 "${newRule.model}" 已成功添加！`)
  }

  const handleStrategyClick = (strategy: string) => {
    setSelectedStrategy(strategy)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    // 模拟测试延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 模拟测试结果
    const mockResult: TestResult = {
      success: true,
      selectedProvider: rules.length > 0 ? rules[0].provider : 'OpenAI Official',
      latency: Math.floor(Math.random() * 500) + 100,
      message: '测试成功',
    }

    setTestResult(mockResult)
    setTesting(false)
  }

  const getStrategyBadge = (strategy: string) => {
    const styles: Record<string, string> = {
      nitro: 'bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
      floor: 'bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
      balanced: 'bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
      'round-robin': 'bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
    }
    return styles[strategy] || styles.balanced
  }

  const getStrategyLabel = (strategy: string) => {
    const labels: Record<string, string> = {
      nitro: '极速优先',
      floor: '最低成本',
      balanced: '均衡模式',
      'round-robin': '轮询模式',
    }
    return labels[strategy] || strategy
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
      {/* 页面标题 & 操作 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">路由策略</h1>
          <p className="text-sm text-gray-500 mt-1">配置模型路由规则和负载均衡策略，优化资源分配。</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTestDialog(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <Play className="w-4 h-4 mr-2" />
            策略测试
          </button>
          <button
            onClick={loadRules}
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
            添加规则
          </button>
        </div>
      </div>

      {/* 策略说明卡片 - 可点击 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div
          onClick={() => handleStrategyClick('nitro')}
          className={`bg-white p-6 rounded-lg shadow-md border-2 flex items-center transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
            selectedStrategy === 'nitro' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
          }`}
        >
          <div className="p-3 bg-blue-50 rounded-lg mr-4">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">极速优先</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">Nitro</p>
            {selectedStrategy === 'nitro' && (
              <div className="flex items-center mt-2 text-blue-600">
                <Check className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">已选择</span>
              </div>
            )}
          </div>
        </div>

        <div
          onClick={() => handleStrategyClick('floor')}
          className={`bg-white p-6 rounded-lg shadow-md border-2 flex items-center transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
            selectedStrategy === 'floor' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
          }`}
        >
          <div className="p-3 bg-green-50 rounded-lg mr-4">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">最低成本</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">Floor</p>
            {selectedStrategy === 'floor' && (
              <div className="flex items-center mt-2 text-green-600">
                <Check className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">已选择</span>
              </div>
            )}
          </div>
        </div>

        <div
          onClick={() => handleStrategyClick('balanced')}
          className={`bg-white p-6 rounded-lg shadow-md border-2 flex items-center transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
            selectedStrategy === 'balanced' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
          }`}
        >
          <div className="p-3 bg-purple-50 rounded-lg mr-4">
            <Shuffle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">均衡模式</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">Balanced</p>
            {selectedStrategy === 'balanced' && (
              <div className="flex items-center mt-2 text-purple-600">
                <Check className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">已选择</span>
              </div>
            )}
          </div>
        </div>

        <div
          onClick={() => handleStrategyClick('round-robin')}
          className={`bg-white p-6 rounded-lg shadow-md border-2 flex items-center transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
            selectedStrategy === 'round-robin' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
          }`}
        >
          <div className="p-3 bg-orange-50 rounded-lg mr-4">
            <Shuffle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">轮询模式</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">Round Robin</p>
            {selectedStrategy === 'round-robin' && (
              <div className="flex items-center mt-2 text-orange-600">
                <Check className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">已选择</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 路由规则表格 */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">路由规则列表</h2>
          <span className="text-xs text-gray-400">共 {rules.length} 条规则</span>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  模型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  供应商
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  策略
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  优先级
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  权重
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rule.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{rule.provider}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStrategyBadge(rule.strategy)}>
                      {getStrategyLabel(rule.strategy)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.weight}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 添加规则对话框 */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">添加路由规则</h2>
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
                    模型名称
                  </label>
                  <input
                    type="text"
                    value={newRule.model}
                    onChange={(e) => setNewRule({ ...newRule, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                    placeholder="例如: gpt-4-turbo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    供应商
                  </label>
                  <select
                    value={newRule.provider}
                    onChange={(e) => setNewRule({ ...newRule, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                  >
                    <option value="">选择供应商</option>
                    <option value="OpenAI Official">OpenAI Official</option>
                    <option value="Anthropic Official">Anthropic Official</option>
                    <option value="Google Official">Google Official</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    路由策略
                  </label>
                  <select
                    value={newRule.strategy}
                    onChange={(e) => setNewRule({ ...newRule, strategy: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                  >
                    <option value="nitro">极速优先 (Nitro)</option>
                    <option value="balanced">均衡模式 (Balanced)</option>
                    <option value="floor">最低成本 (Floor)</option>
                    <option value="round-robin">轮询模式 (Round Robin)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      优先级
                    </label>
                    <input
                      type="number"
                      value={newRule.priority}
                      onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 1 })}
                      min="0"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      权重
                    </label>
                    <input
                      type="number"
                      value={newRule.weight}
                      onChange={(e) => setNewRule({ ...newRule, weight: parseInt(e.target.value) || 100 })}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                    />
                  </div>
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
                  onClick={handleAddRule}
                  className="px-4 py-2 bg-[#0284c7] text-white rounded-lg hover:bg-[#0ea5e9]"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 策略测试对话框 */}
      {showTestDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">策略测试</h2>
                <button
                  onClick={() => {
                    setShowTestDialog(false)
                    setTestResult(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    当前策略
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-900">
                      {getStrategyLabel(selectedStrategy)} ({selectedStrategy})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    测试模型
                  </label>
                  <select
                    value={testForm.model}
                    onChange={(e) => setTestForm({ ...testForm, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                  >
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    测试消息
                  </label>
                  <textarea
                    value={testForm.message}
                    onChange={(e) => setTestForm({ ...testForm, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                    rows={3}
                    placeholder="输入测试消息..."
                  />
                </div>

                {testResult && (
                  <div className={`p-4 rounded-lg border ${
                    testResult.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {testResult.success ? (
                        <Check className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <span className={`font-medium ${
                        testResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {testResult.success ? '测试成功' : '测试失败'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>选中供应商: <span className="font-medium">{testResult.selectedProvider}</span></p>
                      <p>响应延迟: <span className="font-medium">{testResult.latency}ms</span></p>
                      <p>消息: <span className="font-medium">{testResult.message}</span></p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowTestDialog(false)
                    setTestResult(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="px-4 py-2 bg-[#0284c7] text-white rounded-lg hover:bg-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      测试中...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      开始测试
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
