# 错误检测流程图

## 完整的错误检测和处理流程

```
┌─────────────────────────────────────────────────────────────┐
│                     1. 发送 API 请求                         │
│  使用账号池中的某个账号发送请求到 AI 提供商                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     2. 接收响应                              │
│  检查 HTTP 状态码和响应体                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
          ┌─────────┐       ┌─────────┐
          │ 成功    │       │ 失败    │
          │ 200 OK │       │ 4xx/5xx │
          └────┬────┘       └────┬────┘
               │                 │
               │                 ▼
               │    ┌──────────────────────────────┐
               │    │   3. 解析错误响应             │
               │    │   提取错误码和错误信息         │
               │    └──────────┬───────────────────┘
               │               │
               │               ▼
               │    ┌──────────────────────────────┐
               │    │   4. 错误码检测               │
               │    │   使用 ErrorDetector         │
               │    └──────────┬───────────────────┘
               │               │
               │               ▼
               │    ┌────────────────────────────────────────┐
               │    │         5. 错误分类                    │
               │    └────────────┬───────────────────────────┘
               │                 │
               │    ┌────────────┼────────────┬────────────┐
               │    │            │            │            │
               │    ▼            ▼            ▼            ▼
               │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
               │ │ 账号被封  │ │ 速率限制  │ │ 临时错误  │ │ 请求错误  │
               │ │ (banned) │ │(limited) │ │ (temp)   │ │  (error) │
               │ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
               │      │            │            │            │
               │      ▼            ▼            ▼            ▼
               │
...（继续下一部分）
```

---

## 各类错误的详细处理流程

### 账号被封（banned）处理流程

```
账号被封 (banned)
    │
    ├─► 检测到错误码：
    │   - invalid_api_key
    │   - account_deactivated
    │   - unauthorized
    │   - HTTP 401/403
    │
    ├─► 立即执行：
    │   │
    │   ├─► 1. 禁用账号
    │   │   await db.updateAccountStatus(accountId, 'banned')
    │   │
    │   ├─► 2. 停止使用该账号
    │   │   从可用账号列表中移除
    │   │
    │   ├─► 3. 发送紧急告警
    │   │   await alerting.sendCritical('Account banned')
    │   │
    │   ├─► 4. 自动切换到其他账号
    │   │   await router.switchToDifferentAccount()
    │   │
    │   └─► 5. 记录到日志
    │       await db.createAccountUsageLog({ status: 'banned' })
    │
    ├─► 结果：
    │   - ✅ 请求自动重试（使用其他账号）
    │   - ❌ 该账号不再使用
    │   - ⚠️  需要手动干预恢复
    │
    └─► 恢复方式：
        - 检查账号状态
        - 解决封号原因
        - 手动更新状态为 'active'
```

### 速率限制（rate_limited）处理流程

```
速率限制 (rate_limited)
    │
    ├─► 检测到错误码：
    │   - rate_limit_exceeded
    │   - quota_exceeded
    │   - too_many_requests
    │   - HTTP 429
    │
    ├─► 执行步骤：
    │   │
    │   ├─► 1. 增加失败计数
    │   │   account.failureCount++
    │   │
    │   ├─► 2. 检查失败次数
    │   │   if (account.failureCount >= 5) {
    │   │       // 连续失败 5 次
    │   │   }
    │   │
    │   ├─► 3a. 如果 < 5 次
    │   │   - 记录日志
    │   │   - 暂时标记（不影响使用）
    │   │   - 继续使用该账号
    │   │
    │   └─► 3b. 如果 >= 5 次
    │       - 标记为 'rate_limited'
    │       await db.updateAccountStatus(accountId, 'rate_limited')
    │       - 切换到其他账号
    │       - 设置 30 分钟定时器自动恢复
    │       setTimeout(() => recoverAccount(), 30 * 60 * 1000)
    │
    ├─► 自动恢复：
    │   │
    │   ├─► 30 分钟后：
    │   │   await db.updateAccountStatus(accountId, 'active')
    │   │   await db.resetAccountFailureCount(accountId)
    │   │
    │   └─► 账号重新可用
    │
    ├─► 结果：
    │   - ✅ 请求自动重试（使用其他账号）
    │   - ✅ 30 分钟后自动恢复
    │   - ✅ 无需手动干预
    │
    └─► 预防措施：
        - 设置合理的 rpmLimit/tpmLimit
        - 使用多个账号分散请求
        - 监控使用量，避免超限
```

