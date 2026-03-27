import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { UsageData } from '../types'
import { TrendingUp, MessageSquare, Coins } from 'lucide-react'

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')

  // 模拟数据
  const usageData: UsageData[] = [
    { date: '01-20', requests: 145, tokens: 23450 },
    { date: '01-21', requests: 189, tokens: 31200 },
    { date: '01-22', requests: 234, tokens: 38900 },
    { date: '01-23', requests: 178, tokens: 29500 },
    { date: '01-24', requests: 267, tokens: 44500 },
    { date: '01-25', requests: 312, tokens: 52100 },
    { date: '01-26', requests: 298, tokens: 49800 },
  ]

  const modelUsageData = [
    { name: 'gpt-4-turbo', requests: 234, tokens: 45000 },
    { name: 'gpt-3.5-turbo', requests: 456, tokens: 32000 },
    { name: 'claude-3-opus', requests: 123, tokens: 28000 },
    { name: 'deepseek-chat', requests: 345, tokens: 41000 },
    { name: 'gemini-2.0-flash', requests: 234, tokens: 35000 },
  ]

  const totalRequests = usageData.reduce((sum, d) => sum + d.requests, 0)
  const totalTokens = usageData.reduce((sum, d) => sum + d.tokens, 0)

  const stats = [
    {
      label: '总请求数',
      value: totalRequests.toLocaleString(),
      change: '+12.5%',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: '总 Token 数',
      value: totalTokens.toLocaleString(),
      change: '+8.3%',
      icon: Coins,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: '平均响应时间',
      value: '1.2s',
      change: '-5.2%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">用量统计</h1>
          <p className="mt-2 text-gray-600">查看 API 调用和 Token 消耗情况</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '7d'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            近 7 天
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '30d'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            近 30 天
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      stat.change.startsWith('+')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change} 较上期
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            每日请求趋势
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="请求数"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            模型使用分布
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#0ea5e9" name="请求数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Token 消耗趋势
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="tokens" fill="#10b981" name="Token 数" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">说明</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• 所有统计数据为模拟数据，仅供展示</p>
          <p>• 实际使用中需要从后端获取真实数据</p>
          <p>• Token 消耗包含输入和输出的总和</p>
        </div>
      </div>
    </div>
  )
}
