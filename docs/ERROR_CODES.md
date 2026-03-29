# API 错误码完整列表

本文档列出了所有支持的 API 提供商的错误码及其处理方式。

---

## 目录

- [OpenAI 错误码](#openai-错误码)
- [Anthropic 错误码](#anthropic-错误码)
- [Google Gemini 错误码](#google-gemini-错误码)
- [HTTP 状态码](#http-状态码)
- [错误处理策略](#错误处理策略)

---

## OpenAI 错误码

### 账号相关错误（banned - 禁用账号）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `invalid_api_key` | 401 | API key 无效或已被停用 | ❌ 否 |
| `account_deactivated` | 403 | 账号已被停用 | ❌ 否 |
| `access_terminated` | 403 | 访问权限已被终止 | ❌ 否 |
| `unauthorized` | 401 | 未授权访问 | ❌ 否 |
| `permission_denied` | 403 | 权限被拒绝 | ❌ 否 |

**处理方式**：
```typescript
// 立即禁用账号
await db.updateAccountStatus(accountId, 'banned');
// 发送紧急告警
await sendAlert('critical', 'Account banned', { accountId, errorCode });
```

---

### 速率限制错误（rate_limited - 标记并降级）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `rate_limit_exceeded` | 429 | 超过速率限制 | ✅ 是 |
| `quota_exceeded` | 429 | 超过配额限制 | ✅ 是 |
| `too_many_requests` | 429 | 请求过多 | ✅ 是 |
| `requests_until_rate_limit` | 429 | 接近速率限制 | ✅ 是 |
| `billing_soft_limit` | 429 | 达到账单软限制 | ✅ 是 |
| `billing_hard_limit` | 429 | 达到账单硬限制 | ❌ 否 |

**处理方式**：
```typescript
// 增加失败计数
await db.incrementAccountFailureCount(accountId);

// 如果连续失败 5 次，标记为 rate_limited
if (account.failureCount >= 5) {
  await db.updateAccountStatus(accountId, 'rate_limited');

  // 30 分钟后自动恢复
  setTimeout(async () => {
    await db.updateAccountStatus(accountId, 'active');
    await db.resetAccountFailureCount(accountId);
  }, 30 * 60 * 1000);
}
```

---

### 临时错误（temporarily_unavailable - 重试）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `server_error` | 500 | 服务器内部错误 | ✅ 是 |
| `service_unavailable` | 503 | 服务暂时不可用 | ✅ 是 |
| `timeout` | 504 | 请求超时 | ✅ 是 |
| `overloaded` | 503 | 服务器过载 | ✅ 是 |
| `upstream_error` | 502 | 上游错误 | ✅ 是 |
| `gateway_timeout` | 504 | 网关超时 | ✅ 是 |

**处理方式**：
```typescript
// 记录错误，但不禁用账号
await db.createAccountUsageLog({
  accountId,
  status: 'error',
  errorCode: 'server_error',
  errorMessage: error.message
});

// 自动重试（使用其他账号）
await retryWithDifferentAccount(request);
```

---

### 请求错误（error - 仅记录）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `invalid_request` | 400 | 无效请求 | ✅ 是 |
| `invalid_prompt` | 400 | 无效提示词 | ✅ 是 |
| `context_length_exceeded` | 400 | 超过上下文长度 | ✅ 是 |
| `invalid_model` | 400 | 无效模型 | ✅ 是 |
| `invalid_parameters` | 400 | 无效参数 | ✅ 是 |
| `missing_parameters` | 400 | 缺少必需参数 | ✅ 是 |
| `validation_error` | 400 | 验证失败 | ✅ 是 |

**处理方式**：
```typescript
// 仅记录日志
await db.createAccountUsageLog({
  accountId,
  status: 'error',
  errorCode: 'invalid_request',
  errorMessage: error.message
});
```

---

## Anthropic 错误码

### 账号相关错误（banned）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `invalid_api_key` | 401 | API key 无效 | ❌ 否 |
| `unauthorized` | 401 | 未授权访问 | ❌ 否 |
| `account_not_authorized` | 403 | 账号未授权 | ❌ 否 |
| `permission_denied` | 403 | 权限被拒绝 | ❌ 否 |

---

### 速率限制错误（rate_limited）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `rate_limit_error` | 429 | 超过速率限制 | ✅ 是 |
| `rate_limit` | 429 | 触发速率限制 | ✅ 是 |
| `quota_exceeded` | 429 | 超过配额 | ✅ 是 |
| `usage_cap` | 429 | 达到使用上限 | ✅ 是 |

---

### 临时错误（temporarily_unavailable）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `overloaded_error` | 503 | 服务过载 | ✅ 是 |
| `server_error` | 500 | 服务器错误 | ✅ 是 |
| `service_unavailable` | 503 | 服务不可用 | ✅ 是 |
| `timeout` | 504 | 请求超时 | ✅ 是 |

---

### 请求错误（error）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `invalid_request` | 400 | 无效请求 | ✅ 是 |
| `invalid_prompt` | 400 | 无效提示词 | ✅ 是 |
| `context_length_exceeded` | 400 | 超过上下文长度 | ✅ 是 |
| `invalid_model` | 400 | 无效模型 | ✅ 是 |
| `parameter_error` | 400 | 参数错误 | ✅ 是 |

---

## Google Gemini 错误码

### 账号相关错误（banned）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `API_KEY_INVALID` | 401 | API key 无效 | ❌ 否 |
| `API_KEY_EXPIRED` | 401 | API key 已过期 | ❌ 否 |
| `UNAUTHENTICATED` | 401 | 未认证 | ❌ 否 |
| `PERMISSION_DENIED` | 403 | 权限被拒绝 | ❌ 否 |

---

### 速率限制错误（rate_limited）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `RATE_LIMIT_EXCEEDED` | 429 | 超过速率限制 | ✅ 是 |
| `QUOTA_EXCEEDED` | 429 | 超过配额 | ✅ 是 |
| `RESOURCE_EXHAUSTED` | 429 | 资源耗尽 | ✅ 是 |

---

### 临时错误（temporarily_unavailable）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `SERVER_ERROR` | 500 | 服务器错误 | ✅ 是 |
| `UNAVAILABLE` | 503 | 服务不可用 | ✅ 是 |
| `DEADLINE_EXCEEDED` | 504 | 超时 | ✅ 是 |
| `INTERNAL_ERROR` | 500 | 内部错误 | ✅ 是 |

---

### 请求错误（error）

| 错误码 | HTTP 状态 | 说明 | 可恢复 |
|--------|----------|------|--------|
| `INVALID_ARGUMENT` | 400 | 无效参数 | ✅ 是 |
| `NOT_FOUND` | 404 | 资源未找到 | ✅ 是 |
| `ALREADY_EXISTS` | 409 | 资源已存在 | ✅ 是 |

---

## HTTP 状态码

除了提供商特定的错误码，系统还根据 HTTP 状态码进行判断：

| 状态码 | 类型 | 说明 | 可恢复 |
|--------|------|------|--------|
| 400 | error | 错误请求 | ✅ 是 |
| 401 | banned | 未授权 | ❌ 否 |
| 403 | banned | 禁止访问 | ❌ 否 |
| 404 | error | 资源未找到 | ✅ 是 |
| 429 | rate_limited | 请求过多 | ✅ 是 |
| 500 | temporarily_unavailable | 服务器错误 | ✅ 是 |
| 502 | temporarily_unavailable | 网关错误 | ✅ 是 |
| 503 | temporarily_unavailable | 服务不可用 | ✅ 是 |
| 504 | temporarily_unavailable | 网关超时 | ✅ 是 |

---

## 错误处理策略

### 1. 账号被封（banned）

```typescript
// 特征：
// - HTTP 401/403
// - 错误码：invalid_api_key, account_deactivated, etc.

// 处理策略：
1. 立即禁用账号（status = 'banned'）
2. 停止使用该账号
3. 发送紧急告警
4. 自动切换到其他账号
5. 需要手动恢复

// 代码示例：
if (errorType === 'banned') {
  await db.updateAccountStatus(accountId, 'banned');
  await alerting.sendCritical('Account banned', { accountId, errorCode });
  await router.switchToDifferentAccount();
}
```

### 2. 速率限制（rate_limited）

```typescript
// 特征：
// - HTTP 429
// - 错误码：rate_limit_exceeded, quota_exceeded, etc.

// 处理策略：
1. 增加失败计数（+1）
2. 如果连续失败 >= 5 次，标记为 'rate_limited'
3. 30 分钟后自动恢复
4. 期间自动切换到其他账号

// 代码示例：
if (errorType === 'rate_limited') {
  account.failureCount++;

  if (account.failureCount >= 5) {
    await db.updateAccountStatus(accountId, 'rate_limited');

    // 自动恢复
    setTimeout(async () => {
      await db.updateAccountStatus(accountId, 'active');
      await db.resetAccountFailureCount(accountId);
    }, 30 * 60 * 1000);
  }

  await router.switchToDifferentAccount();
}
```

### 3. 临时错误（temporarily_unavailable）

```typescript
// 特征：
// - HTTP 500/502/503/504
// - 错误码：server_error, timeout, etc.

// 处理策略：
1. 记录错误日志
2. 不禁用账号
3. 自动重试（使用其他账号）
4. 稍后可以继续使用该账号

// 代码示例：
if (errorType === 'temporarily_unavailable') {
  await db.createAccountUsageLog({
    accountId,
    status: 'error',
    errorCode,
    errorMessage
  });

  // 重试（使用其他账号）
  await router.retryWithDifferentAccount(request);
}
```

### 4. 请求错误（error）

```typescript
// 特征：
// - HTTP 400
// - 错误码：invalid_request, context_length_exceeded, etc.

// 处理策略：
1. 仅记录日志
2. 不影响账号状态
3. 不切换账号
4. 返回错误给用户

// 代码示例：
if (errorType === 'error') {
  await db.createAccountUsageLog({
    accountId,
    status: 'error',
    errorCode,
    errorMessage
  });

  // 不重试，直接返回错误
  return { error: errorCode, message: errorMessage };
}
```

---

## 错误恢复时间

| 错误类型 | 自动恢复 | 恢复时间 | 需要手动干预 |
|---------|---------|---------|-------------|
| 账号被封 | ❌ 否 | - | ✅ 是 |
| 速率限制 | ✅ 是 | 30 分钟 | ❌ 否 |
| 临时错误 | ✅ 是 | 立即重试 | ❌ 否 |
| 请求错误 | ✅ 是 | - | ❌ 否 |

---

## 监控和告警

### 建议监控指标

```typescript
// 1. 账号成功率
const successRate = (successfulRequests / totalRequests) * 100;
if (successRate < 80) {
  // 告警：成功率过低
}

// 2. 错误率
const errorRate = (errorRequests / totalRequests) * 100;
if (errorRate > 20) {
  // 告警：错误率过高
}

// 3. 账号被封数量
const bannedCount = accounts.filter(a => a.status === 'banned').length;
if (bannedCount > 0) {
  // 紧急告警：有账号被封
}

// 4. 速率限制频率
const rateLimitCount = recentLogs.filter(l => l.status === 'rate_limited').length;
if (rateLimitCount > 10) {
  // 告警：频繁触发速率限制
}
```

### 告警级别

| 级别 | 触发条件 | 通知方式 |
|------|---------|---------|
| Critical | 账号被封 | 短信、邮件、即时通知 |
| High | 所有账号不可用 | 短信、邮件 |
| Warning | 成功率 < 80% | 邮件 |
| Info | 速率限制 | 日志记录 |

---

## 相关文档

- [账号来源和错误检测详解](./ACCOUNT_SOURCE_AND_ERROR_DETECTION.md)
- [账号池系统使用指南](./ACCOUNT_POOL_GUIDE.md)
- [快速开始](./QUICK_START.md)

---

## 更新日志

- 2025-01-15: 初始版本，包含 OpenAI、Anthropic、Google 错误码