### 临时错误（temporarily_unavailable）处理流程

```
临时错误 (temporarily_unavailable)
    │
    ├─► 检测到错误码：
    │   - server_error
    │   - service_unavailable
    │   - timeout
    │   - overloaded
    │   - HTTP 500/502/503/504
    │
    ├─► 执行步骤：
    │   │
    │   ├─► 1. 记录错误日志
    │   │   await db.createAccountUsageLog({
    │   │       status: 'error',
    │   │       errorCode: 'server_error'
    │   │   })
    │   │
    │   ├─► 2. 不禁用账号
    │   │   账号状态保持 'active'
    │   │
    │   ├─► 3. 立即重试
    │   │   使用其他可用账号重试请求
    │   │   await router.retryWithDifferentAccount(request)
    │   │
    │   └─► 4. 更新成功率
    │       影响账号成功率，但不影响使用
    │
    ├─► 结果：
    │   - ✅ 请求自动重试
    │   - ✅ 账号继续可用
    │   - ✅ 无需手动干预
    │
    └─► 说明：
        - 临时错误通常是服务器端问题
        - 稍后重试通常可以成功
        - 不应该禁用账号
```

### 请求错误（error）处理流程

```
请求错误 (error)
    │
    ├─► 检测到错误码：
    │   - invalid_request
    │   - context_length_exceeded
    │   - invalid_model
    │   - invalid_parameters
    │   - HTTP 400
    │
    ├─► 执行步骤：
    │   │
    │   ├─► 1. 记录错误日志
    │   │   await db.createAccountUsageLog({
    │   │       status: 'error',
    │   │       errorCode: 'invalid_request'
    │   │   })
    │   │
    │   ├─► 2. 不影响账号状态
    │   │   账号保持 'active'
    │   │
    │   ├─► 3. 不切换账号
    │   │   这是客户端请求的问题
    │   │
    │   └─► 4. 返回错误给用户
    │       让用户修正请求后重试
    │
    ├─► 结果：
    │   - ❌ 不自动重试
    │   - ✅ 账号继续可用
    │   - ⚠️  需要用户修正请求
    │
    └─► 说明：
        - 这是客户端请求的问题
        - 不是账号的问题
        - 修改请求后可以重试
```

---

## 错误检测代码示例

