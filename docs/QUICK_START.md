# 账号池系统 - 快速开始

这是一个 5 分钟的快速开始指南，帮助你快速上手 LMRouter 账号池系统。

## 🎯 适用场景

- 你有多个 OpenAI/Anthropic 账号，想要统一管理
- 你担心账号被封，需要自动故障切换
- 你想要降低 API 调用成本，智能选择最便宜的账号
- 你需要提高请求成功率，避免单点故障

## 📋 前置要求

- Node.js 18+
- PostgreSQL 数据库
- 已有的 LMRouter 项目（克隆并安装依赖）

## 🚀 第一步：数据库设置

### 1. 生成并执行数据库迁移

```bash
# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate
```

这将创建以下表：
- `providers` - 供应商
- `provider_accounts` - 账号池
- `models` - 模型
- `model_providers` - 模型-供应商关联
- `account_usage_logs` - 使用日志
- `routing_logs` - 路由日志
- `tenants` - 租户
- `user_tenants` - 用户-租户关联

## 🏢 第二步：创建供应商

### 示例：添加 OpenAI 供应商

```bash
curl -X POST http://localhost:3000/admin/providers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "openai",
    "displayName": "OpenAI",
    "type": "openai",
    "baseUrl": "https://api.openai.com/v1",
    "description": "OpenAI API",
    "website": "https://openai.com",
    "priority": 1
  }'
```

响应示例：

```json
{
  "provider": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "openai",
    "displayName": "OpenAI",
    "type": "openai",
    "baseUrl": "https://api.openai.com/v1",
    "status": "active",
    "priority": 1,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

## 🔑 第三步：添加账号到账号池

### 示例：添加多个 OpenAI 账号

```bash
# 账号 1
curl -X POST http://localhost:3000/admin/providers/{providerId}/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "openai-account-1",
    "apiKey": "sk-proj-xxx...",
    "rpmLimit": 100,
    "tpmLimit": 90000,
    "weight": 100,
    "priority": 0
  }'

# 账号 2
curl -X POST http://localhost:3000/admin/providers/{providerId}/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "openai-account-2",
    "apiKey": "sk-proj-yyy...",
    "rpmLimit": 100,
    "tpmLimit": 90000,
    "weight": 100,
    "priority": 1
  }'

# 账号 3
curl -X POST http://localhost:3000/admin/providers/{providerId}/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "openai-account-3",
    "apiKey": "sk-proj-zzz...",
    "rpmLimit": 100,
    "tpmLimit": 90000,
    "weight": 100,
    "priority": 2
  }'
```

**参数说明**：
- `accountName`: 账号名称（便于识别）
- `apiKey`: OpenAI API 密钥
- `rpmLimit`: 每分钟请求数限制
- `tpmLimit`: 每分钟 Token 数限制
- `weight`: 权重（用于负载均衡，数值越大优先级越高）
- `priority`: 优先级（数值越小优先级越高）

## 🤖 第四步：配置模型

### 创建模型

```bash
curl -X POST http://localhost:3000/admin/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "gpt-4",
    "displayName": "GPT-4 Turbo",
    "type": "language",
    "description": "OpenAI GPT-4 Turbo model",
    "contextWindow": 128000,
    "maxTokens": 4096
  }'
```

### 为模型添加供应商

```bash
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

## 🎯 第五步：测试账号池功能

### 方法 1：使用 API 直接测试

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-test-key" \
  -H "X-Account-Strategy: success-rate-priority" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, this is a test!"}
    ]
  }'
```

**响应头说明**：
- `X-Account-Strategy`: 账号选择策略
  - `success-rate-priority`: 成功率优先（默认）
  - `round-robin`: 轮询
  - `weighted-least-connections`: 加权最少连接
  - `random`: 随机

### 方法 2：使用 Python 测试

```python
import openai

