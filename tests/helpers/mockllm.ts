// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

/**
 * MockLLM 测试辅助工具
 * 模拟多个具有不同特性的 LLM 提供商
 */

export interface MockLLMServerConfig {
  port: number;
  ttft: number; // Time to First Token (ms)
  failureRate: number; // 0-1
  rateLimit?: number; // requests per minute
}

export class MockLLMServer {
  private config: MockLLMServerConfig;
  private requestCount = 0;
  private isBanned = false;

  constructor(config: MockLLMServerConfig) {
    this.config = config;
  }

  /**
   * 模拟聊天补全请求
   */
  async chatCompletion(request: any): Promise<Response> {
    this.requestCount++;

    // 检查是否被封
    if (this.isBanned) {
      return this.errorResponse("account_banned", "Account has been banned");
    }

    // 检查速率限制
    if (this.config.rateLimit && this.requestCount > this.config.rateLimit) {
      return this.errorResponse("rate_limited", "Rate limit exceeded");
    }

    // 检查是否应该失败
    if (Math.random() < this.config.failureRate) {
      return this.errorResponse("internal_error", "Internal server error");
    }

    // 模拟延迟
    await this.delay(this.config.ttft);

    // 返回成功响应
    return this.successResponse(request);
  }

  /**
   * 模拟被封
   */
  simulateBanned(): void {
    this.isBanned = true;
  }

  /**
   * 模拟恢复
   */
  simulateRecover(): void {
    this.isBanned = false;
    this.requestCount = 0;
  }

  /**
   * 成功响应
   */
  private successResponse(request: any): Response {
    const response = {
      id: `chatcmpl-${this.generateId()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: this.generateMockResponse(request),
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: this.estimateTokens(request.messages),
        completion_tokens: 50,
        total_tokens: this.estimateTokens(request.messages) + 50,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * 错误响应
   */
  private errorResponse(code: string, message: string): Response {
    const response = {
      error: {
        code,
        message,
        type: "api_error",
      },
    };

    return new Response(JSON.stringify(response), {
      status: this.getHttpStatus(code),
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * 根据错误码获取 HTTP 状态码
   */
  private getHttpStatus(code: string): number {
    switch (code) {
      case "account_banned":
      case "invalid_api_key":
        return 401;
      case "rate_limited":
        return 429;
      default:
        return 500;
    }
  }

  /**
   * 生成模拟响应
   */
  private generateMockResponse(request: any): string {
    const userMessage =
      request.messages?.[request.messages.length - 1]?.content || "";

    // 根据用户消息生成相关回复
    if (userMessage.includes("hello") || userMessage.includes("hi")) {
      return "Hello! I'm a mock LLM server. How can I help you today?";
    } else if (userMessage.includes("test")) {
      return "This is a test response from the mock LLM server.";
    } else {
      return `I received your message: "${userMessage}". This is a simulated response.`;
    }
  }

  /**
   * 估算 token 数
   */
  private estimateTokens(messages: any[]): number {
    const text = JSON.stringify(messages);
    return Math.ceil(text.length / 4);
  }

  /**
   * 生成随机 ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      isBanned: this.isBanned,
      ttft: this.config.ttft,
      failureRate: this.config.failureRate,
    };
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.requestCount = 0;
    this.isBanned = false;
  }
}

/**
 * MockLLM 服务器集合
 */
export class MockLLMServers {
  private servers: Map<number, MockLLMServer> = new Map();

  /**
   * 启动多个 MockLLM 服务器
   */
  async start(configs: MockLLMServerConfig[]): Promise<void> {
    for (const config of configs) {
      const server = new MockLLMServer(config);
      this.servers.set(config.port, server);

      // TODO: 实际启动 HTTP 服务器
      // 这里需要使用 http 模块或 Express 创建真实的 HTTP 服务器
      console.log(`MockLLM server started on port ${config.port}`);
    }
  }

  /**
   * 获取指定端口的服务器
   */
  getServer(port: number): MockLLMServer | undefined {
    return this.servers.get(port);
  }

  /**
   * 模拟服务器失败
   */
  simulateFailure(port: number): void {
    const server = this.servers.get(port);
    if (server) {
      server.simulateBanned();
    }
  }

  /**
   * 模拟服务器恢复
   */
  simulateRecover(port: number): void {
    const server = this.servers.get(port);
    if (server) {
      server.simulateRecover();
    }
  }

  /**
   * 停止所有服务器
   */
  async stop(): Promise<void> {
    this.servers.clear();
  }

  /**
   * 获取所有服务器的统计信息
   */
  getAllStats() {
    const stats: Record<number, any> = {};
    this.servers.forEach((server, port) => {
      stats[port] = server.getStats();
    });
    return stats;
  }
}

/**
 * 创建测试用的 MockLLM 服务器配置
 */
export function createTestConfigs(): MockLLMServerConfig[] {
  return [
    {
      port: 8000,
      ttft: 100, // 快速响应
      failureRate: 0.01, // 1% 失败率
      rateLimit: 100,
    },
    {
      port: 8001,
      ttft: 200, // 中速响应
      failureRate: 0.05, // 5% 失败率
      rateLimit: 80,
    },
    {
      port: 8002,
      ttft: 300, // 慢速响应
      failureRate: 0.1, // 10% 失败率
      rateLimit: 60,
    },
  ];
}

/**
 * 测试辅助函数
 */
export async function makeTestRequest(
  baseUrl: string,
  modelName: string,
  message: string,
  apiKey: string = "sk-test-key"
): Promise<{
  success: boolean;
  data: any;
  latency: number;
}> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${baseUrl}/openai/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: message }],
      }),
    });

    const latency = Date.now() - startTime;
    const data = await response.json();

    return {
      success: response.ok,
      data,
      latency,
    };
  } catch (error) {
    return {
      success: false,
      data: { error: error instanceof Error ? error.message : "Unknown error" },
      latency: Date.now() - startTime,
    };
  }
}

/**
 * 断言辅助函数
 */
export function assertRoutingDecision(
  response: any,
  expectedProvider: string,
  expectedStrategy?: string
): void {
  if (expectedStrategy && response.router?.strategy !== expectedStrategy) {
    throw new Error(
      `Expected strategy ${expectedStrategy}, got ${response.router?.strategy}`
    );
  }

  if (response.router?.selected_provider !== expectedProvider) {
    throw new Error(
      `Expected provider ${expectedProvider}, got ${response.router?.selected_provider}`
    );
  }
}

/**
 * 等待条件满足
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}
