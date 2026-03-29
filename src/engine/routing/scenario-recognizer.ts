// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type { RoutingRequestContext } from "../../types/routing.js";

/**
 * 场景识别结果
 */
export interface ScenarioRecognition {
  scenario: string;
  confidence: number; // 0-1
  recommendedModel: string;
  reason: string;
  alternativeModels?: string[];
}

/**
 * 场景识别规则
 */
export interface ScenarioRule {
  name: string;
  condition: (context: RoutingRequestContext) => boolean;
  recommendedModel: string;
  alternativeModels?: string[];
  reason: string;
  priority: number; // 优先级，数字越小优先级越高
}

/**
 * 场景识别器
 *
 * 根据请求内容自动识别使用场景，推荐最合适的模型
 */
export class ScenarioRecognizer {
  private rules: ScenarioRule[] = [
    // 优先级 1：代码生成
    {
      name: "code-generation",
      priority: 1,
      condition: (context) => {
        const message = this.getLastMessage(context);
        return (
          this.containsCode(message) ||
          this.hasKeywords(message, ["代码", "code", "函数", "function", "编程", "debug", "调试"])
        );
      },
      recommendedModel: "claude-3-opus",
      alternativeModels: ["gpt-4-turbo", "claude-3-sonnet"],
      reason: "代码生成场景，推荐使用 Claude（擅长代码）",
    },

    // 优先级 2：复杂数学/逻辑推理
    {
      name: "complex-reasoning",
      priority: 2,
      condition: (context) => {
        const message = this.getLastMessage(context);
        return (
          this.containsMath(message) ||
          this.hasKeywords(message, ["推理", "证明", "计算", "优化", "算法", "逻辑"])
        );
      },
      recommendedModel: "gpt-4-turbo",
      alternativeModels: ["claude-3-opus", "gemini-1.5-pro"],
      reason: "复杂推理场景，推荐使用 GPT-4（推理能力强）",
    },

    // 优先级 3：长文本处理
    {
      name: "long-context",
      priority: 3,
      condition: (context) => {
        const totalLength = this.getTotalLength(context);
        return totalLength > 50000; // 超过 50K 字符
      },
      recommendedModel: "claude-3-opus-200k",
      alternativeModels: ["gpt-4-turbo-128k", "gemini-1.5-pro"],
      reason: "长文本场景，推荐使用大上下文窗口模型",
    },

    // 优先级 4：创意写作
    {
      name: "creative-writing",
      priority: 4,
      condition: (context) => {
        const message = this.getLastMessage(context);
        return this.hasKeywords(message, [
          "写",
          "创作",
          "小说",
          "文章",
          "故事",
          "诗歌",
          "剧本",
          "作文",
        ]);
      },
      recommendedModel: "claude-3-sonnet",
      alternativeModels: ["gpt-4-turbo", "claude-3-opus"],
      reason: "创意写作场景，推荐使用 Claude Sonnet（擅长写作）",
    },

    // 优先级 5：数据分析
    {
      name: "data-analysis",
      priority: 5,
      condition: (context) => {
        const message = this.getLastMessage(context);
        return (
          this.hasKeywords(message, ["分析", "数据", "统计", "图表", "趋势", "报告"]) ||
          message.includes("```") && message.includes("csv")
        );
      },
      recommendedModel: "gpt-4-turbo",
      alternativeModels: ["claude-3-opus", "gemini-1.5-pro"],
      reason: "数据分析场景，推荐使用 GPT-4（分析能力强）",
    },

    // 优先级 6：简单问答（默认）
    {
      name: "simple-qa",
      priority: 6,
      condition: (context) => {
        const message = this.getLastMessage(context);
        return message.length < 500 && !this.containsCode(message);
      },
      recommendedModel: "gpt-3.5-turbo",
      alternativeModels: ["claude-3-haiku", "gemini-1.5-flash"],
      reason: "简单问答场景，使用小模型即可（快速且便宜）",
    },

    // 优先级 7：通用场景（兜底）
    {
      name: "general",
      priority: 7,
      condition: () => true, // 总是匹配
      recommendedModel: "gpt-4-turbo", // 默认使用 GPT-4
      alternativeModels: ["claude-3-opus", "gemini-1.5-pro"],
      reason: "通用场景，使用 GPT-4 Turbo（性能平衡）",
    },
  ];

  /**
   * 识别场景
   */
  recognize(context: RoutingRequestContext): ScenarioRecognition {
    // 按优先级排序规则
    const sortedRules = [...this.rules].sort((a, b) => a.priority - b.priority);

    // 找到第一个匹配的规则
    for (const rule of sortedRules) {
      if (rule.condition(context)) {
        return {
          scenario: rule.name,
          confidence: 0.8, // 简单实现，固定置信度
          recommendedModel: rule.recommendedModel,
          alternativeModels: rule.alternativeModels,
          reason: rule.reason,
        };
      }
    }

    // 理论上不会到这里，因为最后一个规则总是匹配
    return {
      scenario: "general",
      confidence: 0.5,
      recommendedModel: "gpt-4-turbo",
      reason: "通用场景",
    };
  }

