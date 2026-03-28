# LMRouter

<div align="center">

**开源的一体化 AI API 路由服务**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/LMRouter/lmrouter?style=social)](https://github.com/LMRouter/lmrouter)

一个统一的接口，连接所有 AI 模型提供商

[在线文档](https://docs.lmrouter.com) · [Web 控制台](#web-控制台) · [部署指南](#部署指南)

</div>

---

## 📖 简介

**LMRouter** 是一个开源的、一体化的 AI API 路由服务，为 AI 开发者提供单一、统一的方式来连接最优秀的模型提供商。

使用 LMRouter，你不需要在多个平台上创建账户或管理不同的 API 密钥。**一个 API 密钥**即可解锁对**任何提供商、任何模型、任何服务**的访问权限，全部通过一个接口实现。

这是 **OpenRouter 的开源替代方案**，但功能远超语言模型。LMRouter 原生支持多种模态和服务：

- **🤖 语言模型**：聊天补全、Responses API、Anthropic Messages
- **🎨 图像生成**：图片生成和编辑
- **🔊 音频处理**：语音转文字和音频模型
- **🎬 视频生成**：（即将推出）
- **🔍 向量嵌入**：语义搜索和 RAG
- **🌐 网络搜索**：Jina、Exa 等（即将推出）
- **💻 代码执行**：解释器如 e2b（即将推出）

---

## ✨ 主要特性

### 🔄 统一 API 接口

LMRouter 提供与现有 API **即插即用**的兼容性，已经使用 OpenAI 或 Anthropic 的应用无需修改即可集成：

```
OpenAI API
  /openai/v1/chat/completions     — 聊天补全
  /openai/v1/images/generations   — 图像生成
  /openai/v1/images/edits         — 图像编辑
  /openai/v1/embeddings           — 向量嵌入
  /openai/v1/responses            — Responses API
  /openai/v1/audio/speech         — 语音合成
  /openai/v1/audio/transcriptions — 语音转文字
  /openai/v1/audio/translations   — 翻译
  /openai/v1/models               — 模型列表

Anthropic API
  /anthropic/v1/messages          — 消息接口
  /anthropic/v1/models            — 模型列表
```

### 🌐 多提供商支持

LMRouter 连接整个 AI 生态系统，内置支持：

- **OpenAI 兼容** — OpenAI、Google、Perplexity、Fireworks、Groq、Cerebras 等
- **Anthropic 兼容** — Anthropic、Amazon Bedrock 等
- **Fireworks** — FLUX.1 [schnell] FP8、FLUX.1 Kontext Pro、FLUX.1 Kontext Max
- **Google** — Imagen、Gemini 图像生成等
- **国内模型** — DeepSeek、月之暗面、阿里云、字节跳动、智谱、百川等

### 🚀 多环境部署

LMRouter 基于 [Hono](https://hono.dev/) 构建，可在多种环境中运行：

- **Node.js** — 标准服务器部署
- **Cloudflare Workers** — 轻量级边缘部署
- **Zeabur** — 一键云端部署（详见下方）

### 🎯 Web 管理控制台

内置现代化的 Web 管理界面，提供：

- **💬 聊天测试** — 实时测试不同模型的对话能力
- **🤖 模型列表** — 查看所有可用模型及其提供商（支持 25+ 个模型）
- **🔑 API 密钥管理** — 统一管理 API 密钥
- **📊 用量统计** — 可视化查看调用次数和 Token 消耗

---

## 🚀 快速开始

### 方式一：本地部署

#### 前置要求

确保已安装以下软件：

- **Node.js** 18+
- **pnpm**（推荐）或 npm
- **Python** 3.11+（用于 MockLLM 测试）
- **Git**

#### 1. 克隆项目

```bash
git clone https://github.com/LMRouter/lmrouter.git
cd lmrouter
```

#### 2. 安装依赖

```bash
# 安装后端依赖
pnpm install

# 安装前端依赖
cd web && pnpm install && cd ..
```

#### 3. 构建项目

```bash
# 构建前端
cd web && pnpm build && cd ..

# 构建后端
pnpm build
```

#### 4. 配置服务

复制示例配置文件并根据需要修改：

```bash
cp config/config.example.yaml config/config.yaml
```

编辑 `config/config.yaml`，配置你的提供商和模型：

```yaml
providers:
  openai:
    type: openai
    base_url: https://api.openai.com/v1
    api_key: sk-your-api-key

  anthropic:
    type: anthropic
    base_url: https://api.anthropic.com
    api_key: sk-ant-your-api-key

models:
  gpt-4-turbo:
    providers:
      - provider: openai
        model: gpt-4-turbo-preview

  claude-3-opus:
    providers:
      - provider: anthropic
        model: claude-3-opus-20240229
```

#### 5. 启动服务

```bash
# 启动整合服务（前端 + 后端）
pnpm start
```

服务默认运行在 `http://127.0.0.1:3000`

访问 http://127.0.0.1:3000 即可看到 Web 管理界面。

#### 6. 使用 MockLLM 测试（推荐新手）

如果暂时没有真实的 API 密钥，可以使用 MockLLM 进行测试：

```bash
# 安装 MockLLM
pip install mockllm

# 启动 MockLLM（端口 8000）
python -m mockllm --port 8000

# 在另一个终端启动 LMRouter
pnpm start
```

MockLLM 会返回模拟的响应，方便测试和开发。

---

### 方式二：Zeabur 云端部署（推荐）

Zeabur 是一个现代化的部署平台，支持一键部署 LMRouter 到云端。

#### 📋 部署准备

1. **推送代码到 GitHub**

确保你的代码已推送到 GitHub 仓库。

2. **注册 Zeabur 账号**

访问 [Zeabur.com](https://zeabur.com) 并注册账号。

#### 🚀 一键部署

1. 登录 Zeabur，点击 **"New Project"**（新建项目）
2. 选择 **"Deploy from GitHub"**（从 GitHub 部署）
3. 授权访问你的 GitHub 仓库
4. 选择 `lmrouter` 仓库和 `staging` 分支
5. Zeabur 会自动识别根目录的 `Dockerfile`
6. 点击 **"Deploy"**（部署）

Zeabur 会自动：
- 检测 Dockerfile
- 构建前端（React 应用）
- 构建后端（Node.js 服务）
- 整合到单一容器
- 启动服务（默认端口 3000）

#### ⚙️ 配置域名和端口

部署完成后：

1. 进入服务的 **"网路"**（Networking）分页
2. 确认 **公开端口** 设置为 `3000`
3. 确认 **协议** 设置为 `HTTP`
4. 确认 **域名绑定** 正确（应该自动生成）

#### 🌍 环境变量配置（可选）

在服务的 **"变量"**（Variables）分页添加：

```bash
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=sk-your-key         # 可选：OpenAI API 密钥
ANTHROPIC_API_KEY=sk-ant-your-key # 可选：Anthropic API 密钥
```

#### ✅ 验证部署

1. 等待服务显示 **Running** 状态
2. 点击生成的域名访问 Web 控制台
3. 测试聊天功能和模型列表

#### 🐛 常见问题排查

**问题 1：502 Bad Gateway**

- **原因**：域名端口绑定错误
- **解决**：
  1. 在"网路"分页删除现有域名绑定
  2. 等待 1 分钟让 Zeabur 自动创建新的绑定
  3. 确认绑定到端口 `3000` 而不是 `web`

**问题 2：favicon.ico 404/502**

- **原因**：浏览器自动请求 favicon.ico
- **解决**：已在代码中添加处理（返回 204 No Content）

**问题 3：模型列表为空**

- **原因**：使用了错误的配置文件
- **解决**：确认使用 `config/config.prod.yaml`（包含 25 个模型）

---

## 🎯 Web 控制台使用指南

### 访问地址

- **本地开发**：http://127.0.0.1:3000
- **Zeabur 部署**：你的 Zeabur 域名（如：https://lmrouter.zeabur.app/）

### 功能介绍

#### 1. 聊天测试

选择模型进行实时对话测试：

1. 在左侧下拉菜单选择模型（如 `gpt-4-turbo`）
2. 在输入框输入消息
3. 点击发送按钮
4. 查看 AI 的回复

**支持的模型包括**：
- 国外模型：GPT-4/Claude/Gemini/DeepSeek 等
- 国内模型：豆包/通义/Kimi/智谱/文心/混元 等

#### 2. 模型列表

查看所有可用的 AI 模型（25+ 个）：

- 显示模型名称和提供商
- 支持搜索过滤
- 查看模型能力标签

#### 3. API 密钥管理

管理你的 LMRouter API 密钥：

- 查看当前使用的密钥
- 复制密钥到剪贴板
- 删除不需要的密钥

#### 4. 用量统计

可视化查看 API 使用情况：

- 请求次数统计
- Token 消耗趋势
- 模型使用分布

---

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 服务端口 | `3000` |
| `LMROUTER_CONFIG` | Base64 编码的配置文件 | - |
| `OPENAI_API_KEY` | OpenAI API 密钥 | - |
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | - |

### 配置文件结构

```yaml
server:
  host: 0.0.0.0          # 生产环境使用 0.0.0.0
  port: 3000
  logging: production    # 生产环境使用 production

auth:
  enabled: false         # 是否启用认证

providers:
  # 提供商配置

models:
  # 模型配置
```

### 提供商配置示例

#### OpenAI

```yaml
providers:
  openai:
    type: openai
    base_url: https://api.openai.com/v1
    api_key: sk-your-api-key
```

#### Anthropic

```yaml
providers:
  anthropic:
    type: anthropic
    base_url: https://api.anthropic.com
    api_key: sk-ant-your-api-key
```

#### 国内模型（DeepSeek）

```yaml
providers:
  deepseek:
    type: openai
    base_url: https://api.deepseek.com/v1
    api_key: sk-your-deepseek-key
```

---

## 💻 API 使用示例

### 聊天补全

```bash
curl http://127.0.0.1:3000/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-test-key-1" \
  -d '{
    "model": "gpt-4-turbo",
    "messages": [
      {"role": "user", "content": "你好，请介绍一下自己"}
    ]
  }'
```

### 获取模型列表

```bash
curl http://127.0.0.1:3000/v1/models \
  -H "Authorization: Bearer sk-test-key-1"
```

### Python 示例

```python
import openai

client = openai.OpenAI(
    base_url="http://127.0.0.1:3000/openai/v1",
    api_key="sk-test-key-1"
)

response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {"role": "user", "content": "你好！"}
    ]
)

print(response.choices[0].message.content)
```

### JavaScript 示例

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://127.0.0.1:3000/openai/v1',
  apiKey: 'sk-test-key-1'
});

const response = await client.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: [{ role: 'user', content: '你好！' }]
});

