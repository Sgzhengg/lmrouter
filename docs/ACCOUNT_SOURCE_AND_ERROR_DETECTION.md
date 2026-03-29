# 账号池系统 - 账号来源和错误检测详解

## 问题1：账号池里的账号怎样获得？

### 重要说明

**LMRouter 本身不提供账号**，它只是一个账号管理和智能路由工具。你需要自己获取 API 账号，然后通过 LMRouter 的管理 API 添加到账号池中。

---

## 账号获取方式

### 方式 1：官方注册（推荐，但门槛高）

#### OpenAI
```markdown
✅ 优点：
- 合法合规，账号安全
- 稳定可靠，官方支持
- 不会被封

❌ 缺点：
- 需要境外手机号（+86 不支持）
- 需要境外信用卡（Visa/MasterCard）
- 注册流程繁琐
- 单人账号数量有限（通常 1-2 个）

注册步骤：
1. 准备境外手机号（可通过 SMS 接收服务获取）
2. 准备境外信用卡（如 Depay、NobePay 等虚拟卡）
3. 访问 https://platform.openai.com
4. 注册并验证手机号
5. 添加付款方式
6. 创建 API Key
```

#### Anthropic (Claude)
```markdown
注册要求与 OpenAI 类似：
- 境外手机号
- 境外信用卡
- 访问 https://console.anthropic.com
```

#### Google Gemini
```markdown
✅ 相对容易：
- 只需要 Google 账号
- 部分功能免费
- 不一定需要信用卡

访问：https://ai.google.dev
```

#### 国内模型（相对容易）
```markdown
✅ 优点：
- 注册门槛低
- 支持国内手机号
- 支付宝/微信支付

推荐：
- 阿里云通义千问：https://dashscope.aliyun.com
- 百度文心一言：https://cloud.baidu.com/product/wenxinworkshop
- 智谱 AI：https://open.bigmodel.cn
- 月之暗面 Kimi：https://platform.moonshot.cn
```

---

### 方式 2：第三方账号分销（常见但有风险）

```markdown
⚠️ 风险提示：
- 账号可能被原主人找回
- 账号可能已被官方标记
- 存在封号风险
- 需要找可靠渠道
```

#### 常见的第三方渠道

1. **电商平台（淘宝/闲鱼）**
   - 搜索"OpenAI 账号"、"Claude API"等
   - 价格：几十到几百元不等
   - ⚠️ 风险较高，需谨慎选择

2. **国外账号交易平台**
   - Accs-market：https://accs-market.com
   - 账号批发，质量参差不齐
   - 需要有一定的鉴别能力

3. **API 账号分销商**
   - 提供现成的 API Key
   - 按使用量计费
   - ⚠️ 可能是共享账号，存在限流风险

4. **Telegram/Discord 群组**
   - 各种账号交易群
   - ⚠️ 诈骗风险高，不建议新手

#### 如何鉴别账号质量？

```markdown
✅ 好的账号卖家：
- 提供账号截图
- 支持验货
- 有售后保障
- 信用评价高

❌ 避免的卖家：
- 价格异常低（可能是盗刷卡）
- 没有任何保障
- 强迫好评
- 不提供账号信息
```

---

### 方式 3：企业/团队账号（适合企业用户）

```markdown
✅ 优点：
- 合法合规
- 稳定可靠
- 配额大
- 有发票和合同

如何获取：
1. 直接联系官方（OpenAI/Anthropic 等）
2. 通过云厂商转售（如 Azure OpenAI）
3. 国内代理商（如阿里云、腾讯云的 API 服务）
```

---

### 方式 4：账号租赁/共享（适合测试）

```markdown
✅ 优点：
- 不需要拥有账号
- 按需付费
- 适合测试和开发

❌ 缺点：
- 稳定性无法保证
- 数据隐私风险
- 可能违反官方服务条款

常见平台：
- OpenAI 代理服务（各种中转 API）
- API 共享平台
```

---

## 实际建议

### 对于个人开发者（2C）

```markdown
方案 A（推荐）：
1. 使用国内模型（通义、文心、智谱等）
2. 注册门槛低，支持国内支付
3. 性能也不错，成本更低

方案 B：
1. 注册 Google Gemini（相对容易）
2. 使用免费的额度进行开发测试
3. 熟悉后再考虑付费账号

方案 C：
1. 从可靠渠道购买 1-2 个 OpenAI/Claude 账号
2. 用于测试和学习
3. 不要投入过多资金
```

### 对于企业用户（2B）

