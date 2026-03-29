// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { NitroStrategy } from "./strategies/nitro.js";
import { FloorStrategy } from "./strategies/floor.js";
import { BalancedStrategy } from "./strategies/balanced.js";
import type { IRoutingStrategy, RoutingStrategyType } from "../../types/routing.js";

/**
 * 路由策略工厂
 * 用于创建和管理路由策略实例
 */
export class RoutingStrategyFactory {
  private strategies: Map<RoutingStrategyType, IRoutingStrategy>;
  private defaultStrategy: RoutingStrategyType = "balanced";

  constructor() {
    this.strategies = new Map();

    // 注册默认策略
    this.registerStrategy(new NitroStrategy());
    this.registerStrategy(new FloorStrategy());
    this.registerStrategy(new BalancedStrategy());
  }

  /**
   * 注册新策略
   */
  registerStrategy(strategy: IRoutingStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * 获取策略实例
   */
  getStrategy(type: RoutingStrategyType): IRoutingStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Unknown routing strategy: ${type}`);
    }
    return strategy;
  }

  /**
   * 获取默认策略
   */
  getDefaultStrategy(): IRoutingStrategy {
    return this.getStrategy(this.defaultStrategy);
  }

  /**
   * 设置默认策略
   */
  setDefaultStrategy(type: RoutingStrategyType): void {
    if (!this.strategies.has(type)) {
      throw new Error(`Cannot set unknown strategy as default: ${type}`);
    }
    this.defaultStrategy = type;
  }

  /**
   * 获取所有可用策略
   */
  getAvailableStrategies(): RoutingStrategyType[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * 检查策略是否可用
   */
  hasStrategy(type: RoutingStrategyType): boolean {
    return this.strategies.has(type);
  }

  /**
   * 获取策略描述
   */
  getStrategyDescription(type: RoutingStrategyType): string {
    const strategy = this.strategies.get(type);
    return strategy?.description || "Unknown strategy";
  }
}

// 导出单例实例
export const routingStrategyFactory = new RoutingStrategyFactory();
