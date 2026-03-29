// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type {
  ProviderAccount,
  AccountSelectionStrategyType,
  AccountSelectionContext,
  RequestResult,
  NewAccountUsageLog,
} from "../../types/account-pool.js";
import type { Database } from "../../utils/account-pool-db.js";
import { AccountSelectionStrategyFactory } from "./strategies.js";
import { ErrorDetector } from "./error-detector.js";

/**
 * 账号池管理器
 * 负责选择、管理和监控提供商账号
 */
export class AccountPoolManager {
  private strategyFactory: AccountSelectionStrategyFactory;
  private defaultStrategy: AccountSelectionStrategyType = "success-rate-priority";

  constructor(private db: Database) {
    this.strategyFactory = new AccountSelectionStrategyFactory();
  }

  /**
   * 选择一个可用的账号
   */
  async selectAccount(
    context: AccountSelectionContext,
    strategy?: AccountSelectionStrategyType
  ): Promise<ProviderAccount | null> {
    const strategyType = strategy || this.defaultStrategy;

    // 1. 从数据库获取该提供商的所有账号
    const accounts = await this.db.getAccountsByProvider(context.providerId);

    if (!accounts || accounts.length === 0) {
      console.warn(
        `[AccountPool] No accounts found for provider: ${context.providerId}`
      );
      return null;
    }

    // 2. 过滤可用账号
    const availableAccounts = accounts.filter((account: ProviderAccount) => {
      // 检查状态
      if (account.status !== "active") {
        return false;
      }

      // 检查速率限制
      if (
        account.rpmLimit &&
        account.rpmUsed &&
        account.rpmUsed >= account.rpmLimit
      ) {
        return false;
      }

      // 检查成功率（低于 30% 的暂时不使用）
      const successRate = Number(account.successRate || 0);
      if (successRate < 30) {
        return false;
      }

      return true;
    });

    if (availableAccounts.length === 0) {
      // 尝试降级：使用低成功率的账号
      const degradedAccounts = accounts.filter((a: ProviderAccount) => a.status === "active");
      if (degradedAccounts.length > 0) {
        console.warn(
          `[AccountPool] Using degraded account for ${context.providerId}`
        );
        // 按成功率排序，选择最好的
        degradedAccounts.sort(
          (a: ProviderAccount, b: ProviderAccount) =>
            Number(b.successRate || 0) - Number(a.successRate || 0)
        );
        return degradedAccounts[0];
      }
      return null;
    }

    // 3. 使用策略选择账号
    const selector = this.strategyFactory.getStrategy(strategyType);
    const selectedAccount = selector.selectAccount(availableAccounts, context);

    if (!selectedAccount) {
      console.error(
        `[AccountPool] Strategy ${strategyType} failed to select account`
      );
      return null;
    }

    console.log(
      `[AccountPool] Selected account ${selectedAccount.accountName} using ${strategyType} strategy`
    );

    return selectedAccount;
  }

  /**
   * 记录请求结果
   */
  async recordRequestResult(
    accountId: string,
    requestId: string,
    result: RequestResult,
    context: {
      userId?: string;
      modelName: string;
      providerType?: string;
    }
  ): Promise<void> {
    // 1. 更新账号统计
    await this.db.updateAccountStats(accountId, {
      success: result.success,
      latency: result.latency,
      inputTokens: result.tokens.input,
      outputTokens: result.tokens.output,
      cost: result.cost,
    });

    // 2. 记录使用日志
    const logData: NewAccountUsageLog = {
      accountId,
      userId: context.userId,
      requestId,
      modelName: context.modelName,
      status: result.success ? "success" : "error",
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      latencyMs: result.latency,
      inputTokens: result.tokens.input,
      outputTokens: result.tokens.output,
      cost: result.cost.toString(),
      metadata: {
        ttft: result.ttft,
      },
    };
    await this.db.createAccountUsageLog(logData);

    // 3. 处理错误状态
    if (!result.success) {
      await this.handleRequestFailure(
        accountId,
        result,
        context.providerType || "openai"
      );
    } else {
      await this.handleRequestSuccess(accountId);
    }
  }

  /**
   * 处理请求失败
   */
  private async handleRequestFailure(
    accountId: string,
    result: RequestResult,
    providerType: string = "openai"
  ): Promise<void> {
    const errorCode = result.errorCode || "unknown";

    // 构造错误对象用于检测
    const errorResponse = {
      error: {
        code: errorCode,
        message: result.errorMessage,
      },
    };

    // 使用 ErrorDetector 检测错误类型
    const errorMapping = ErrorDetector.detectError(
      providerType,
      errorResponse
    );

    if (errorMapping) {
      // 根据错误类型执行相应的操作
      if (ErrorDetector.shouldDisableAccount(errorMapping)) {
        await this.markAccountBanned(
          accountId,
          errorMapping.description
        );
      } else if (ErrorDetector.shouldRecordRateLimit(errorMapping)) {
        await this.markAccountRateLimited(accountId);
      } else if (!ErrorDetector.isTemporaryError(errorMapping)) {
        // 非临时错误，增加失败计数
        await this.incrementAccountFailure(accountId);
      }
    } else {
      // 未知错误，使用旧的逻辑
      if (this.isBannedError(errorCode)) {
        await this.markAccountBanned(accountId, result.errorMessage || "Unknown");
      } else if (this.isRateLimitedError(errorCode)) {
        await this.markAccountRateLimited(accountId);
      } else {
        await this.incrementAccountFailure(accountId);
      }
    }
  }