client = openai.OpenAI(
    base_url="http://localhost:3000/openai/v1",
    api_key="sk-test-key"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### 方法 3：使用 JavaScript 测试

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3000/openai/v1',
  apiKey: 'sk-test-key'
});

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);
```

## 📊 第六步：监控账号状态

### 查看所有账号

```bash
curl http://localhost:3000/admin/providers/{providerId}/accounts
```

### 查看账号健康状态

```bash
curl http://localhost:3000/admin/providers/{providerId}/accounts/{accountId}/health
```

响应示例：

```json
{
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "health": {
    "successRate": 98.5,
    "totalRequests": 1000,
    "errorRate": 1.5,
    "avgLatencyMs": 150,
    "recentErrors": 15,
    "recentRateLimited": 0,
    "recentBanned": 0
  },
  "lastSuccessAt": "2025-01-15T10:30:00Z",
  "lastFailureAt": "2025-01-15T10:25:00Z"
}
```

### 查看路由日志

```bash
curl "http://localhost:3000/admin/routing-logs?limit=10"
```

## 🧪 第七步：使用 MockLLM 测试（可选）

如果你没有真实的 API 密钥，可以使用 MockLLM 进行测试。

### 1. 安装并启动 MockLLM

```bash
pip install mockllm

# 启动 3 个 MockLLM 服务器
python -m mockllm --port 8000 &
python -m mockllm --port 8001 &
python -m mockllm --port 8002 &
```

### 2. 使用测试配置启动 LMRouter

```bash
# 使用测试配置
LMROUTER_CONFIG=$(base64 -w0 config/mockllm.yaml) pnpm start
```

### 3. 测试路由功能

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-test-key" \
  -d '{
    "model": "gpt-4-mock",
    "messages": [
      {"role": "user", "content": "Hello from MockLLM!"}
    ]
  }'
```

## 🎉 完成！

现在你已经成功设置了 LMRouter 账号池系统。系统会自动：

- ✅ 智能选择最优账号
- ✅ 自动处理账号故障
- ✅ 监控账号健康状态
- ✅ 记录所有路由决策
- ✅ 在账号失败时自动切换

## 📚 下一步

- 阅读完整文档：[账号池系统使用指南](./ACCOUNT_POOL_GUIDE.md)
- 查看实施总结：[第一阶段总结](./PHASE1_SUMMARY.md)
- 了解路由策略：[路由策略详解](./ROUTING_STRATEGIES.md)

## 🆘 常见问题

### Q: 如何查看当前使用了哪个账号？

A: 查看路由日志：

```bash
curl "http://localhost:3000/admin/routing-logs?limit=1"
```

### Q: 账号被封后怎么办？

A: 系统会自动标记账号为 `banned` 状态并切换到其他账号。你需要：

1. 检查账号状态：`GET /admin/providers/{id}/accounts`
2. 解决封号问题
3. 手动恢复账号：`PUT /admin/providers/{id}/accounts/{accountId}` 设置 `status: "active"`

### Q: 如何调整账号选择策略？

A: 在 API 请求中添加 header：

```bash
-H "X-Account-Strategy: round-robin"
```

或在配置文件中设置默认策略。

### Q: 如何添加更多账号？

A: 重复第三步，使用 POST 请求添加新账号即可。

### Q: 系统如何防止账号被封？

A: 系统通过以下方式保护账号：

1. **速率限制管理**：严格遵守 RPM/TPM 限制
2. **智能轮换**：均匀分配请求到多个账号
3. **故障检测**：及时检测并隔离有问题的账号
4. **自动降级**：连续失败后自动降低账号优先级

## 💡 最佳实践

1. **至少准备 3-5 个账号**：提高容错能力
2. **合理设置速率限制**：略低于官方限制
3. **监控账号状态**：定期检查健康状态
4. **使用测试环境**：先用 MockLLM 测试再上线
5. **记录路由日志**：便于问题排查和优化

## 📞 获取帮助

- GitHub Issues: [提交问题](https://github.com/LMRouter/lmrouter/issues)
- 文档: [完整文档](https://docs.lmrouter.com)
- Discord: [加入社区](https://discord.gg/lmrouter)

---

**祝你使用愉快！** 🎊
