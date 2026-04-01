// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { useEffect, useState } from 'react'
import { Activity, TrendingUp, Clock, CheckCircle2, RefreshCw, AlertCircle, Zap } from 'lucide-react'

interface PerformanceMetrics {
  totalRequests: number
  successRate: number
  avgLatency: number
  requestsPerMinute: number
}

interface ProviderPerformance {
  provider: string
  requests: number
  successRate: number
  avgLatency: number
  avgTtft: number
  throughput: number
  status: 'excellent' | 'good' | 'warning' | 'error'
}

interface ModelPerformance {
  model: string
  requests: number
  avgLatency: number
  p95Latency: number
  p99Latency: number
  successRate: number
}

// 统计卡片组件
interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  bgColor: string
  valueColor?: string
}

function MetricCard({ icon, label, value, bgColor, valueColor = 'text-gray-900' }: MetricCardProps) {
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

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalRequests: 0,
    successRate: 0,
    avgLatency: 0,
    requestsPerMinute: 0,
  })
  const [providerPerformance, setProviderPerformance] = useState<ProviderPerformance[]>([])
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 5000) // 每5秒刷新
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      // TODO: 实现 API 调用
      const mockMetrics: PerformanceMetrics = {
        totalRequests: 15234,
        successRate: 98.5,
        avgLatency: 1250,
        requestsPerMinute: 45,
      }
      setMetrics(mockMetrics)

      const mockProviderPerformance: ProviderPerformance[] = [
        {
          provider: 'OpenAI Official',
          requests: 5420,
          successRate: 99.2,
          avgLatency: 1150,
          avgTtft: 120,
          throughput: 85,
          status: 'excellent',
        },
        {
          provider: 'Azure OpenAI',
          requests: 3890,
          successRate: 98.8,
          avgLatency: 1320,
          avgTtft: 150,
          throughput: 72,
          status: 'good',
        },
        {
          provider: 'Anthropic Official',
          requests: 3124,
          successRate: 97.5,
          avgLatency: 1450,
          avgTtft: 180,
          throughput: 68,
          status: 'good',
        },
        {
          provider: 'Google Gemini',
          requests: 2800,
          successRate: 96.8,
          avgLatency: 1680,
          avgTtft: 210,
          throughput: 58,
          status: 'warning',
        },
      ]
      setProviderPerformance(mockProviderPerformance)

      const mockModelPerformance: ModelPerformance[] = [
        {
          model: 'gpt-4-turbo',
          requests: 6240,
          avgLatency: 1180,
          p95Latency: 1520,
          p99Latency: 1890,
          successRate: 99.1,
        },
        {
          model: 'claude-3-opus',
          requests: 4120,
          avgLatency: 1380,
          p95Latency: 1780,
          p99Latency: 2150,
          successRate: 98.2,
        },
        {
          model: 'gemini-2.0-flash',
          requests: 4874,
          avgLatency: 1250,
          p95Latency: 1650,
          p99Latency: 2100,
          successRate: 97.8,
        },
      ]
      setModelPerformance(mockModelPerformance)
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      excellent: 'bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
      good: 'bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
      warning: 'bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
      error: 'bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-medium',
    }
    return styles[status] || styles.good
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      excellent: '优秀',
      good: '良好',
      warning: '警告',
      error: '错误',
    }
    return labels[status] || status
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
          <h1 className="text-2xl font-bold text-gray-900">性能监控</h1>
          <p className="text-sm text-gray-500 mt-1">实时监控系统性能指标，确保服务稳定运行。</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadMetrics}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
        </div>
      </div>

      {/* 性能指标卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          icon={<Activity className="w-6 h-6 text-blue-600" />}
          label="总请求数"
          value={metrics.totalRequests.toLocaleString()}
          bgColor="bg-blue-50"
        />
        <MetricCard
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
          label="成功率"
          value={`${metrics.successRate}%`}
          bgColor="bg-green-50"
          valueColor="text-green-600"
        />
        <MetricCard
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          label="平均延迟"
          value={`${metrics.avgLatency}ms`}
          bgColor="bg-yellow-50"
          valueColor="text-yellow-600"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          label="每分钟请求"
          value={metrics.requestsPerMinute}
          bgColor="bg-purple-50"
          valueColor="text-purple-600"
        />
      </div>

      {/* 性能趋势图表 */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">性能趋势</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">实时监控图表</p>
              <p className="text-sm text-gray-400 mt-2">（待实现 - 使用 Recharts 绘制）</p>
            </div>
          </div>
        </div>
      </div>

      {/* 供应商性能对比表格 */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">供应商性能对比</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">供应商</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">请求数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成功率</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均延迟</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TTFT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">吞吐量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {providerPerformance.map((provider) => (
                <tr key={provider.provider} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{provider.provider}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {provider.requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {provider.successRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {provider.avgLatency}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {provider.avgTtft}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {provider.throughput}/min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(provider.status)}>
                      {getStatusLabel(provider.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模型性能分析 */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">模型性能分析</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">模型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">请求数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均延迟</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P95 延迟</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P99 延迟</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成功率</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modelPerformance.map((model) => (
                <tr key={model.model} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{model.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.avgLatency}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.p95Latency}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.p99Latency}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.successRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 性能警告 */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">性能警告</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Google Gemini 延迟较高</p>
                <p className="text-sm text-yellow-700 mt-1">
                  平均延迟达到 1680ms，建议检查网络连接或考虑降低该供应商的优先级。
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">OpenAI Official 性能优异</p>
                <p className="text-sm text-blue-700 mt-1">
                  成功率 99.2%，平均延迟 1150ms，建议保持当前优先级设置。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