```markdown
方案 A（推荐）：
1. 直接联系官方申请企业账号
2. 通过云厂商（Azure、阿里云等）
3. 合法合规，有保障

方案 B：
1. 使用国内大厂的模型服务
2. 稳定可靠，支持本土化
3. 成本相对可控
```

---

## 问题2：系统是怎样知道账号被封或限流的？

### 核心原理

系统通过**解析 API 响应中的错误码**来判断账号状态。

---

## 错误检测机制详解

### 1. API 响应结构

当 API 调用失败时，提供商会返回包含错误信息的响应。不同提供商的格式不同：

#### OpenAI 错误格式
```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": "invalid_api_key",
    "param": null
  }
}
```

#### Anthropic 错误格式
```json
{
  "error": {
    "type": "error",
    "error_type": "invalid_request_error",
    "message": "invalid api key"
  }
}
```

#### Google Gemini 错误格式
```json
{
  "error": {
    "code": 401,
    "message": "Request had invalid credentials.",
    "status": "UNAUTHENTICATED"
  }
}
```

### 2. 错误检测流程

```typescript
// 1. 发送 API 请求
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestData)
});

// 2. 检查 HTTP 状态码
if (!response.ok) {
  // 3. 解析错误响应
  const errorData = await response.json();

  // 4. 提取错误码
  const errorCode = errorData.error?.code;

  // 5. 根据错误码判断账号状态
  if (errorCode === 'invalid_api_key') {
    // 账号被封或无效
    await markAccountBanned(accountId);
  } else if (errorCode === 'rate_limit_exceeded') {
    // 触发速率限制
    await markAccountRateLimited(accountId);
  }
}
```

### 3. 错误码映射表

系统为每个提供商维护了详细的错误码映射表：

#### OpenAI 主要错误码

| 错误码 | 类型 | 说明 | 处理方式 |
|--------|------|------|----------|
| `invalid_api_key` | 账号被封 | API key 无效 | 禁用账号 |
| `account_deactivated` | 账号被封 | 账号被停用 | 禁用账号 |
| `rate_limit_exceeded` | 速率限制 | 超过速率限制 | 标记并降级 |
| `quota_exceeded` | 速率限制 | 超过配额 | 标记并降级 |
| `server_error` | 临时错误 | 服务器错误 | 重试 |
| `timeout` | 临时错误 | 请求超时 | 重试 |

#### Anthropic 主要错误码

| 错误码 | 类型 | 说明 | 处理方式 |
|--------|------|------|----------|
| `invalid_api_key` | 账号被封 | API key 无效 | 禁用账号 |
| `unauthorized` | 账号被封 | 未授权访问 | 禁用账号 |
| `rate_limit_error` | 速率限制 | 超过速率限制 | 标记并降级 |
| `overloaded_error` | 临时错误 | 服务过载 | 重试 |

#### Google Gemini 主要错误码

| 错误码 | 类型 | 说明 | 处理方式 |
|--------|------|------|----------|
| `API_KEY_INVALID` | 账号被封 | API key 无效 | 禁用账号 |
| `RATE_LIMIT_EXCEEDED` | 速率限制 | 超过速率限制 | 标记并降级 |
| `SERVER_ERROR` | 临时错误 | 服务器错误 | 重试 |

### 4. 自动化处理逻辑

```typescript
// 错误处理流程
async function handleApiError(accountId, error, providerType) {
  // 1. 检测错误类型
  const errorMapping = ErrorDetector.detectError(
    providerType,
    error.response
  );

  if (!errorMapping) {
    // 未知错误，仅记录
    await logError(accountId, error);
    return;
  }

  // 2. 根据错误类型执行相应操作
  switch (errorMapping.type) {
    case 'banned':
      // 账号被封，立即禁用
      await disableAccount(accountId);
      await sendAlert('账号被封: ' + errorMapping.description);
      break;

    case 'rate_limited':
      // 速率限制，记录并降级
      await incrementFailureCount(accountId);
      if (getFailureCount(accountId) >= 5) {
        await markAccountRateLimited(accountId);
        // 30分钟后自动恢复
        setTimeout(() => recoverAccount(accountId), 30 * 60 * 1000);
      }
      break;

    case 'temporarily_unavailable':
      // 临时错误，记录但不禁用
      await logTemporaryError(accountId, error);
      break;

    default:
      // 其他错误，仅记录
      await logError(accountId, error);
  }
}
```

---

## 实际示例

### 场景 1：账号被封

```bash
# 1. 发送请求
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [...]}'

# 2. 收到响应（HTTP 401）
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}

# 3. 系统自动处理
# - 检测到错误码：invalid_api_key
# - 识别为：账号被封（banned）
# - 自动操作：
#   a. 将账号状态设为 "banned"
#   b. 发送告警通知
#   c. 切换到其他可用账号
#   d. 记录到路由日志
```

