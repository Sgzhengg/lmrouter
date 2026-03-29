# 智能路由引擎测试指南

## 📖 概述

本文档介绍如何测试 LMRouter 智能路由引擎的功能，包括路由策略、场景识别、性能监控等核心功能。

---

## 🚀 快速开始

### 方式 1：使用 MockLLM 进行集成测试（推荐）

这种方式会启动真实的 MockLLM 服务器，模拟完整的 API 调用流程。

#### 前置要求

```bash
# 1. 安装 Python 和 MockLLM
pip install mockllm

# 2. 构建项目
pnpm build

# 3. 启动 LMRouter（使用 MockLLM 配置）
LMROUTER_CONFIG=$(base64 -w0 config/mockllm.yaml) pnpm start
```

#### 运行测试

```bash
# 在另一个终端运行测试
pnpm test:mockllm
```

#### 测试内容

1. **基础路由功能** - 验证路由引擎正常工作
2. **Nitro 策略** - 测试速度优先路由
3. **Floor 策略** - 测试价格优先路由
4. **场景感知路由** - 测试自动场景识别
5. **故障转移** - 测试自动切换供应商
6. **性能指标收集** - 测试 TTFT、吞吐量等指标

#### 预期输出

```
============================================================
LMRouter 智能路由引擎 - MockLLM 集成测试
============================================================

启动 MockLLM 服务器
✓ 启动 MockLLM 服务器 (端口 8000)
✓ MockLLM 服务器 (端口 8000) 就绪
✓ 启动 MockLLM 服务器 (端口 8001)
✓ MockLLM 服务器 (端口 8001) 就绪
✓ 启动 MockLLM 服务器 (端口 8002)
✓ MockLLM 服务器 (端口 8002) 就绪

✅ 所有 MockLLM 服务器已启动

============================================================
测试 1: 基础路由功能
============================================================

✓ 请求成功
✓ 模型: gpt-4-mock
✓ 响应: Hello! I'm a mock LLM server.

路由信息:
- 策略: balanced
- 选择的供应商: mockllm-1
- 决策原因: Selected for best balance
- 备选方案: 2 个

✅ 测试通过

...（更多测试）
```

---

### 方式 2：纯逻辑测试（无需 MockLLM）

这种方式直接测试路由策略和场景识别的逻辑，不需要外部服务。

#### 运行测试

```bash
pnpm test:routing
```

#### 测试内容

1. **路由策略对比** - 对比三种策略的选择结果
2. **场景识别** - 测试 7 种场景的识别
3. **成本估算** - 计算不同模型的成本节省
4. **策略评分** - 验证评分算法正确性

#### 预期输出

```
============================================================
LMRouter 智能路由引擎 - 功能测试
============================================================

这个脚本测试路由引擎的核心逻辑，不需要真实的 API 调用
包括：路由策略、场景识别、成本估算等

============================================================
测试 1: Nitro 策略（速度优先）
============================================================

✓ 策略: nitro
✓ 选择供应商: openai-official
✓ 选择账号: openai-account-1
✓ 决策原因: Selected for lowest TTFT: 120ms
✓ 预估成本: $0.025000
✓ 预估延迟: 120ms
✓ 备选方案: 2 个

✅ 测试通过：选择了最快的供应商

...（更多测试）
```

---

### 方式 3：单元测试

运行针对各个模块的单元测试。

```bash
# 运行所有单元测试
pnpm test:unit

# 运行路由策略测试
pnpm test tests/unit/routing-strategies.test.ts

# 运行场景识别器测试
pnpm test tests/unit/scenario-recognizer.test.ts
```

---

## 📊 测试场景详解

### 场景 1：速度优先路由（Nitro 策略）

**目标**：验证系统选择 TTFT 最低的供应商

**测试步骤**：
1. 发送请求时指定策略为 `nitro`
2. 系统评估所有供应商的速度得分
3. 选择 TTFT 最低的供应商

**验证点**：
- ✅ 选择了 TTFT 最小的供应商
- ✅ 响应速度符合预期
- ✅ 备选方案按速度排序

### 场景 2：价格优先路由（Floor 策略）

**目标**：验证系统选择价格最低的供应商

**测试步骤**：
1. 发送请求时指定策略为 `floor`
2. 系统计算每个供应商的成本
3. 选择价格最低的供应商

