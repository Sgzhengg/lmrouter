// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { useState } from 'react'
import type { CostComparison, CostSavings } from '../../types/admin'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { DollarSign, TrendingDown, PieChart as PieChartIcon, Wallet } from 'lucide-react'

export default function CostsPage() {
  // 直接初始化模拟数据
  const [comparisons] = useState<CostComparison[]>([
    {
      providerId: 'openai-official',
      accountId: 'openai-account-1',
      modelName: 'gpt-4-turbo',
      totalCost: 125.50,
      totalTokens: 6275000,
      avgCostPer1kTokens: 0.0200,
      requests: 4234,
    },
    {
      providerId: 'azure-openai',
      accountId: 'azure-account-1',
      modelName: 'gpt-4-turbo',
      totalCost: 98.20,
      totalTokens: 5456000,
      avgCostPer1kTokens: 0.0180,
      requests: 3689,
    },
    {
      providerId: 'anthropic-official',
      accountId: 'anthropic-account-1',
      modelName: 'claude-3-opus',
      totalCost: 156.80,
      totalTokens: 2090000,
      avgCostPer1kTokens: 0.0750,
      requests: 1823,
    },
    {
      providerId: 'google-official',
      accountId: 'google-account-1',
      modelName: 'gemini-2.0-flash',
      totalCost: 45.30,
      totalTokens: 3775000,
      avgCostPer1kTokens: 0.0120,
      requests: 2987,
    },
    {
      providerId: 'cohere-official',
      accountId: 'cohere-account-1',
      modelName: 'command-r-plus',
      totalCost: 67.90,
      totalTokens: 4526000,
      avgCostPer1kTokens: 0.0150,
      requests: 2145,
    },
  ])
  const [savings] = useState<CostSavings>({
    originalCost: 493.70,
    optimizedCost: 380.20,
    saved: 113.50,
    savedPercentage: 23.0,
  })
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')

  // 模拟成本趋势数据
  const costTrendData = Array.from({ length: 7 }, (_, i) => ({
    date: `${i + 1}日`,
    original: Math.random() * 100 + 50,
    optimized: Math.random() * 80 + 40,
    saved: Math.random() * 20 + 10,
  }))

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const totalCost = comparisons.reduce((sum, c) => sum + c.totalCost, 0)
  const totalTokens = comparisons.reduce((sum, c) => sum + c.totalTokens, 0)

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">成本分析</h1>
          <p className="mt-2 text-gray-600">
            分析和优化API调用成本
          </p>
        </div>
        <div className="flex space-x-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === '24h' ? '24小时' : range === '7d' ? '7天' : '30天'}
            </button>
          ))}
        </div>
      </div>

      {/* 成本概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总成本</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${totalCost.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总Tokens</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {(totalTokens / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Wallet className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">节省金额</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {savings ? `$${savings.saved.toFixed(2)}` : '$0.00'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingDown className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">节省比例</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {savings ? `${savings.savedPercentage.toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <PieChartIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 成本趋势 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">成本趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={costTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="original"
              stroke="#ef4444"
              strokeWidth={2}
              name="原始成本"
            />
            <Line
              type="monotone"
              dataKey="optimized"
              stroke="#10b981"
              strokeWidth={2}
              name="优化后成本"
            />
            <Line
              type="monotone"
              dataKey="saved"
              stroke="#0ea5e9"
              strokeWidth={2}
              name="节省"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 供应商成本对比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            供应商成本对比
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisons.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="providerId" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalCost" fill="#0ea5e9" name="总成本 ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            成本分布（按供应商）
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={comparisons}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.providerId}: ${entry.totalCost.toFixed(2)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalCost"
              >
                {comparisons.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 详细成本对比 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">详细成本对比</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  供应商
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  账号
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  请求数
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总成本
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  平均成本/1K Tokens
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comparisons.map((comparison) => (
                <tr key={`${comparison.providerId}-${comparison.accountId}`}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {comparison.providerId}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {comparison.accountId}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {comparison.requests.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {comparison.totalTokens.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${comparison.totalCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${comparison.avgCostPer1kTokens.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {comparisons.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无成本数据</p>
          </div>
        )}
      </div>

      {/* 成本优化建议 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">成本优化建议</h3>
        <div className="space-y-4">
          <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
            <TrendingDown className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">使用Floor策略节省成本</h4>
              <p className="text-sm text-gray-600 mt-1">
                对于对延迟不敏感的批量处理任务，使用Floor策略可以节省最多95%的成本。
              </p>
            </div>
          </div>

          <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">合理选择模型</h4>
              <p className="text-sm text-gray-600 mt-1">
                简单问答场景使用GPT-3.5 Turbo可以节省95%的成本，同时保持良好的响应质量。
              </p>
            </div>
          </div>

          <div className="flex items-start p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <DollarSign className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">监控成本趋势</h4>
              <p className="text-sm text-gray-600 mt-1">
                定期查看成本分析报告，及时发现异常成本增长并优化使用策略。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
