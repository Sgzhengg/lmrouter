// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

/**
 * API 错误码检测和映射
 * 用于识别账号被封、限流等错误
 */

export interface ErrorMapping {
  code: string;
  type: "banned" | "rate_limited" | "error" | "temporarily_unavailable";
  severity: "critical" | "high" | "medium" | "low";
  action: "disable_account" | "rate_limit" | "retry" | "log_only";
  recoverable: boolean;
  description: string;
}

/**
 * OpenAI 错误码映射
 * 文档：https://platform.openai.com/docs/guides/error-codes/api-errors
 */
export const openaiErrorMap: Record<string, ErrorMapping> = {
  // 账号被封/无效
  invalid_api_key: {
    code: "invalid_api_key",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "API key is invalid (账号无效或被封)",
  },
  account_deactivated: {
    code: "account_deactivated",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "Account has been deactivated (账号已被停用)",
  },
  access_terminated: {
    code: "access_terminated",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "Access has been terminated (访问被终止)",
  },
  unauthorized: {
    code: "unauthorized",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "Unauthorized access (未授权访问)",
  },

  // 速率限制
  rate_limit_exceeded: {
    code: "rate_limit_exceeded",
    type: "rate_limited",
    severity: "high",
    action: "rate_limit",
    recoverable: true,
    description: "Rate limit exceeded (超过速率限制)",
  },
  quota_exceeded: {
    code: "quota_exceeded",
    type: "rate_limited",
    severity: "high",
    action: "rate_limit",
    recoverable: true,
    description: "Quota exceeded (超过配额)",
  },
  too_many_requests: {
    code: "too_many_requests",
    type: "rate_limited",
    severity: "high",
    action: "rate_limit",
    recoverable: true,
    description: "Too many requests (请求过多)",
  },
  requests_until_rate_limit: {
    code: "requests_until_rate_limit",
    type: "rate_limited",
    severity: "medium",
    action: "rate_limit",
    recoverable: true,
    description: "Approaching rate limit (接近速率限制)",
  },

  // 临时错误
  server_error: {
    code: "server_error",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "Server error (服务器错误)",
  },
  service_unavailable: {
    code: "service_unavailable",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "Service unavailable (服务不可用)",
  },
  timeout: {
    code: "timeout",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "Request timeout (请求超时)",
  },

  // 其他错误
  invalid_request: {
    code: "invalid_request",
    type: "error",
    severity: "low",
    action: "log_only",
    recoverable: true,
    description: "Invalid request (无效请求)",
  },
  context_length_exceeded: {
    code: "context_length_exceeded",
    type: "error",
    severity: "low",
    action: "log_only",
    recoverable: true,
    description: "Context length exceeded (超过上下文长度)",
  },
};

/**
 * Anthropic 错误码映射
 * 文档：https://docs.anthropic.com/claude/reference/errors
 */
export const anthropicErrorMap: Record<string, ErrorMapping> = {
  // 账号被封/无效
  invalid_api_key: {
    code: "invalid_api_key",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "Invalid API key (API key 无效)",
  },
  unauthorized: {
    code: "unauthorized",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "Unauthorized (未授权)",
  },
  account_not_authorized: {
    code: "account_not_authorized",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "Account not authorized (账号未授权)",
  },

  // 速率限制
  rate_limit_error: {
    code: "rate_limit_error",
    type: "rate_limited",
    severity: "high",
    action: "rate_limit",
    recoverable: true,
    description: "Rate limit exceeded (超过速率限制)",
  },
  rate_limit: {
    code: "rate_limit",
    type: "rate_limited",
    severity: "high",
    action: "rate_limit",
    recoverable: true,
    description: "Rate limit hit (触发速率限制)",
  },

  // 临时错误
  overloaded_error: {
    code: "overloaded_error",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "Service overloaded (服务过载)",
  },
  server_error: {
    code: "server_error",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "Internal server error (内部服务器错误)",
  },

  // 其他错误
  invalid_request: {
    code: "invalid_request",
    type: "error",
    severity: "low",
    action: "log_only",
    recoverable: true,
    description: "Invalid request (无效请求)",
  },
};

/**
 * Google Gemini 错误码映射
 * 文档：https://ai.google.dev/gemini-api/docs/errors
 */
export const googleErrorMap: Record<string, ErrorMapping> = {
  // 账号被封/无效
  API_KEY_INVALID: {
    code: "API_KEY_INVALID",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "API key invalid (API key 无效)",
  },
  API_KEY_EXPIRED: {
    code: "API_KEY_EXPIRED",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "API key expired (API key 已过期)",
  },

  // 速率限制
  RATE_LIMIT_EXCEEDED: {
    code: "RATE_LIMIT_EXCEEDED",
    type: "rate_limited",
    severity: "high",
    action: "rate_limit",
    recoverable: true,
    description: "Rate limit exceeded (超过速率限制)",
  },
  QUOTA_EXCEEDED: {
    code: "QUOTA_EXCEEDED",
    type: "rate_limited",
    severity: "high",
    action: "rate_limit",
    recoverable: true,
    description: "Quota exceeded (超过配额)",
  },

  // 临时错误
  SERVER_ERROR: {
    code: "SERVER_ERROR",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "Server error (服务器错误)",
  },
  UNAVAILABLE: {
    code: "UNAVAILABLE",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "Service unavailable (服务不可用)",
  },

  // 其他错误
  INVALID_ARGUMENT: {
    code: "INVALID_ARGUMENT",
    type: "error",
    severity: "low",
    action: "log_only",
    recoverable: true,
    description: "Invalid argument (无效参数)",
  },
};

