// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type {
  RoutingDecision,
  RoutingRequestContext,
  RoutingExecutionResult,
  ModelRoutingConfig,
  RoutingStrategyType,
} from "../../types/routing.js";
import type { Database } from "../../utils/account-pool-db.js";
import { routingStrategyFactory } from "./strategy-factory.js";

/**
 * 智能路由引擎
 *
 * 核心功能：
 * 1. 根据策略选择最优供应商和账号
 * 2. 执行路由决策
 * 3. 记录路由日志
 * 4. 处理故障转移
 */
export class RoutingEngine {
  constructor(private db: Database) {}

  /**
   * 执行路由决策
   */
  async decide(
    config: ModelRoutingConfig,
    context: RoutingRequestContext
  ): Promise<RoutingDecision> {
    // 1. 确定使用的策略
    const strategyType = this.determineStrategy(context);
    const strategy = routingStrategyFactory.getStrategy(strategyType);

    console.log(
      `[RoutingEngine] Using strategy: ${strategyType} for model: ${context.modelName}`
    );

    // 2. 检查用户是否手动指定了供应商
    if (context.preferences?.preferredProvider) {
      return this.selectManualProvider(config, context);
    }

    // 3. 使用策略进行选择
    const decision = await strategy.select(config, context);

    console.log(
      `[RoutingEngine] Selected provider: ${decision.providerId}, account: ${decision.accountId}`
    );
    console.log(`[RoutingEngine] Reason: ${decision.reason}`);

    // 4. 记录路由决策到日志
    await this.logRoutingDecision(decision, context);

    return decision;
  }

  /**
   * 执行路由（发送请求并处理结果）
   */
  async execute(
    decision: RoutingDecision,
    context: RoutingRequestContext,
    requestFn: (decision: RoutingDecision) => Promise<{
      success: boolean;
      ttftMs?: number;
      totalLatencyMs?: number;
      inputTokens?: number;
      outputTokens?: number;
      errorCode?: string;
      errorMessage?: string;
    }>
  ): Promise<RoutingExecutionResult> {
    const startTime = Date.now();
    let result: RoutingExecutionResult = {
      decision,
      success: false,
      fallbackUsed: false,
      fallbackCount: 0,
    };
    let fallbackCount = 0;
    let currentDecision = decision;

    // 最多尝试 3 次
    while (fallbackCount < 3) {
      try {
        // 执行请求
        const response = await requestFn(currentDecision);

        result = {
          decision: currentDecision,
          success: response.success,
          ttftMs: response.ttftMs,
          totalLatencyMs: response.totalLatencyMs || Date.now() - startTime,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          errorCode: response.errorCode,
          errorMessage: response.errorMessage,
          fallbackUsed: fallbackCount > 0,
          fallbackCount,
        };

        // 如果成功，更新性能指标
        if (response.success && response.ttftMs !== undefined) {
          await this.updatePerformanceMetrics(currentDecision, {
            ttftMs: response.ttftMs,
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
          });
        }

        break;
      } catch (error) {
        fallbackCount++;

        // 如果失败，尝试使用备选方案
        if (fallbackCount < currentDecision.alternatives.length) {
          const alternative = currentDecision.alternatives[fallbackCount];

          console.warn(
            `[RoutingEngine] Request failed, trying alternative: ${alternative.providerId}`
          );

          // 创建新的决策
          currentDecision = {
            ...currentDecision,
            providerId: alternative.providerId,
            accountId: alternative.accountId,
          };
        } else {
          // 所有备选方案都失败了
          result = {
            decision: currentDecision,
            success: false,
            errorCode: "all_alternatives_failed",
            errorMessage: "All providers failed",
            fallbackUsed: fallbackCount > 0,
            fallbackCount,
          };
          break;
        }
      }
    }

    // 记录执行结果
    await this.logRoutingExecution(result, context);

    return result;
  }

  /**
   * 确定使用的路由策略
   */
  private determineStrategy(
    context: RoutingRequestContext
  ): RoutingStrategyType {
    // 1. 用户指定的策略优先
    if (context.preferences?.strategy) {
      return context.preferences.strategy;
    }

    // 2. 根据请求类型自动选择
    // TODO: 可以根据请求内容、用户历史等智能选择

    // 3. 使用默认策略
    return "balanced";
  }

  /**
   * 手动选择供应商
   */
  private selectManualProvider(
    config: ModelRoutingConfig,
    context: RoutingRequestContext
  ): RoutingDecision {
    const preferredProvider = context.preferences?.preferredProvider;
    const preferredAccount = context.preferences?.preferredAccount;

    // 查找指定的供应商
    const provider = config.providers.find(
      (p) =>
        p.providerId === preferredProvider ||
        p.accountId === preferredAccount
    );

    if (!provider) {
      throw new Error(
        `Preferred provider/account not found: ${preferredProvider || preferredAccount}`
      );
    }

    return {
      providerId: provider.providerId,
      accountId: provider.accountId,
      providerModelName: provider.providerModelName,
      strategy: "manual",
      reason: `Manually selected by user: ${preferredProvider || preferredAccount}`,
      confidence: 1.0,
      alternatives: this.getAlternatives(config.providers, provider),
      timestamp: new Date(),
    };
  }

  /**
   * 获取备选方案
   */
  private getAlternatives(
    providers: ModelRoutingConfig["providers"],
    selected: ModelRoutingConfig["providers"][0]
  ): Array<{
    providerId: string;
    accountId: string;
  }> {
    return providers
      .filter((p) => p.providerId !== selected.providerId)
      .slice(0, 3)
      .map((p) => ({
        providerId: p.providerId,
        accountId: p.accountId,
      }));
  }

  /**
   * 记录路由决策
   */
  private async logRoutingDecision(
    decision: RoutingDecision,
    context: RoutingRequestContext
  ): Promise<void> {
    try {
      await this.db.createRoutingLog({
        requestId: this.generateRequestId(),
        modelName: context.modelName,
        strategy: decision.strategy,
        selectedProvider: decision.providerId,
        selectedAccount: decision.accountId,
        alternatives: decision.alternatives as any, // JSONB
        decisionReason: decision.reason,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("[RoutingEngine] Failed to log routing decision:", error);
    }
  }

  /**
   * 记录路由执行结果
   */
  private async logRoutingExecution(
    result: RoutingExecutionResult,
    context: RoutingRequestContext
  ): Promise<void> {
    try {
      // 更新路由日志
      // TODO: 实现更新逻辑
      console.log(
        `[RoutingEngine] Execution result: success=${result.success}, latency=${result.totalLatencyMs}ms`
      );
    } catch (error) {
      console.error("[RoutingEngine] Failed to log routing execution:", error);
    }
  }

  /**
   * 更新性能指标
   */
  private async updatePerformanceMetrics(
    decision: RoutingDecision,
    response: {
      ttftMs: number;
      inputTokens?: number;
      outputTokens?: number;
    }
  ): Promise<void> {
    try {
      // TODO: 实现性能指标更新逻辑
      console.log(
        `[RoutingEngine] Updating performance metrics: TTFT=${response.ttftMs}ms`
      );
    } catch (error) {
      console.error("[RoutingEngine] Failed to update performance metrics:", error);
    }
  }

  /**
   * 生成请求 ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
