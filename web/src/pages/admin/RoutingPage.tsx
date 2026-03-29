// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { useState } from 'react'
import type { RoutingStrategy, RoutingDecision, RoutingStrategyType } from '../../types/admin'
import {
  Zap,
  DollarSign,
  Scale,
  Play,
  Settings,
  Clock,
  Coins,
} from 'lucide-react'

export default function RoutingPage() {
  // 初始化模拟数据
  const [strategies] = useState<RoutingStrategy[]>([
    {
      type: 'nitro',
      name: 'Nitro - 速度优先',
      description: '选择 TTFT 最低的供应商',
      enabled: true,
    },
    {
      type: 'floor',
      name: 'Floor - 价格优先',
      description: '选择价格最低的供应商',
      enabled: true,
    },
    {
      type: 'balanced',
      name: 'Balanced - 综合平衡',
      description: '综合考虑价格和性能',
      enabled: true,
    },
    {
      type: 'round-robin',
      name: 'Round Robin - 轮询',
      description: '均匀分配请求',
      enabled: false,
    },
  ])
  const [selectedStrategy, setSelectedStrategy] = useState<RoutingStrategyType>('balanced')
  const [testResult, setTestResult] = useState<RoutingDecision | null>(null)
  const [testing, setTesting] = useState(false)

  const handleTestStrategy = async () => {
    setTesting(true)
    try {
      // 使用模拟的测试结果
      const mockResult: RoutingDecision = {
        strategy: selectedStrategy,
        selectedProvider: 'openai-official',
        selectedAccount: 'openai-account-1',
        decisionReason: `Selected for ${selectedStrategy} strategy`,
        estimatedCost: 0.025,
        estimatedLatency: 120,
        alternatives: [
          {
            providerId: 'azure-openai',
            accountId: 'azure-account-1',
            score: 85,
          },
          {
            providerId: 'anthropic-official',
            accountId: 'anthropic-account-1',
            score: 78,
          },
        ],
        timestamp: new Date().toISOString(),
      }
      setTestResult(mockResult)
    } catch (error) {
      console.error('测试策略失败:', error)
    } finally {
      setTesting(false)
    }
  }

  const getStrategyIcon = (type: RoutingStrategyType) => {
    switch (type) {
      case 'nitro':
        return <Zap className="w-6 h-6" />
      case 'floor':
        return <DollarSign className="w-6 h-6" />
      case 'balanced':
        return <Scale className="w-6 h-6" />
      default:
        return <Settings className="w-6 h-6" />
    }
  }

  const getStrategyColor = (type: RoutingStrategyType) => {
    switch (type) {
      case 'nitro':
        return 'text-yellow-600 bg-yellow-100'
      case 'floor':
        return 'text-green-600 bg-green-100'
      case 'balanced':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const strategyConfig: Record<RoutingStrategyType, { name: string; description: string; features: string[] }> = {
    nitro: {
      name: 'Nitro - 速度优先',
      description: '选择 TTFT（首字延迟）最低的供应商，适合实时对话场景',
      features: [
        '追求最低延迟',
        'TTFT 优化',
        '适合实时应用',
        '快速响应',
      ],
    },
    floor: {
      name: 'Floor - 价格优先',
      description: '选择价格最低的供应商，最大化成本节省',
      features: [
        '追求最低成本',
        '预算优化',
        '适合批量处理',
        '节省最多',
      ],
    },
    balanced: {
      name: 'Balanced - 综合平衡',
      description: '综合考虑价格、性能和可靠性，提供最佳平衡',
      features: [
        '综合评分',
        '性能与成本平衡',
        '推荐默认选项',
        '适应性强',
      ],
    },
    'round-robin': {
      name: 'Round Robin - 轮询',
      description: '均匀分配请求到各个供应商，实现负载均衡',
      features: [
        '负载均衡',
        '均匀分配',
        '简单有效',
        '高可用性',
      ],
    },
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">路由策略配置</h1>
          <p className="mt-2 text-gray-600">
            配置和测试智能路由策略
          </p>
        </div>
      </div>

      {/* 策略选择 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.keys(strategyConfig) as RoutingStrategyType[]).map((strategy) => (
          <div
            key={strategy}
            className={`card cursor-pointer transition-all ${
              selectedStrategy === strategy
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedStrategy(strategy)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getStrategyColor(strategy)}`}>
                {getStrategyIcon(strategy)}
              </div>
              {strategies.find((s) => s.type === strategy)?.enabled && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-xs text-gray-600">已启用</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {strategyConfig[strategy].name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {strategyConfig[strategy].description}
            </p>
            <ul className="space-y-1">
              {strategyConfig[strategy].features.map((feature, index) => (
                <li key={index} className="text-xs text-gray-500 flex items-center">
                  <Settings className="w-3 h-3 mr-1" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 策略测试 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">策略测试</h2>
          <button
            onClick={handleTestStrategy}
            disabled={testing}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4 mr-2" />
            {testing ? '测试中...' : '运行测试'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              测试模型
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              defaultValue="gpt-4-turbo"
            >
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              当前策略
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
              <span className="font-medium">{strategyConfig[selectedStrategy].name}</span>
            </div>
          </div>
        </div>

        {testResult && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">测试结果</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">预估延迟</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {testResult.estimatedLatency
                    ? `${testResult.estimatedLatency}ms`
                    : 'N/A'}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Coins className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">预估成本</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {testResult.estimatedCost
                    ? `$${testResult.estimatedCost.toFixed(6)}`
                    : 'N/A'}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Settings className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">备选方案</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {testResult.alternatives.length} 个
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                路由决策
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">选择的供应商</span>
                  <span className="text-sm font-medium text-gray-900">
                    {testResult.selectedProvider}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">选择的账号</span>
                  <span className="text-sm font-medium text-gray-900">
                    {testResult.selectedAccount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">决策原因</span>
                  <span className="text-sm font-medium text-gray-900">
                    {testResult.decisionReason}
                  </span>
                </div>
              </div>
            </div>

            {testResult.alternatives.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  备选方案
                </h4>
                <div className="space-y-2">
                  {testResult.alternatives.map((alt, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {alt.providerId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {alt.accountId}
                        </div>
                      </div>
                      {alt.score !== undefined && (
                        <div className="text-sm text-gray-600">
                          评分: {alt.score.toFixed(1)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 策略说明 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">策略说明</h2>
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Nitro（速度优先）</h3>
            <p>
              选择 TTFT（Time to First Token，首字延迟）最低的供应商。
              适合需要快速响应的场景，如实时对话、互动应用等。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Floor（价格优先）</h3>
            <p>
              选择价格最低的供应商，最大化成本节省。适合对延迟不敏感、
              主要关注成本的场景，如批量处理、离线任务等。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Balanced（综合平衡）</h3>
            <p>
              综合考虑价格、性能（TTFT、吞吐量）和可靠性（成功率、可用性），
              使用加权评分算法选择最优供应商。适合大多数使用场景。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Round Robin（轮询）</h3>
            <p>
              按顺序均匀分配请求到各个供应商，实现简单的负载均衡。
              适合所有供应商性能相近的场景。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
