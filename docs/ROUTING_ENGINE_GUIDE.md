# 智能路由引擎使用指南

## 📖 概述

LMRouter 智能路由引擎是账号池系统的核心功能，它能够根据不同的策略自动选择最优的 API 提供商和账号，从而优化性能、降低成本、提高可靠性。

---

## 🎯 核心功能

### 1. 多种路由策略

| 策略 | 名称 | 适用场景 | 优化目标 |
|------|------|----------|----------|
| **Nitro** | 速度优先 | 实时对话、交互式应用 | 最低 TTFT |
| **Floor** | 价格优先 | 批量处理、离线任务 | 最低成本 |
| **Balanced** | 平衡模式 | 通用场景 | 综合最优 |

### 2. 性能监控

- **TTFT 追踪**：实时监控首字延迟
- **吞吐量监控**：跟踪 tokens/second
- **成功率统计**：计算请求成功率
- **成本追踪**：记录每次请求成本

### 3. 智能故障转移

- 自动检测账号失败
- 切换到备选方案
- 最多尝试 3 次
- 记录故障日志

---

## 🚀 快速开始

### 1. 选择路由策略

#### 方法 1：通过 API Header 指定

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-test-key" \
  -H "X-Routing-Strategy: nitro" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

#### 方法 2：通过请求参数指定

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-test-key" \
  -d '{
    "model": "gpt-4:nitro",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

**支持的模型后缀**：
- `:nitro` - 速度优先
- `:floor` - 价格优先
- `:balanced` - 平衡模式（默认）

### 2. 查看路由决策

响应中包含路由信息：

```json
{
  "id": "chatcmpl-xxx",
  "choices": [...],
  "usage": {...},
  "router": {
    "strategy": "nitro",
    "selected_provider": "openai",
    "selected_account": "openai-account-1",
    "reason": "Selected for lowest TTFT: 120ms",
    "alternatives": [
      {
        "provider_id": "anthropic",
        "account_id": "anthropic-account-1",
        "score": 85
      }
    ],
    "estimated_cost": 0.0023,
    "ttft_ms": 120
  }
}
```

---

## 📊 路由策略详解

### Nitro 策略（速度优先）

**适用场景**：
- 实时对话应用
- 聊天机器人
- 交互式 AI 应用

**优化目标**：
- 最低 TTFT（Time to First Token）
- 最高吞吐量

**评分公式**：
```
总得分 = TTFT得分 × 0.7 + 吞吐量得分 × 0.3

其中：
- TTFT得分 = 100 - ((实际TTFT - 100) / (5000 - 100)) × 100
- 吞吐量得分 = ((实际吞吐量 - 10) / (100 - 10)) × 100
```

**示例**：

```typescript
// 使用 Nitro 策略
const response = await fetch('/openai/v1/chat/completions', {
  headers: {
    'X-Routing-Strategy': 'nitro'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: '快速响应我！' }]
  })
});

// 预期结果：
// - 选择 TTFT 最低的账号（如 120ms）
// - 适合需要快速响应的场景
```

---

### Floor 策略（价格优先）

**适用场景**：
- 批量文本处理
- 离线文档分析
- 大规模数据处理

**优化目标**：
- 最低每 1K tokens 价格
- 最小化总成本

**评分公式**：
```
价格得分 = 100 - ((实际价格 - 0.0001) / (0.1 - 0.0001)) × 100

价格越低，得分越高
```

**示例**：

```typescript
// 使用 Floor 策略
const response = await fetch('/openai/v1/chat/completions', {
  headers: {
    'X-Routing-Strategy': 'floor'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: '分析这个长文档...' }]
  })
});

// 预期结果：
// - 选择价格最低的账号
// - 适合成本敏感的场景
// - 可以节省 20-40% 的成本
```

---

### Balanced 策略（平衡模式）

**适用场景**：
- 通用 AI 应用
- 不确定最优策略时
- 需要综合考虑的场景

