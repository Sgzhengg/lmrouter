// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, RefreshCw, AlertTriangle, Target } from 'lucide-react'

interface CostData {
  totalCost: number
  budget: number
  budgetUsage: number
  costByProvider: {
    provider: string
    cost: number
    change: number
  }[]
  costByModel: {
    model: string
    cost: number
    requests: number
  }[]
}

interface DailyCost {
  date: string
  cost: number
  requests: number
}

interface CostForecast {
  month: string
  projected: number
  actual?: number
}

// 统计卡片组件
interface CostCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  bgColor: string
  valueColor?: string
}

function CostCard({ icon, label, value, bgColor, valueColor = 'text-gray-900' }: CostCardProps) {
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

export default function CostsPage() {
  const [costData, setCostData] = useState<CostData>({
    totalCost: 0,
    budget: 2000,
    budgetUsage: 0,
    costByProvider: [],
    costByModel: [],
  })
  const [dailyCosts, setDailyCosts] = useState<DailyCost[]>([])
  const [forecast, setForecast] = useState<CostForecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCostData()
  }, [])

  const loadCostData = async () => {
    try {
      // TODO: 实现 API 调用
      const mockData: CostData = {
        totalCost: 1250.5,
        budget: 2000,
        budgetUsage: 62.5,
        costByProvider: [
          { provider: 'OpenAI Official', cost: 750.3, change: 12.5 },
          { provider: 'Anthropic Official', cost: 320.15, change: -5.2 },
          { provider: 'Google Official', cost: 180.05, change: 8.3 },
        ],
        costByModel: [
          { model: 'gpt-4-turbo', cost: 450.2, requests: 1520 },
          { model: 'claude-3-opus', cost: 320.15, requests: 890 },
          { model: 'gemini-2.0-flash', cost: 180.05, requests: 2340 },
        ],
      }
      setCostData(mockData)

      const mockDailyCosts: DailyCost[] = [
        { date: '2026-03-27', cost: 145.2, requests: 1240 },
        { date: '2026-03-28', cost: 158.5, requests: 1350 },
        { date: '2026-03-29', cost: 162.8, requests: 1420 },
        { date: '2026-03-30', cost: 175.3, requests: 1510 },
        { date: '2026-03-31', cost: 180.5, requests: 1580 },
        { date: '2026-04-01', cost: 168.2, requests: 1450 },
      ]
      setDailyCosts(mockDailyCosts)

      const mockForecast: CostForecast[] = [
        { month: '2026-03', projected: 1100, actual: 990.5 },
        { month: '2026-04', projected: 1400 },
        { month: '2026-05', projected: 1600 },
        { month: '2026-06', projected: 1800 },
      ]
      setForecast(mockForecast)
    } catch (error) {
      console.error('Failed to load cost data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBudgetStatus = (usage: number) => {
    if (usage >= 90) return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, label: '预算紧张' }
    if (usage >= 70) return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Target, label: '预算警告' }
    return { color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp, label: '预算正常' }
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
          <h1 className="text-2xl font-bold text-gray-900">成本分析</h1>
          <p className="text-sm text-gray-500 mt-1">分析 API 调用成本和资源使用情况，优化预算分配。</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadCostData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
        </div>
      </div>

      {/* 成本统计卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <CostCard
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          label="总成本"
          value={`$${costData.totalCost.toFixed(2)}`}
          bgColor="bg-green-50"
          valueColor="text-green-600"
        />
        <CostCard
          icon={<CreditCard className="w-6 h-6 text-blue-600" />}
          label="本月预算"
          value={`$${costData.budget.toFixed(0)}`}
          bgColor="bg-blue-50"
        />
        <CostCard
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          label="预算使用"
          value={`${costData.budgetUsage.toFixed(0)}%`}
          bgColor="bg-purple-50"
          valueColor="text-purple-600"
        />
        <CostCard
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          label="节省成本"
          value="$150.25"
          bgColor="bg-orange-50"
          valueColor="text-orange-600"
        />
      </div>

      {/* 预算状态警告 */}
      {costData.budgetUsage > 70 && (
        <div className={`p-4 rounded-lg border ${
          costData.budgetUsage >= 90
            ? 'bg-red-50 border-red-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start">
            <AlertTriangle className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
              costData.budgetUsage >= 90 ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                costData.budgetUsage >= 90 ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {costData.budgetUsage >= 90 ? '预算紧张警告' : '预算使用提醒'}
              </p>
              <p className={`text-sm mt-1 ${
                costData.budgetUsage >= 90 ? 'text-red-700' : 'text-yellow-700'
              }`}>
                当前已使用预算的 {costData.budgetUsage.toFixed(1)}%，建议关注后续支出情况。
                {costData.budgetUsage >= 90 && ' 考虑优化路由策略或增加预算配额。'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 按供应商和模型分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 按供应商 */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">按供应商分析</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {costData.costByProvider.map((item) => (
                <div key={item.provider} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.provider}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      成本: <span className="font-semibold text-gray-900">${item.cost.toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        item.change > 0 ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {item.change > 0 ? '+' : ''}
                      {item.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 按模型 */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">按模型分析</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {costData.costByModel.map((item) => (
                <div key={item.model} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.model}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.requests} 请求 • ${item.cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${(item.cost / item.requests).toFixed(4)}/请求
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 成本趋势图表 */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">成本趋势</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">成本趋势图表</p>
              <p className="text-sm text-gray-400 mt-2">（待实现 - 使用 Recharts 绘制）</p>
            </div>
          </div>
        </div>
      </div>

      {/* 每日成本明细 */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">每日成本明细</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成本</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">请求数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均成本/请求</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyCosts.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${day.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {day.requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(day.cost / day.requests).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 成本预测 */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">成本预测</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月份</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预测成本</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实际成本</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">偏差</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forecast.map((item) => {
                const variance = item.actual
                  ? ((item.actual - item.projected) / item.projected) * 100
                  : null
                return (
                  <tr key={item.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${item.projected.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.actual ? `$${item.actual.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {variance !== null ? (
                        <span className={variance > 0 ? 'text-red-600' : 'text-green-600'}>
                          {variance > 0 ? '+' : ''}
                          {variance.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 优化建议 */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">成本优化建议</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200">
              <Target className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">使用更经济的模型</p>
                <p className="text-sm text-green-700 mt-1">
                  对于简单任务，考虑使用 gemini-2.0-flash（$0.077/请求）代替 gpt-4-turbo（$0.296/请求），
                  预计可节省 74% 的模型成本。
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">优化路由策略</p>
                <p className="text-sm text-blue-700 mt-1">
                  Anthropic 的成本下降了 5.2%，建议增加其权重。Google 的成本上升了 8.3%，
                  建议适当降低其优先级。
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Target className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-800">设置预算告警</p>
                <p className="text-sm text-purple-700 mt-1">
                  当前预算使用率为 62.5%，建议在 80% 时设置告警阈值，
                  在 90% 时自动切换到更经济的模型。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