  /**
   * 处理请求成功
   */
  private async handleRequestSuccess(accountId: string): Promise<void> {
    await this.db.updateAccountLastSuccess(accountId);
    await this.db.resetAccountFailureCount(accountId);
  }

  /**
   * 标记账号被封
   */
  async markAccountBanned(accountId: string, reason: string): Promise<void> {
    await this.db.updateAccountStatus(accountId, "banned");
    console.error(`[AccountPool] Account ${accountId} marked as banned: ${reason}`);

    // TODO: 发送告警通知
    // await this.sendAlert({
    //   type: 'account_banned',
    //   accountId,
    //   reason,
    //   severity: 'critical'
    // });
  }

  /**
   * 标记账速率限制
   */
  async markAccountRateLimited(accountId: string): Promise<void> {
    const account = await this.db.getAccount(accountId);
    if (!account) return;

    // 增加失败计数
    const newFailureCount = (account.failureCount || 0) + 1;
    await this.db.updateAccountFailureCount(accountId, newFailureCount);

    // 如果连续多次触发速率限制，暂时禁用
    if (newFailureCount >= 5) {
      await this.db.updateAccountStatus(accountId, "rate_limited");
      console.warn(
        `[AccountPool] Account ${accountId} marked as rate limited after ${newFailureCount} failures`
      );

      // 30分钟后自动恢复
      setTimeout(async () => {
        await this.db.updateAccountStatus(accountId, "active");
        await this.db.resetAccountFailureCount(accountId);
        console.log(`[AccountPool] Account ${accountId} auto-recovered from rate limited`);
      }, 30 * 60 * 1000);
    }
  }

  /**
   * 增加账号失败计数
   */
  private async incrementAccountFailure(accountId: string): Promise<void> {
    const account = await this.db.getAccount(accountId);
    if (!account) return;

    const newFailureCount = (account.failureCount || 0) + 1;
    await this.db.updateAccountFailureCount(accountId, newFailureCount);

    // 连续失败3次，降级状态
    if (newFailureCount >= 3) {
      await this.db.updateAccountStatus(accountId, "degraded");
      console.warn(
        `[AccountPool] Account ${accountId} marked as degraded after ${newFailureCount} failures`
      );
    }
  }

  /**
   * 判断是否为封号错误
   */
  private isBannedError(errorCode: string): boolean {
    return [
      "account_deactivated",
      "access_terminated",
      "invalid_api_key",
      "unauthorized",
      "account_banned",
    ].includes(errorCode);
  }

  /**
   * 判断是否为速率限制错误
   */
  private isRateLimitedError(errorCode: string): boolean {
    return [
      "rate_limit_exceeded",
      "quota_exceeded",
      "too_many_requests",
      "rate_limited",
    ].includes(errorCode);
  }

  /**
   * 获取账号健康状态
   */
  async getAccountHealth(accountId: string): Promise<{
    status: "healthy" | "degraded" | "down";
    successRate: number;
    lastSuccessAt?: Date;
    lastFailureAt?: Date;
    failureCount: number;
  }> {
    const account = await this.db.getAccount(accountId);
    if (!account) {
      return {
        status: "down",
        successRate: 0,
        failureCount: 0,
      };
    }

    const successRate = Number(account.successRate || 0);
    const failureCount = account.failureCount || 0;

    let status: "healthy" | "degraded" | "down";
    if (account.status === "banned" || account.status === "inactive") {
      status = "down";
    } else if (
      account.status === "degraded" ||
      account.status === "rate_limited"
    ) {
      status = "degraded";
    } else if (successRate >= 90 && failureCount === 0) {
      status = "healthy";
    } else if (successRate >= 70) {
      status = "healthy";
    } else {
      status = "degraded";
    }

    return {
      status,
      successRate,
      lastSuccessAt: account.lastSuccessAt || undefined,
      lastFailureAt: account.lastFailureAt || undefined,
      failureCount,
    };
  }

  /**
   * 设置默认策略
   */
  setDefaultStrategy(strategy: AccountSelectionStrategyType): void {
    this.defaultStrategy = strategy;
  }

  /**
   * 获取可用策略列表
   */
  getAvailableStrategies(): AccountSelectionStrategyType[] {
    return this.strategyFactory.availableStrategies();
  }
}
