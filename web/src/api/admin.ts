// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import axios from 'axios'
import type {
  Provider,
  ProviderAccount,
  RoutingDecision,
  PerformanceMetrics,
  ProviderPerformanceStats,
  CostComparison,
  CostSavings,
  ProvidersResponse,
  ProviderAccountsResponse,
  RoutingStrategiesResponse,
  PerformanceStatsResponse,
  CostAnalysisResponse,
} from '../types/admin'

// API 配置
const getApiBase = () => {
  return import.meta.env.PROD
    ? import.meta.env.VITE_API_BASE_URL || ''
    : ''
}

const API_BASE = `${getApiBase()}/admin`
const API_KEY = 'sk-test-key-1'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
})

// ============================================
// 供应商管理 API
// ============================================

export const providersApi = {
  /**
   * 获取所有供应商
   */
  async getProviders(): Promise<ProvidersResponse> {
    const response = await api.get<ProvidersResponse>('/providers')
    return response.data
  },

  /**
   * 获取单个供应商详情
   */
  async getProvider(id: string): Promise<Provider> {
    const response = await api.get<Provider>(`/providers/${id}`)
    return response.data
  },

  /**
   * 创建供应商
   */
  async createProvider(data: Partial<Provider>): Promise<Provider> {
    const response = await api.post<Provider>('/providers', data)
    return response.data
  },

  /**
   * 更新供应商
   */
  async updateProvider(id: string, data: Partial<Provider>): Promise<Provider> {
    const response = await api.put<Provider>(`/providers/${id}`, data)
    return response.data
  },

  /**
   * 删除供应商
   */
  async deleteProvider(id: string): Promise<void> {
    await api.delete(`/providers/${id}`)
  },

  /**
   * 获取供应商的所有账号
   */
  async getProviderAccounts(providerId: string): Promise<ProviderAccountsResponse> {
    const response = await api.get<ProviderAccountsResponse>(`/providers/${providerId}/accounts`)
    return response.data
  },
}

// ============================================
// 账号池管理 API
// ============================================

export const accountsApi = {
  /**
   * 获取所有账号
   */
  async getAllAccounts(): Promise<{ accounts: ProviderAccount[]; total: number }> {
    const response = await api.get('/accounts')
    return response.data
  },

  /**
   * 获取供应商的账号列表
   */
  async getAccounts(providerId: string): Promise<ProviderAccountsResponse> {
    const response = await api.get<ProviderAccountsResponse>(`/providers/${providerId}/accounts`)
    return response.data
  },

  /**
   * 创建账号
   */
  async createAccount(providerId: string, data: Partial<ProviderAccount>): Promise<ProviderAccount> {
    const response = await api.post<ProviderAccount>(
      `/providers/${providerId}/accounts`,
      data
    )
    return response.data
  },

  /**
   * 更新账号
   */
  async updateAccount(
    providerId: string,
    accountId: string,
    data: Partial<ProviderAccount>
  ): Promise<ProviderAccount> {
    const response = await api.put<ProviderAccount>(
      `/providers/${providerId}/accounts/${accountId}`,
      data
    )
    return response.data
  },

  /**
   * 删除账号
   */
  async deleteAccount(providerId: string, accountId: string): Promise<void> {
    await api.delete(`/providers/${providerId}/accounts/${accountId}`)
  },

  /**
   * 测试账号连接
   */
  async testAccount(providerId: string, accountId: string): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.post(`/providers/${providerId}/accounts/${accountId}/test`)
    return response.data
  },

  /**
   * 获取账号健康状态
   */
  async getAccountHealth(providerId: string, accountId: string): Promise<{
    status: string
    lastCheck: string
    metrics: PerformanceMetrics
  }> {
    const response = await api.get(`/providers/${providerId}/accounts/${accountId}/health`)
    return response.data
  },
}

// ============================================
// 路由策略 API
// ============================================

export const routingApi = {
  /**
   * 获取所有路由策略
   */
  async getStrategies(): Promise<RoutingStrategiesResponse> {
    const response = await api.get<RoutingStrategiesResponse>('/routing/strategies')
    return response.data
  },

  /**
   * 测试路由策略
   */
  async testStrategy(
    modelName: string,
    strategy: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<RoutingDecision> {
    const response = await api.post<RoutingDecision>('/routing/test', {
      modelName,
      strategy,
      messages,
    })
    return response.data
  },

  /**
   * 获取路由决策历史
   */
  async getRoutingHistory(limit: number = 50): Promise<{
    decisions: RoutingDecision[]
    total: number
  }> {
    const response = await api.get('/routing/history', { params: { limit } })
    return response.data
  },
}

// ============================================
// 性能监控 API
// ============================================

export const performanceApi = {
  /**
   * 获取性能统计数据
   */
  async getStats(timeRange: string = '24h'): Promise<PerformanceStatsResponse> {
    const response = await api.get<PerformanceStatsResponse>('/performance/stats', {
      params: { timeRange },
    })
    return response.data
  },

  /**
   * 获取供应商性能对比
   */
  async getProviderComparison(): Promise<{
    providers: ProviderPerformanceStats[]
  }> {
    const response = await api.get('/performance/comparison')
    return response.data
  },

  /**
   * 获取实时性能指标
   */
  async getRealTimeMetrics(): Promise<{
    metrics: PerformanceMetrics[]
    timestamp: string
  }> {
    const response = await api.get('/performance/realtime')
    return response.data
  },
}

// ============================================
// 成本分析 API
// ============================================

export const costsApi = {
  /**
   * 获取成本分析
   */
  async getAnalysis(timeRange: string = '24h'): Promise<CostAnalysisResponse> {
    const response = await api.get<CostAnalysisResponse>('/costs/analysis', {
      params: { timeRange },
    })
    return response.data
  },

  /**
   * 获取成本对比
   */
  async getComparison(): Promise<{
    comparisons: CostComparison[]
  }> {
    const response = await api.get('/costs/comparison')
    return response.data
  },

  /**
   * 获取成本节省统计
   */
  async getSavings(timeRange: string = '24h'): Promise<{
    savings: CostSavings
    breakdown: Array<{
      providerId: string
      accountId: string
      saved: number
      savedPercentage: number
    }>
  }> {
    const response = await api.get('/costs/savings', { params: { timeRange } })
    return response.data
  },
}