/**
 * 通用 HTTP 状态码映射
 */
export const httpStatusMap: Record<number, ErrorMapping> = {
  401: {
    code: "unauthorized",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "401 Unauthorized (未授权访问)",
  },
  403: {
    code: "forbidden",
    type: "banned",
    severity: "critical",
    action: "disable_account",
    recoverable: false,
    description: "403 Forbidden (禁止访问)",
  },
  429: {
    code: "too_many_requests",
    type: "rate_limited",
    severity: "high",
    action: "rate_limit",
    recoverable: true,
    description: "429 Too Many Requests (请求过多)",
  },
  500: {
    code: "server_error",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "500 Internal Server Error (内部服务器错误)",
  },
  502: {
    code: "bad_gateway",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "502 Bad Gateway (网关错误)",
  },
  503: {
    code: "service_unavailable",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "503 Service Unavailable (服务不可用)",
  },
  504: {
    code: "gateway_timeout",
    type: "temporarily_unavailable",
    severity: "medium",
    action: "retry",
    recoverable: true,
    description: "504 Gateway Timeout (网关超时)",
  },
};

/**
 * 错误检测器
 */
export class ErrorDetector {
  /**
   * 从 API 响应中检测错误类型
   */
  static detectError(
    providerType: string,
    response: any,
    httpStatus?: number
  ): ErrorMapping | null {
    // 首先检查 HTTP 状态码
    if (httpStatus && httpStatusMap[httpStatus]) {
      return httpStatusMap[httpStatus];
    }

    // 如果没有响应体，返回 null
    if (!response) {
      return null;
    }

    // 尝试从响应中提取错误码
    const errorCode = this.extractErrorCode(response);
    if (!errorCode) {
      return null;
    }

    // 根据提供商类型查找错误映射
    const errorMap = this.getErrorMap(providerType);
    if (errorMap && errorMap[errorCode]) {
      return errorMap[errorCode];
    }

    // 未知的错误码，返回通用错误
    return {
      code: errorCode,
      type: "error",
      severity: "low",
      action: "log_only",
      recoverable: true,
      description: `Unknown error: ${errorCode}`,
    };
  }

  /**
   * 从响应中提取错误码
   */
  public static extractErrorCode(response: any): string | null {
    // OpenAI 格式: { error: { code: "rate_limit_exceeded", message: "..." } }
    if (response.error?.code) {
      return response.error.code;
    }

    // OpenAI 格式: { error: { type: "rate_limit_error", message: "..." } }
    if (response.error?.type) {
      return response.error.type;
    }

    // Anthropic 格式: { error: { type: "error", error_type: "rate_limit_error" } }
    if (response.error?.error_type) {
      return response.error.error_type;
    }

    // Google 格式: { error: { status: "RATE_LIMIT_EXCEEDED", message: "..." } }
    if (response.error?.status) {
      return response.error.status;
    }

    // 通用格式：直接在响应中有 code 字段
    if (response.code) {
      return response.code;
    }

    return null;
  }

  /**
   * 根据提供商类型获取错误映射表
   */
  private static getErrorMap(providerType: string): Record<string, ErrorMapping> | null {
    switch (providerType) {
      case "openai":
        return openaiErrorMap;
      case "anthropic":
        return anthropicErrorMap;
      case "google":
        return googleErrorMap;
      default:
        return null;
    }
  }

  /**
   * 判断是否为账号被封错误
   */
  static isBannedError(error: ErrorMapping): boolean {
    return error.type === "banned";
  }

  /**
   * 判断是否为速率限制错误
   */
  static isRateLimitedError(error: ErrorMapping): boolean {
    return error.type === "rate_limited";
  }

  /**
   * 判断是否为临时错误（可重试）
   */
  static isTemporaryError(error: ErrorMapping): boolean {
    return error.type === "temporarily_unavailable";
  }

  /**
   * 判断是否应该禁用账号
   */
  static shouldDisableAccount(error: ErrorMapping): boolean {
    return error.action === "disable_account";
  }

  /**
   * 判断是否应该记录速率限制
   */
  static shouldRecordRateLimit(error: ErrorMapping): boolean {
    return error.action === "rate_limit";
  }

  /**
   * 判断是否应该重试
   */
  static shouldRetry(error: ErrorMapping): boolean {
    return error.action === "retry" && error.recoverable;
  }
}

/**
 * 错误响应解析器
 * 用于从 fetch Response 中提取错误信息
 */
export async function parseErrorResponse(
  response: Response,
  providerType: string
): Promise<{
  errorMapping: ErrorMapping | null;
  errorCode: string | null;
  errorMessage: string | null;
  httpStatus: number;
}> {
  let errorData: any = null;
  const httpStatus = response.status;

  try {
    errorData = await response.json();
  } catch {
    // 如果无法解析 JSON，尝试获取文本
    try {
      const text = await response.text();
      errorData = { error: { message: text } };
    } catch {
      errorData = { error: { message: "Unknown error" } };
    }
  }

  const errorMapping = ErrorDetector.detectError(
    providerType,
    errorData,
    httpStatus
  );

  const errorCode = errorMapping?.code || ErrorDetector.extractErrorCode(errorData);
  const errorMessage = errorData?.error?.message || errorData?.error?.description || null;

  return {
    errorMapping,
    errorCode,
    errorMessage,
    httpStatus,
  };
}