```typescript
// 完整的错误处理流程示例
async function handleApiResponse(
  response: Response,
  accountId: string,
  providerType: string
) {
  // 1. 检查 HTTP 状态码
  if (!response.ok) {
    // 2. 解析错误响应
    const errorData = await response.json();

    // 3. 检测错误类型
    const errorMapping = ErrorDetector.detectError(
      providerType,
      errorData,
      response.status
    );

    if (errorMapping) {
      // 4. 根据错误类型处理
      switch (errorMapping.type) {
        case 'banned':
          // 账号被封
          await handleBannedAccount(accountId, errorMapping);
          break;

        case 'rate_limited':
          // 速率限制
          await handleRateLimitedAccount(accountId, errorMapping);
          break;

        case 'temporarily_unavailable':
          // 临时错误
          await handleTemporaryError(accountId, errorMapping);
          break;

        default:
          // 其他错误
          await handleGenericError(accountId, errorMapping);
      }

      // 5. 切换到其他账号重试
      return await retryWithDifferentAccount();
    }
  }

  // 请求成功
  return await response.json();
}

// 处理账号被封
async function handleBannedAccount(
  accountId: string,
  error: ErrorMapping
) {
  // 禁用账号
  await db.updateAccountStatus(accountId, 'banned');

  // 发送告警
  await alerting.sendCritical('Account banned', {
    accountId,
    errorCode: error.code,
    description: error.description
  });

  // 记录日志
  console.error(`[AccountPool] Account ${accountId} banned: ${error.description}`);
}

// 处理速率限制
async function handleRateLimitedAccount(
  accountId: string,
  error: ErrorMapping
) {
  const account = await db.getAccount(accountId);

  // 增加失败计数
  const newCount = (account.failureCount || 0) + 1;
  await db.updateAccountFailureCount(accountId, newCount);

  // 检查是否需要标记为 rate_limited
  if (newCount >= 5) {
    await db.updateAccountStatus(accountId, 'rate_limited');

    // 30 分钟后自动恢复
    setTimeout(async () => {
      await db.updateAccountStatus(accountId, 'active');
      await db.resetAccountFailureCount(accountId);
      console.log(`[AccountPool] Account ${accountId} recovered from rate limit`);
    }, 30 * 60 * 1000);

    console.warn(`[AccountPool] Account ${accountId} marked as rate limited`);
  }

  // 切换到其他账号
  await router.switchToDifferentAccount();
}

// 处理临时错误
async function handleTemporaryError(
  accountId: string,
  error: ErrorMapping
) {
  // 仅记录日志
  await db.createAccountUsageLog({
    accountId,
    status: 'error',
    errorCode: error.code,
    errorMessage: error.description
  });

  console.warn(`[AccountPool] Temporary error for account ${accountId}: ${error.description}`);

  // 重试（使用其他账号）
  await router.retryWithDifferentAccount();
}

// 处理通用错误
async function handleGenericError(
  accountId: string,
  error: ErrorMapping
) {
  // 仅记录日志
  await db.createAccountUsageLog({
    accountId,
    status: 'error',
    errorCode: error.code,
    errorMessage: error.description
  });

  console.info(`[AccountPool] Error for account ${accountId}: ${error.description}`);
}
```

---

## 错误恢复时间对比

```
错误类型           自动恢复    恢复时间      手动干预    继续使用
─────────────────────────────────────────────────────────────
账号被封           ❌ 否       -           ✅ 是       ❌ 否
速率限制           ✅ 是       30 分钟     ❌ 否       ✅ 是
临时错误           ✅ 是       立即        ❌ 否       ✅ 是
请求错误           ✅ 是       -           ❌ 否       ✅ 是
```

---

## 实际案例

### 案例 1：OpenAI 账号被封

```
1. 发送请求
   POST https://api.openai.com/v1/chat/completions
   Authorization: Bearer sk-banned-key

2. 收到响应
   HTTP 401 Unauthorized
   {
     "error": {
       "message": "Invalid API key",
       "type": "invalid_request_error",
       "code": "invalid_api_key"
     }
   }

3. 系统检测
   ErrorDetector.detectError('openai', errorData, 401)
   → ErrorMapping {
       type: 'banned',
       code: 'invalid_api_key',
       action: 'disable_account'
     }

4. 自动处理
   ✅ 禁用账号
   ✅ 发送告警
   ✅ 切换到其他账号
   ✅ 记录日志

5. 结果
   用户无感知，请求自动成功（使用备用账号）
```

### 案例 2：触发速率限制

```
1. 发送请求（短时间内多次请求）
   POST https://api.openai.com/v1/chat/completions

2. 收到响应
   HTTP 429 Too Many Requests
   {
     "error": {
       "message": "Rate limit exceeded",
       "type": "rate_limit_error",
       "code": "rate_limit_exceeded"
     }
   }

3. 系统检测
   ErrorDetector.detectError('openai', errorData, 429)
   → ErrorMapping {
       type: 'rate_limited',
       code: 'rate_limit_exceeded',
       action: 'rate_limit'
     }

4. 自动处理
   ✅ 增加失败计数（1/5）
   ✅ 切换到其他账号
   ✅ 记录日志

5. 连续触发 5 次后
   ✅ 标记为 'rate_limited'
   ✅ 设置 30 分钟定时器
   ✅ 发送告警

6. 30 分钟后
   ✅ 自动恢复为 'active'
   ✅ 重置失败计数
   ✅ 可以继续使用
```

---

## 相关文档

- [账号来源和错误检测详解](./ACCOUNT_SOURCE_AND_ERROR_DETECTION.md)
- [错误码完整列表](./ERROR_CODES.md)
- [账号池系统使用指南](./ACCOUNT_POOL_GUIDE.md)
