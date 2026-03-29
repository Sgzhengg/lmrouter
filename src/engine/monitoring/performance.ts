// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type {
  PerformanceMetricData,
  ProviderMetrics,
  ProviderStats,
} from "../../types/routing.js";
import type { Database } from "../../utils/account-pool-db.js";

/**
 * 性能监控模块
 *
 * 负责追踪和记录供应商的性能指标：
 * - TTFT（Time to First Token）：首字延迟
 * - Throughput：吞吐量（tokens/second）
 * - Latency：总延迟
 * - Success Rate：成功率
 * - Uptime：可用性
 */
export class PerformanceMonitor {
  // 内存缓存：存储最近的性能指标
  private metricsCache = new Map<string, PerformanceMetricData[]>();
  private readonly cacheSize = 100; // 每个账号缓存最近 100 条记录
  private readonly cacheTtl = 60 * 60 * 1000; // 1 小时

  constructor(private db: Database) {}

  /**
   * 记录性能指标
   */
  async recordMetric(data: PerformanceMetricData): Promise<void> {
    const key = `${data.providerId}-${data.accountId}`;

    // 1. 添加到内存缓存
    const cached = this.metricsCache.get(key) || [];
    cached.push(data);

    // 限制缓存大小
    if (cached.length > this.cacheSize) {
      cached.shift();
    }

    // 清理过期数据
    const now = Date.now();
    const validData = cached.filter(
      (m) => now - m.timestamp.getTime() < this.cacheTtl
    );

    this.metricsCache.set(key, validData);

    // 2. 持久化到数据库
    try {
      // TODO: 实现数据库持久化
      // await this.db.createPerformanceMetric(data);
    } catch (error) {
      console.error("[PerformanceMonitor] Failed to save metric:", error);
    }
  }

  /**
   * 获取账号的性能统计
   */
  async getProviderStats(
    providerId: string,
    accountId: string,
    timeRange: "1h" | "24h" | "7d" = "1h"
  ): Promise<ProviderStats> {
    const key = `${providerId}-${accountId}`;
    const cached = this.metricsCache.get(key) || [];

    // 过滤时间范围
    const now = Date.now();
    const timeRangeMs =
      timeRange === "1h"
        ? 60 * 60 * 1000
        : timeRange === "24h"
        ? 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000;

    const recentMetrics = cached.filter(
      (m) => now - m.timestamp.getTime() <= timeRangeMs
    );

    // 计算统计数据
    const stats = this.calculateStats(recentMetrics);

    return {
      providerId,
      accountId,
      timeRange,
      avgTtftMs: stats.avgTtftMs,
      avgThroughput: stats.avgThroughput,
      avgLatencyMs: stats.avgLatencyMs,
      successRate: stats.successRate,
      uptime: stats.uptime,
      errorRate: stats.errorRate,
      totalRequests: stats.totalRequests,
      throughputTps: stats.throughputTps,
      totalCost: stats.totalCost,
    };
  }

  /**
   * 获取实时的 TTFT（最近 N 次请求的平均值）
   */
  getRealtimeTTFT(providerId: string, accountId: string): number {
    const key = `${providerId}-${accountId}`;
    const cached = this.metricsCache.get(key) || [];

    // 获取最近 10 次有 TTFT 数据的记录
    const recentTTFT = cached
      .filter((m) => m.ttftMs !== undefined)
      .slice(-10)
      .map((m) => m.ttftMs!);

    if (recentTTFT.length === 0) {
      return 500; // 默认值
    }

    // 计算平均值
    const sum = recentTTFT.reduce((a, b) => a + b, 0);
    return sum / recentTTFT.length;
  }

  /**
   * 获取实时吞吐量
   */
  getRealtimeThroughput(providerId: string, accountId: string): number {
    const key = `${providerId}-${accountId}`;
    const cached = this.metricsCache.get(key) || [];

    // 获取最近 10 次有吞吐量数据的记录
    const recentThroughput = cached
      .filter((m) => m.throughput !== undefined)
      .slice(-10)
      .map((m) => m.throughput!);

    if (recentThroughput.length === 0) {
      return 50; // 默认值 50 tokens/s
    }

    // 计算平均值
    const sum = recentThroughput.reduce((a, b) => a + b, 0);
    return sum / recentThroughput.length;
  }

