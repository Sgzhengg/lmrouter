# 账号池系统使用指南

## 📖 概述

LMRouter 账号池系统提供了智能的多账号管理和负载均衡功能，特别适合以下场景：

- **多账号池管理**：为同一个 API 提供商配置多个账号，实现负载均衡
- **故障自动切换**：当某个账号出现问题时，自动切换到其他可用账号
- **防止封号**：通过智能轮换和速率限制管理，降低账号被封风险
- **成本优化**：根据账号配额和成本，智能选择最优账号

## 🚀 快速开始

### 1. 数据库迁移

首先需要创建数据库表：

```bash
# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate
```

### 2. 创建供应商

```bash
curl -X POST http://localhost:3000/admin/providers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "openai",
    "displayName": "OpenAI",
    "type": "openai",
    "baseUrl": "https://api.openai.com/v1",
    "priority": 1
  }'
```

### 3. 添加账号到账号池

```bash
curl -X POST http://localhost:3000/admin/providers/{providerId}/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "openai-account-1",
    "apiKey": "sk-xxx...",
    "rpmLimit": 100,
    "tpmLimit": 90000,
    "weight": 100,
    "priority": 0
  }'
```

### 4. 配置模型

```bash
# 创建模型
curl -X POST http://localhost:3000/admin/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "gpt-4",
    "displayName": "GPT-4",
    "type": "language",
    "contextWindow": 8192,
    "maxTokens": 4096
  }'

# 为模型添加供应商
curl -X POST http://localhost:3000/admin/models/{modelId}/providers \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "{providerId}",
    "providerModelName": "gpt-4-turbo-preview",
    "pricingInput": 0.01,
    "pricingOutput": 0.03,
    "priority": 0
  }'
```

## 🎯 账号选择策略

系统提供多种账号选择策略，可以通过 API 或配置文件指定：

### 1. Success Rate Priority（成功率优先，默认）

优先选择成功率最高的账号，适合生产环境。

```typescript
// API 调用时指定策略
const response = await fetch('/openai/v1/chat/completions', {
  headers: {
    'X-Account-Strategy': 'success-rate-priority'
  }
});
```

### 2. Round Robin（轮询）

均匀分配请求到各个账号，适合简单的负载均衡。

```typescript
const response = await fetch('/openai/v1/chat/completions', {
  headers: {
    'X-Account-Strategy': 'round-robin'
  }
});
```

### 3. Weighted Least Connections（加权最少连接）

优先选择负载最低的账号，考虑权重配置。

```typescript
const response = await fetch('/openai/v1/chat/completions', {
  headers: {
    'X-Account-Strategy': 'weighted-least-connections'
  }
});
```

### 4. Random（随机）

随机选择一个可用账号，适合测试环境。

```typescript
const response = await fetch('/openai/v1/chat/completions', {
  headers: {
    'X-Account-Strategy': 'random'
  }
});
```

## 🔧 账号状态管理

系统会自动管理账号状态：

- **active**：账号正常，可用于请求
- **rate_limited**：账号触发速率限制，暂时禁用（30分钟后自动恢复）
- **banned**：账号被封，需要手动处理
- **degraded**：账号连续失败多次，降级使用
- **maintenance**：维护模式，手动禁用

### 查看账号健康状态

```bash
curl http://localhost:3000/admin/providers/{providerId}/accounts/{accountId}/health
```

响应示例：

```json
{
  "accountId": "uuid",
  "status": "active",
  "health": {
    "successRate": 95.5,
    "totalRequests": 1000,
    "errorRate": 4.5,
    "avgLatencyMs": 150,
    "recentErrors": 45,
    "recentRateLimited": 0,
    "recentBanned": 0
  },
  "lastSuccessAt": "2025-01-15T10:30:00Z",
  "lastFailureAt": "2025-01-15T10:25:00Z"
}
```

## 🧪 测试环境

### 使用 MockLLM 进行测试

系统提供了 MockLLM 测试环境，可以在不产生真实 API 费用的情况下测试所有功能。

```bash
# 1. 启动 MockLLM 服务器（需要先安装 MockLLM）
pip install mockllm
python -m mockllm --port 8000 &
python -m mockllm --port 8001 &
python -m mockllm --port 8002 &

# 2. 使用测试配置启动 LMRouter
LMROUTER_CONFIG=$(base64 -w0 config/mockllm.yaml) pnpm start

# 3. 运行测试
pnpm test tests/integration/account-pool.test.ts
```

### 测试账号选择策略

```typescript
import { makeTestRequest, assertRoutingDecision } from './tests/helpers/mockllm';

// 测试 Nitro 策略（选择最快的账号）
const result = await makeTestRequest(
  'http://localhost:3000',
  'gpt-4-mock',
  'Hello, test message'
);

assertRoutingDecision(result.data, 'mockllm-1', 'nitro');
```

## 📊 监控和日志

### 查看路由日志

```bash
curl "http://localhost:3000/admin/routing-logs?limit=10&status=success"
```

### 查看账号使用统计

```bash
curl http://localhost:3000/admin/providers/{providerId}/accounts/{accountId}/stats
```

## 🛡️ 安全建议

1. **API 密钥加密**：生产环境必须启用 API 密钥加密存储
2. **访问控制**：管理 API 需要配置管理员权限
3. **审计日志**：记录所有管理操作
4. **速率限制**：为每个租户配置合理的速率限制

## 🔍 故障排查

### 问题：账号频繁被标记为 rate_limited

**解决方案**：
- 增加 `rpmLimit` 和 `tpmLimit` 配置
- 添加更多账号到账号池
- 降低请求频率

### 问题：账号总是选择同一个

**解决方案**：
- 检查账号权重配置是否合理
- 尝试使用不同的选择策略
- 查看账号成功率是否有明显差异

### 问题：所有账号都不可用

**解决方案**：
- 检查账号状态是否为 `active`
- 查看账号成功率是否过低
- 检查是否所有账号都达到速率限制

## 📚 API 文档

详细的 API 文档请参考：

- [供应商管理 API](./api/providers.md)
- [模型管理 API](./api/models.md)
- [账号池管理 API](./api/account-pool.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