**优化目标**：
- 综合考虑价格、速度、可靠性
- 权重：价格 35%、速度 35%、可靠性 30%

**评分公式**：
```
总得分 = 价格得分 × 0.35 + 速度得分 × 0.35 + 可靠性得分 × 0.30

其中：
- 价格得分：基于每 1K tokens 价格
- 速度得分：TTFT × 0.7 + 吞吐量 × 0.3
- 可靠性得分：成功率 × 0.5 + 可用性 × 0.3 + (1-错误率) × 0.2
```

**示例**：

```typescript
// 使用 Balanced 策略（默认）
const response = await fetch('/openai/v1/chat/completions', {
  headers: {
    'X-Routing-Strategy': 'balanced'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

// 预期结果：
// - 选择综合得分最高的账号
// - 平衡了价格、速度和可靠性
// - 适合大多数场景
```

---

## 🔧 高级用法

### 1. 自定义 Balanced 策略权重

```typescript
import { BalancedStrategy } from './engine/routing/strategies/balanced';

const strategy = new BalancedStrategy();

// 自定义权重
strategy.setWeights({
  price: 0.5,      // 价格权重 50%
  speed: 0.3,      // 速度权重 30%
  reliability: 0.2  // 可靠性权重 20%
});
```

### 2. 手动指定供应商

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "X-Preferred-Provider: openai" \
  -H "X-Preferred-Account: openai-account-1" \
  -d '{
    "model": "gpt-4",
    "messages": [...]
  }'
```

### 3. 设置成本上限

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "X-Max-Cost: 0.01" \
  -d '{
    "model": "gpt-4",
    "messages": [...]
  }'
```

### 4. 设置延迟上限

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "X-Max-Latency: 1000" \
  -d '{
    "model": "gpt-4",
    "messages": [...]
  }'
```

---

## 📈 性能监控

### 查看实时性能指标

```bash
# 获取账号性能统计
curl http://localhost:3000/admin/providers/{providerId}/accounts/{accountId}/stats

# 响应示例
{
  "accountId": "xxx",
  "stats": {
    "totalRequests": 1000,
    "successRate": 98.5,
    "avgTtftMs": 150,
    "avgLatencyMs": 1200,
    "throughputTps": 75,
    "totalCost": 2.5,
    "errorRate": 1.5
  },
  "timeRange": "1h"
}
```

### 对比多个供应商

```bash
# 性能对比
curl "http://localhost:3000/admin/metrics/compare?model=gpt-4&timeRange=24h"

# 响应示例
{
  "comparison": [
    {
      "providerId": "openai",
      "accountId": "openai-account-1",
      "avgTtftMs": 120,
      "avgCostPer1kTokens": 0.002,
      "successRate": 99.0,
      "totalRequests": 500
    },
    {
      "providerId": "anthropic",
      "accountId": "anthropic-account-1",
      "avgTtftMs": 180,
      "avgCostPer1kTokens": 0.003,
      "successRate": 98.5,
      "totalRequests": 450
    }
  ]
}
```

---

## 🛡️ 故障处理

### 自动故障转移

当主供应商失败时，系统会自动切换到备选方案：

```typescript
// 最多尝试 3 个备选方案
const result = await routingEngine.execute(decision, context, async (decision) => {
  // 发送请求
  return await sendRequest(decision);
});

// 结果包含故障转移信息
console.log(result.fallbackUsed);   // 是否使用了备选方案
console.log(result.fallbackCount);  // 备选方案使用次数
```

### 查看故障日志

```bash
curl "http://localhost:3000/admin/routing-logs?status=failed"