  /**
   * 计算成功率
   */
  getSuccessRate(providerId: string, accountId: string): number {
    // TODO: 从数据库获取账号的成功率
    // 暂时返回默认值
    return 95;
  }

  /**
   * 计算可用性
   */
  getUptime(providerId: string, accountId: string): number {
    // TODO: 从数据库获取账号的可用性
    // 暂时返回默认值
    return 99.5;
  }

  /**
   * 获取账号的综合性能指标
   */
  async getProviderMetrics(
    providerId: string,
    accountId: string
  ): Promise<ProviderMetrics> {
    const stats = await this.getProviderStats(providerId, accountId, "1h");

    return {
      providerId,
      accountId,
      avgTtftMs: stats.avgTtftMs,
      avgThroughput: stats.throughputTps,
      avgLatencyMs: stats.avgLatencyMs,
      successRate: stats.successRate,
      uptime: stats.uptime,
      errorRate: stats.errorRate,
    };
  }

  /**
   * 对比多个供应商的性能
   */
  async compareProviders(
    providers: Array<{ providerId: string; accountId: string }>,
    timeRange: "1h" | "24h" | "7d" = "1h"
  ): Promise<
    Array<{
      providerId: string;
      accountId: string;
      avgTtftMs: number;
      avgCostPer1kTokens: number;
      successRate: number;
      totalRequests: number;
    }>
  > {
    const comparisons = [];

    for (const provider of providers) {
      const stats = await this.getProviderStats(
        provider.providerId,
        provider.accountId,
        timeRange
      );

      comparisons.push({
        providerId: provider.providerId,
        accountId: provider.accountId,
        avgTtftMs: stats.avgTtftMs || 500,
        avgCostPer1kTokens: (stats.totalCost || 0) / (stats.totalRequests || 1),
        successRate: stats.successRate || 95,
        totalRequests: stats.totalRequests || 0,
      });
    }

    return comparisons;
  }

  /**
   * 计算统计数据
   */
  private calculateStats(
    metrics: PerformanceMetricData[]
  ): Omit<ProviderStats, "providerId" | "accountId" | "timeRange"> {
    if (metrics.length === 0) {
      return {
        avgTtftMs: 500,
        avgLatencyMs: 1000,
        throughputTps: 50,
        totalCost: 0,
        totalRequests: 0,
        successRate: 100,
        errorRate: 0,
        uptime: 99.5,
      };
    }

    // 成功率
    const successCount = metrics.filter((m) => m.ttftMs !== undefined).length;
    const successRate = (successCount / metrics.length) * 100;

    // TTFT
    const ttftValues = metrics.filter((m) => m.ttftMs !== undefined).map((m) => m.ttftMs!);
    const avgTtftMs =
      ttftValues.length > 0
        ? ttftValues.reduce((a, b) => a + b, 0) / ttftValues.length
        : 500;

    // 延迟
    const latencyValues = metrics
      .filter((m) => m.latencyMs !== undefined)
      .map((m) => m.latencyMs!);
    const avgLatencyMs =
      latencyValues.length > 0
        ? latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length
        : 1000;

    // 吞吐量
    const throughputValues = metrics
      .filter((m) => m.throughput !== undefined)
      .map((m) => m.throughput!);
    const throughputTps =
      throughputValues.length > 0
        ? throughputValues.reduce((a, b) => a + b, 0) / throughputValues.length
        : 50;

    // 错误率
    const errorCount = metrics.length - successCount;
    const errorRate = (errorCount / metrics.length) * 100;

    return {
      totalRequests: metrics.length,
      successRate,
      avgTtftMs,
      avgLatencyMs,
      throughputTps,
      totalCost: 0, // TODO: 计算总成本
      errorRate,
      uptime: 99.5, // TODO: 计算实际可用性
    };
  }

  /**
   * 清理过期的缓存数据
   */
  cleanupCache(): void {
    const now = Date.now();

    for (const [key, metrics] of this.metricsCache.entries()) {
      // 移除过期数据
      const validMetrics = metrics.filter(
        (m) => now - m.timestamp.getTime() < this.cacheTtl
      );

      if (validMetrics.length === 0) {
        // 如果没有有效数据，删除该键
        this.metricsCache.delete(key);
      } else {
        this.metricsCache.set(key, validMetrics);
      }
    }
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(): number {
    return this.metricsCache.size;
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    this.metricsCache.clear();
  }
}