  /**
   * 批量识别场景（用于测试和调试）
   */
  recognizeBatch(contexts: RoutingRequestContext[]): ScenarioRecognition[] {
    return contexts.map((ctx) => this.recognize(ctx));
  }

  /**
   * 添加自定义规则
   */
  addRule(rule: ScenarioRule): void {
    this.rules.push(rule);
    // 按优先级排序
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 移除规则
   */
  removeRule(name: string): boolean {
    const index = this.rules.findIndex((r) => r.name === name);
    if (index >= 0) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取所有规则
   */
  getRules(): ScenarioRule[] {
    return [...this.rules];
  }

  // ==================== 辅助方法 ====================

  /**
   * 获取最后一条消息
   */
  private getLastMessage(context: RoutingRequestContext): string {
    if (context.messages.length === 0) return "";
    return context.messages[context.messages.length - 1].content;
  }

  /**
   * 计算总长度
   */
  private getTotalLength(context: RoutingRequestContext): number {
    return JSON.stringify(context.messages).length;
  }

  /**
   * 检查是否包含代码
   */
  private containsCode(message: string): boolean {
    return (
      message.includes("```") ||
      message.includes("function ") ||
      message.includes("def ") ||
      message.includes("class ") ||
      message.includes("import ") ||
      /<[a-z]+/.test(message) // HTML 标签
    );
  }

  /**
   * 检查是否包含数学表达式
   */
  private containsMath(message: string): boolean {
    return (
      /[\d+\-*/^()]+/.test(message) ||
      message.includes("积分") ||
      message.includes("导数") ||
      message.includes("方程") ||
      message.includes("公式")
    );
  }

  /**
   * 检查是否包含关键词
   */
  private hasKeywords(message: string, keywords: string[]): boolean {
    return keywords.some((keyword) => message.includes(keyword));
  }
}

/**
 * 场景感知的路由器
 *
 * 结合场景识别和智能路由
 */
export class ScenarioAwareRouter {
  constructor(
    private scenarioRecognizer: ScenarioRecognizer
    // private routingEngine: RoutingEngine
  ) {}

  /**
   * 根据场景智能选择模型和供应商
   */
  async routeWithContext(context: RoutingRequestContext): Promise<{
    scenario: ScenarioRecognition;
    recommendedModel: string;
    recommendedProvider?: string;
    recommendedAccount?: string;
    reasoning: string;
  }> {
    // 1. 识别场景
    const scenario = this.scenarioRecognizer.recognize(context);

    console.log(`[ScenarioAwareRouter] Recognized scenario: ${scenario.scenario}`);
    console.log(`[ScenarioAwareRouter] Recommended model: ${scenario.recommendedModel}`);
    console.log(`[ScenarioAwareRouter] Reason: ${scenario.reason}`);

    // 2. 根据推荐的模型，使用智能路由选择最优供应商
    // const modelConfig = await this.getModelConfig(scenario.recommendedModel);
    // const decision = await this.routingEngine.decide(modelConfig, context);

    // 3. 返回综合建议
    return {
      scenario,
      recommendedModel: scenario.recommendedModel,
      // recommendedProvider: decision.providerId,
      // recommendedAccount: decision.accountId,
      reasoning: scenario.reason,
    };
  }

  /**
   * 估算成本节省
   */
  estimateCostSavings(
    originalModel: string,
    recommendedModel: string,
    inputTokens: number,
    outputTokens: number
  ): {
    originalCost: number;
    recommendedCost: number;
    savings: number;
    savingsPercentage: number;
  } {
    // 模型价格表（示例）
    const modelPrices: Record<string, { input: number; output: number }> = {
      "gpt-4-turbo": { input: 0.01, output: 0.03 },
      "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
      "claude-3-opus": { input: 0.015, output: 0.075 },
      "claude-3-sonnet": { input: 0.003, output: 0.015 },
      "claude-3-haiku": { input: 0.00025, output: 0.00125 },
      "gemini-1.5-pro": { input: 0.001, output: 0.005 },
      "gemini-1.5-flash": { input: 0.0001, output: 0.0004 },
    };

    const originalPrice = modelPrices[originalModel];
    const recommendedPrice = modelPrices[recommendedModel];

    if (!originalPrice || !recommendedPrice) {
      return {
        originalCost: 0,
        recommendedCost: 0,
        savings: 0,
        savingsPercentage: 0,
      };
    }

    const originalCost =
      (inputTokens / 1000) * originalPrice.input +
      (outputTokens / 1000) * originalPrice.output;

    const recommendedCost =
      (inputTokens / 1000) * recommendedPrice.input +
      (outputTokens / 1000) * recommendedPrice.output;

    const savings = originalCost - recommendedCost;
    const savingsPercentage =
      originalCost > 0 ? (savings / originalCost) * 100 : 0;

    return {
      originalCost,
      recommendedCost,
      savings,
      savingsPercentage,
    };
  }
}

// 导出单例实例
export const scenarioRecognizer = new ScenarioRecognizer();
export const scenarioAwareRouter = new ScenarioAwareRouter(scenarioRecognizer);