### 场景 2：速率限制

```bash
# 1. 发送请求
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [...]}'

# 2. 收到响应（HTTP 429）
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded"
  }
}

# 3. 系统自动处理
# - 检测到错误码：rate_limit_exceeded
# - 识别为：速率限制（rate_limited）
# - 自动操作：
#   a. 增加失败计数（+1）
#   b. 如果连续失败 5 次，标记为 "rate_limited"
#   c. 30 分钟后自动恢复
#   d. 期间自动切换到其他账号
```

### 场景 3：临时服务器错误

```bash
# 1. 发送请求
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [...]}'

# 2. 收到响应（HTTP 500）
{
  "error": {
    "message": "Internal server error",
    "type": "server_error",
    "code": "server_error"
  }
}

# 3. 系统自动处理
# - 检测到错误码：server_error
# - 识别为：临时错误（temporarily_unavailable）
# - 自动操作：
#   a. 记录错误日志
#   b. 不禁用账号
#   c. 自动重试（使用其他账号）
#   d. 稍后可以继续使用该账号
```

---

## 如何监控账号状态

### 查看实时状态

```bash
# 获取账号健康状态
curl http://localhost:3000/admin/providers/{providerId}/accounts/{accountId}/health

# 响应示例
{
  "accountId": "xxx",
  "status": "active",           # 当前状态
  "health": {
    "successRate": 95.5,        # 成功率
    "totalRequests": 1000,      # 总请求数
    "errorRate": 4.5,           # 错误率
    "avgLatencyMs": 150,        # 平均延迟
    "recentErrors": 45,         # 最近错误数
    "recentRateLimited": 0,     # 最近限流次数
    "recentBanned": 0           # 最近封号次数
  },
  "lastSuccessAt": "2025-01-15T10:30:00Z",
  "lastFailureAt": "2025-01-15T10:25:00Z"
}
```

### 查看错误日志

```bash
# 获取账号使用日志
curl "http://localhost:3000/admin/account-usage-logs?accountId={id}&limit=10"

# 响应示例
{
  "logs": [
    {
      "id": "xxx",
      "accountId": "xxx",
      "status": "banned",           # 错误状态
      "errorCode": "invalid_api_key", # 错误码
      "errorMessage": "Invalid API key",
      "createdAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "yyy",
      "accountId": "xxx",
      "status": "rate_limited",
      "errorCode": "rate_limit_exceeded",
      "errorMessage": "Rate limit exceeded",
      "createdAt": "2025-01-15T10:25:00Z"
    }
  ]
}
```

---

## 最佳实践

### 1. 账号管理

```markdown
✅ 推荐做法：
- 准备 3-5 个账号作为备用
- 定期检查账号状态
- 设置合理的速率限制（略低于官方限制）
- 使用官方注册的账号（更稳定）

❌ 避免做法：
- 使用来源不明的账号
- 单一账号承载所有请求
- 忽略错误日志
- 超过账号配额使用
```

### 2. 监控和告警

```markdown
建议监控：
- 账号成功率（低于 80% 需要关注）
- 错误率突增（可能账号有问题）
- 账号被封/限流事件
- 路由切换频率

建议设置告警：
- 账号被封：立即通知
- 连续失败 3 次：警告
- 成功率低于 70%：警告
- 所有账号不可用：紧急通知
```

### 3. 故障处理

```markdown
账号被封后：
1. 确认封号原因
2. 如果是误封，联系官方申诉
3. 如果无法恢复，添加新账号到账号池
4. 系统会自动切换到其他账号

速率限制后：
1. 系统自动在 30 分钟后恢复
2. 期间自动使用其他账号
3. 可以手动恢复（修改状态为 active）
```

---

## 总结

### 账号来源
1. **官方注册**：最安全，但门槛高
2. **第三方购买**：常见，但有风险
3. **企业账号**：适合商业使用
4. **租赁/共享**：适合测试

### 错误检测
1. **原理**：解析 API 响应的错误码
2. **自动处理**：根据错误类型执行相应操作
3. **实时监控**：持续追踪账号健康状态
4. **智能切换**：自动切换到可用账号

### 关键优势
- ✅ 自动检测账号问题
- ✅ 智能故障切换
- ✅ 降低账号封号风险
- ✅ 提高服务可用性

---

## 相关文档

- [账号池系统使用指南](./ACCOUNT_POOL_GUIDE.md)
- [快速开始](./QUICK_START.md)
- [错误码完整列表](./ERROR_CODES.md)

## 获取帮助

如有疑问，请提交 Issue 或联系社区支持。