**验证点**：
- ✅ 选择了价格最低的供应商
- ✅ 成本计算正确
- ✅ 实现了成本节省

### 场景 3：场景感知路由

**目标**：验证系统能自动识别使用场景并推荐模型

**测试用例**：

| 场景 | 用户消息 | 识别结果 | 推荐模型 | 预期节省 |
|------|---------|---------|---------|---------|
| 代码生成 | "帮我写一个快速排序算法" | `code-generation` | `claude-3-opus` | - |
| 简单问答 | "你好，请问现在几点了？" | `simple-qa` | `gpt-3.5-turbo` | 95% |
| 复杂推理 | "求解方程：x² + 2x + 1 = 0" | `complex-reasoning` | `gpt-4-turbo` | - |
| 创意写作 | "帮我写一篇科幻小说" | `creative-writing` | `claude-3-sonnet` | - |

**验证点**：
- ✅ 场景识别准确
- ✅ 模型推荐合理
- ✅ 成本节省计算正确

---

## 🧪 手动测试

### 测试路由策略

```bash
# 1. Nitro 策略（速度优先）
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-test-key" \
  -H "X-Routing-Strategy: nitro" \
  -d '{
    "model": "gpt-4-mock",
    "messages": [{"role": "user", "content": "Quick response!"}]
  }'

# 2. Floor 策略（价格优先）
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "X-Routing-Strategy: floor" \
  -d '{"model": "gpt-4-mock", "messages": [...]}'

# 3. 使用模型后缀
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -d '{"model": "gpt-4-mock:nitro", "messages": [...]}'
```

### 查看路由决策

响应中的 `router` 字段包含完整的路由信息：

```json
{
  "id": "chatcmpl-xxx",
  "choices": [...],
  "router": {
    "strategy": "nitro",
    "selected_provider": "mockllm-1",
    "selected_account": "mockllm-account-1",
    "decision_reason": "Selected for lowest TTFT: 100ms",
    "alternatives": [
      {
        "provider_id": "mockllm-2",
        "account_id": "mockllm-account-2",
        "score": 85
      }
    ],
    "estimated_cost": 0.0023,
    "ttft_ms": 100
  }
}
```

---

## 🔍 故障排查

### 问题 1：MockLLM 服务器启动失败

**症状**：
```
❌ 启动 MockLLM 服务器 (端口 8000) 失败
Error: listen EADDRINUSE 0.0.0.0:8000
```

**解决方案**：
```bash
# 检查端口占用
lsof -i :8000

# 杀死占用端口的进程
kill -9 <PID>

# 或使用其他端口
```

### 问题 2：LMRouter 服务未运行

**症状**：
```
❌ LMRouter 服务未运行
```

**解决方案**：
```bash
# 启动 LMRouter
LMROUTER_CONFIG=$(base64 -w0 config/mockllm.yaml) pnpm start

# 或使用开发模式
pnpm dev
```

### 问题 3：路由策略不生效

**症状**：
```
所有请求都使用同一个供应商
```

**可能原因**：
1. 其他供应商状态不是 `active`
2. 其他供应商达到速率限制
3. Header 名称错误

**解决方案**：
```bash
# 检查供应商状态
curl http://localhost:3000/admin/providers

# 检查账号状态
curl http://localhost:3000/admin/providers/{id}/accounts

# 使用正确的 Header
X-Routing-Strategy: nitro  # 正确
X-Strategy: nitro         # 错误
```

---

## 📈 性能指标说明

### TTFT（Time to First Token）

- **定义**：从发送请求到收到第一个 token 的时间
- **单位**：毫秒（ms）
- **越低越好**：理想的 TTFT < 200ms

### 吞吐量（Throughput）

- **定义**：每秒生成的 token 数量
- **单位**：tokens/second
- **越高越好**：理想的吞吐量 > 50 tokens/s

### 成功率（Success Rate）

- **定义**：成功请求占总请求的百分比
- **单位**：百分比（%）
- **越高越好**：理想的成功率 > 95%

---

## 📚 相关文档

- [路由引擎使用指南](./ROUTING_ENGINE_GUIDE.md)
- [场景识别器实现](../src/engine/routing/scenario-recognizer.ts)
- [第二阶段实施总结](./PHASE2_SUMMARY.md)

---

## 🤝 贡献

欢迎提交测试用例和改进建议！

---

## 📄 许可证

MIT License
