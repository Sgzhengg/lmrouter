// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { useState } from 'react'
import type { ProviderPerformanceStats } from '../../types/admin'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Activity, Clock, Zap, CheckCircle, AlertCircle } from 'lucide-react'

export default function PerformancePage() {
  // 直接初始化模拟数据
  const [stats] = useState<ProviderPerformanceStats[]>([
    {
      providerId: 'openai-official',
      accountId: 'openai-account-1',
      avgTtftMs: 120,
      avgThroughput: 80,
      avgLatencyMs: 1000,
      successRate: 99.5,
      totalRequests: 15234,
      errorRate: 0.5,
      uptime: 99.9,
      avgCostPer1kTokens: 0.02,
      totalCost: 304.68,
    },
    {
      providerId: 'azure-openai',
      accountId: 'azure-account-1',
      avgTtftMs: 150,
      avgThroughput: 70,
      avgLatencyMs: 1200,
      successRate: 99.0,
      totalRequests: 8956,
      errorRate: 1.0,
      uptime: 99.5,
      avgCostPer1kTokens: 0.018,
      totalCost: 161.21,
    },
    {
      providerId: 'anthropic-official',
      accountId: 'anthropic-account-1',
      avgTtftMs: 180,
      avgThroughput: 75,
      avgLatencyMs: 1500,
      successRate: 98.5,
      totalRequests: 5621,
      errorRate: 1.5,
      uptime: 98.8,
      avgCostPer1kTokens: 0.025,
      totalCost: 140.53,
    },
    {
      providerId: 'cohere-official',
      accountId: 'cohere-account-1',
      avgTtftMs: 200,
      avgThroughput: 60,
      avgLatencyMs: 1800,
      successRate: 97.0,
      totalRequests: 3245,
      errorRate: 3.0,
      uptime: 97.5,
      avgCostPer1kTokens: 0.015,
      totalCost: 48.68,
    },
    {
      providerId: 'google-official',
      accountId: 'google-account-1',
      avgTtftMs: 90,
      avgThroughput: 85,
      avgLatencyMs: 900,
      successRate: 98.0,
      totalRequests: 7892,
      errorRate: 2.0,
      uptime: 98.2,
      avgCostPer1kTokens: 0.012,
      totalCost: 94.70,
    },
  ])
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')

  // 模拟实时数据
  const realTimeData = Array.from({ length: 20 }, (_, i) => ({
    time: `${i}s`,
    ttft: Math.random() * 200 + 100,
    throughput: Math.random() * 50 + 50,
  }))

  const topProviders = [...(stats || [])]
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 5)

  const avgSuccessRate =
    stats.length > 0
      ? stats.reduce((sum, s) => sum + s.successRate, 0) / stats.length
      : 0

  const avgTtft =
    stats.length > 0
      ? stats.reduce((sum, s) => sum + s.avgTtftMs, 0) / stats.length
      : 0

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">性能监控</h1>
          <p className="mt-2 text-gray-600">
            实时监控供应商性能指标
          </p>
        </div>
        <div className="flex space-x-2">
          {(['1h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === '1h' ? '1小时' : range === '24h' ? '24小时' : '7天'}
            </button>
          ))}
        </div>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均成功率</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {avgSuccessRate.toFixed(1)}%
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
              <p className="text-sm font-medium text-gray-600">平均TTFT</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {avgTtft.toFixed(0)}ms
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均吞吐量</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.length > 0
                  ? (
                      stats.reduce((sum, s) => sum + s.avgThroughput, 0) /
                      stats.length
                    ).toFixed(1)
                  : '0'}
                tokens/s
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总请求数</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {stats.reduce((sum, s) => sum + s.totalRequests, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 实时性能图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            实时 TTFT 监控
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ttft"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="TTFT (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            实时吞吐量监控
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="throughput"
                stroke="#10b981"
                strokeWidth={2}
                name="吞吐量 (tokens/s)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 供应商性能对比 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          供应商性能对比
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="providerId" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="successRate" fill="#10b981" name="成功率 (%)" />
            <Bar dataKey="avgThroughput" fill="#0ea5e9" name="吞吐量 (tokens/s)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 供应商 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 5 供应商（按成功率）
        </h3>
        <div className="space-y-4">
          {topProviders.map((provider, index) => (
            <div
              key={provider.providerId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full mr-3">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {provider.providerId}
                  </div>
                  <div className="text-sm text-gray-500">
                    {provider.accountId}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  成功率: {provider.successRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  TTFT: {provider.avgTtftMs.toFixed(0)}ms | 吞吐量:{' '}
                  {provider.avgThroughput.toFixed(1)} tokens/s
                </div>
              </div>
            </div>
          ))}
        </div>

        {topProviders.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无性能数据</p>
          </div>
        )}
      </div>

      {/* 性能指标说明 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">性能指标说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              TTFT (Time to First Token)
            </h4>
            <p className="text-sm text-gray-600">
              首字延迟，从发送请求到收到第一个token的时间。越低越好，
              理想的TTFT应低于200ms。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              吞吐量 (Throughput)
            </h4>
            <p className="text-sm text-gray-600">
              每秒生成的token数量。越高越好，理想的吞吐量应高于50 tokens/s。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              成功率 (Success Rate)
            </h4>
            <p className="text-sm text-gray-600">
              成功请求占总请求的百分比。越高越好，理想的成功率应高于95%。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              总延迟 (Latency)
            </h4>
            <p className="text-sm text-gray-600">
              从发送请求到收到完整响应的总时间。包括TTFT和生成时间。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