console.log(response.choices[0].message.content);
```

---

## 🛠️ 开发指南

### 项目结构

```
lmrouter/
├── src/                    # 后端源代码
│   ├── routes/            # API 路由
│   ├── adapters/          # AI 模型适配器
│   ├── middlewares/       # 中间件
│   ├── models/            # 数据模型
│   ├── utils/             # 工具函数
│   └── index.ts          # 入口文件
├── web/                   # 前端源代码（React + Vite）
│   ├── src/
│   │   ├── api/          # API 客户端
│   │   ├── components/   # React 组件
│   │   ├── pages/        # 页面组件
│   │   └── types/        # TypeScript 类型
│   ├── dist/             # 前端构建产物
│   ├── index.html        # HTML 模板
│   ├── package.json      # 前端依赖
│   └── vite.config.ts    # Vite 配置
├── config/               # 配置文件目录
│   ├── config.yaml       # 开发环境配置
│   └── config.prod.yaml  # 生产环境配置（Zeabur 使用）
├── Dockerfile            # 整合的前后端构建
├── package.json          # 后端依赖
└── README.md            # 本文档
```

### 架构说明

**前后端整合架构**：

- 后端 Node.js 服务（Hono 框架）
- 直接提供前端静态文件
- 单一端口（3000）服务所有请求
- 支持 SPA 路由

**路由优先级**：

1. `/assets/*` — 前端静态资源
2. `/favicon.ico` — 返回 204 No Content
3. `/api/health` — 健康检查
4. `/anthropic/*` — Anthropic API
5. `/openai/*` — OpenAI API
6. `/v1/*` — 通用 API
7. `/` — 前端 HTML
8. `/*` — SPA fallback（返回 index.html）

### 可用脚本

```bash
# 开发
pnpm dev              # 启动开发服务器（热重载）
pnpm dev:worker       # 启动 Cloudflare Workers 开发服务器

# 构建
pnpm build            # 构建项目（前端 + 后端）

# 运行
pnpm start            # 启动生产服务器（整合服务）

# 数据库
pnpm db:generate      # 生成数据库迁移
pnpm db:migrate       # 执行数据库迁移

# 部署
pnpm deploy           # 部署到 Cloudflare Workers
pnpm deploy:staging   # 部署到 staging 环境

# Lint
pnpm lint             # 检查代码风格
pnpm lint:fix         # 自动修复代码风格
```

---

## 🐛 故障排查

### 问题：后端无法启动

**解决方案：**

1. 检查 Node.js 版本（需要 18+）
   ```bash
   node --version
   ```

2. 清理缓存并重新安装依赖
   ```bash
   rm -rf node_modules
   pnpm install
   ```

3. 检查端口 3000 是否被占用
   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Linux/Mac
   lsof -i :3000
   ```

### 问题：前端页面显示 502

**Zeabur 部署特有问题：**

1. **检查域名端口绑定**
   - 进入"网路"分页
   - 确认域名绑定到端口 `3000`（不是 `web`）
   - 如果错误，删除绑定并重新创建

2. **查看实时日志**
   - 打开"日志"分页
   - 访问网站，观察是否有新请求记录
   - 如果没有记录，说明网关配置有问题

3. **重启服务**
   - 点击"重新部署"
   - 等待 3-5 分钟

### 问题：模型列表为空

**解决方案：**

1. 确认使用的是 `config/config.prod.yaml`（包含 25 个模型）
2. 检查后端日志是否有错误
3. 验证前端已正确构建（`web/dist/` 目录存在）

### 问题：favicon.ico 404/502

**解决方案：**

- 已在代码中添加处理（`src/app.ts`）
- 返回 204 No Content 而不是 HTML
- 如果仍有问题，清除浏览器缓存

---

## 📚 相关文档

- [完整部署指南](./DEPLOYMENT.md)
- [项目结构说明](./PROJECT_STRUCTURE.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- [Web 控制台文档](./web/README.md)
- [官方文档](https://docs.lmrouter.com)

---

## 🤝 贡献指南

我们相信 LMRouter 应该**由社区构建，为社区服务**。每一个贡献，无论是修复 bug、添加功能、改进文档，还是分享反馈，都能让 LMRouter 变得更强大。

### 贡献方式

1. **Fork** 本仓库
2. **创建** 特性分支 (`git checkout -b feature/my-feature`)
3. **提交** 更改 (`git commit -m 'Add some feature'`)
4. **推送** 到分支 (`git push origin feature/my-feature`)
5. **提交** Pull Request

### 开发路线图

查看我们的 [Kanban 看板](https://github.com/orgs/LMRouter/projects/1) 了解最新的开发计划。

### 初次贡献

如果你不确定从哪里开始，可以查看标记为 `good first issue` 的 issue。

**小提示**：即使只是修复一个错别字，也是有价值的贡献！如果你有大胆的想法，我们也很乐意听取。

---

## 📄 许可证

LMRouter 采用 **MIT 许可证**。详见 [LICENSE](LICENSE) 文件。

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=LMRouter/lmrouter&type=Date)](https://star-history.com/#LMRouter/lmrouter&Date)

---

## 💬 联系方式

- **GitHub Issues**: [提交问题](https://github.com/LMRouter/lmrouter/issues)
- **Discord**: [加入社区](https://discord.gg/lmrouter)
- **Email**: support@lmrouter.com

---

<div align="center">

**如果这个项目对你有帮助，请给它一个 ⭐️**

Made with ❤️ by LMRouter Contributors

</div>