# 响应示例
{
  "logs": [
    {
      "id": "xxx",
      "modelName": "gpt-4",
      "strategy": "nitro",
      "selectedProvider": "openai",
      "selectedAccount": "openai-account-1",
      "status": "failed",
      "errorMessage": "Rate limit exceeded",
      "fallbackUsed": true,
      "fallbackCount": 1,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🧪 测试和调试

### 使用 MockLLM 测试路由

```bash
# 1. 启动 MockLLM 服务器
python -m mockllm --port 8000 &
python -m mockllm --port 8001 &
python -m mockllm --port 8002 &

# 2. 使用测试配置启动 LMRouter
LMROUTER_CONFIG=$(base64 -w0 config/mockllm.yaml) pnpm start

# 3. 测试不同的路由策略
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "X-Routing-Strategy: nitro" \
  -d '{"model": "gpt-4-mock", "messages": [...]}'
```

### 查看路由决策详情

```bash
# 获取最新的路由日志
curl "http://localhost:3000/admin/routing-logs?limit=1"

# 响应包含完整的决策信息
{
  "log": {
    "requestId": "req_xxx",
    "modelName": "gpt-4",
    "strategy": "nitro",
    "selectedProvider": "openai",
    "selectedAccount": "openai-account-1",
    "decisionReason": "Selected for lowest TTFT: 120ms",
    "alternatives": [...],
    "ttftMs": 125,
    "totalLatencyMs": 1234,
    "inputTokens": 100,
    "outputTokens": 50,
    "cost": 0.0023,
    "status": "success"
  }
}
```

---

## 💡 最佳实践

### 1. 选择合适的策略

```markdown
✅ Nitro（速度优先）
- 实时对话应用
- 聊天机器人
- 需要快速响应的场景

✅ Floor（价格优先）
- 批量处理
- 离线任务
- 成本敏感的场景

✅ Balanced（平衡模式）
- 通用应用
- 不确定最优策略时
- 需要综合考虑的场景
```

### 2. 监控性能指标

```markdown
建议定期检查：
- TTFT 是否符合预期
- 成本是否在预算内
- 成功率是否保持在 95% 以上
- 是否频繁触发故障转移
```

### 3. 优化账号配置

```markdown
提高路由效果：
- 为每个账号设置准确的定价信息
- 保持账号状态更新
- 定期检查性能指标
- 移除长期故障的账号
```

### 4. 设置合理的阈值

```markdown
成本控制：
- 设置最大成本上限
- 监控每月总费用
- 使用 Floor 策略优化成本

性能优化：
- 设置最大延迟上限
- 使用 Nitro 策略优化速度
- 监控 TTFT 指标

可靠性优化：
- 设置最低成功率要求
- 使用 Balanced 策略
- 准备足够的备选账号
```

---

## 🔍 故障排查

### 问题：所有请求都使用同一个账号

**可能原因**：
- 其他账号状态不是 `active`
- 其他账号达到速率限制
- 其他账号成功率过低

**解决方案**：
```bash
# 检查账号状态
curl http://localhost:3000/admin/providers/{id}/accounts

# 查看账号健康状态
curl http://localhost:3000/admin/providers/{id}/accounts/{accountId}/health
```

### 问题：路由策略不生效

**可能原因**：
- Header 名称错误
- 模型后缀格式错误
- 用户手动指定了供应商

**解决方案**：
```bash
# 正确的 Header 名称
X-Routing-Strategy: nitro

# 正确的模型后缀格式
model: "gpt-4:nitro"

# 检查是否有手动指定
X-Preferred-Provider: openai  # 这会覆盖策略
```

### 问题：成本过高

**解决方案**：
```bash
# 1. 使用 Floor 策略
X-Routing-Strategy: floor

# 2. 设置成本上限
X-Max-Cost: 0.01

# 3. 检查定价配置
curl http://localhost:3000/admin/models/{modelId}/providers

# 4. 查看成本统计
curl "http://localhost:3000/admin/routing-logs?stats=cost"
```

---

## 📚 相关文档

- [账号池系统使用指南](./ACCOUNT_POOL_GUIDE.md)
- [账号来源和错误检测详解](./ACCOUNT_SOURCE_AND_ERROR_DETECTION.md)
- [第二阶段实施总结](./PHASE2_SUMMARY.md)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License
