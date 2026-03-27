# Zeabur 部署指南

## 🔧 问题修复

已修复以下 Zeabur 部署问题：

### 问题 1：配置文件缺失
**原因**：`config/config.yaml` 被 `.gitignore` 忽略，未推送到 GitHub

**解决方案**：
- 创建了 `config/config.prod.yaml` 生产环境配置
- 更新 `zeabur.yaml` 使用 `config.prod.yaml`
- 支持通过环境变量配置 API 密钥

### 问题 2：前端服务未显示
**原因**：Zeabur 配置和环境变量设置不正确

**解决方案**：
- 更新前端 `zeabur.yaml` 使用正确的环境变量名
- 更新 `Dockerfile` 支持运行时环境变量注入
- 创建 `nginx.conf.template` 模板文件

---

## 🚀 完整部署步骤

### 1. 准备工作

确保代码已推送到 GitHub：
```bash
git push origin staging
```

### 2. 部署后端服务

#### 步骤：

1. 登录 [Zeabur](https://zeabur.com)
2. 点击 **"New Project"**（新建项目）
3. 选择 **"Deploy from GitHub"**
4. 选择仓库 `Sgzhengg/lmrouter`
5. 选择分支 `staging`
6. Root Path 设置为 `/`（后端根目录）
7. 点击 **"Deploy"**

#### 配置环境变量（可选）：

如果需要使用真实的 AI 模型，在 Zeabur 控制台添加环境变量：

```bash
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

### 3. 部署前端服务

#### 步骤：

1. 在同一项目中点击 **"Add Service"**（添加服务）
2. 选择 **"Git"**
3. Root Path 设置为 `/web`（前端目录）
4. 点击 **"Deploy"**

#### 配置服务链接：

前端会自动连接到后端。Zeabur 会自动设置 `VITE_API_BASE_URL` 环境变量指向后端服务。

### 4. 验证部署

#### 检查服务状态：

1. 等待两个服务都显示 **Running** 状态
2. 点击前端服务的 URL 访问 Web 控制台

#### 测试功能：

1. **聊天测试**
   - 选择模型（如 `gpt-4-turbo`）
   - 发送消息
   - 查看响应（会返回默认消息，因为使用的是演示配置）

2. **模型列表**
   - 应该显示配置的模型列表

3. **API 密钥管理**
   - 查看默认的演示密钥

---

## ⚙️ 配置真实 AI 模型

### 方式 1：通过 Zeabur 环境变量（推荐）

在后端服务中添加环境变量：

```bash
# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Google
GOOGLE_API_KEY=your-google-key

# DeepSeek
DEEPSEEK_API_KEY=sk-your-deepseek-key
```

然后修改 `config/config.prod.yaml` 或创建新的配置文件。

### 方式 2：修改配置文件

编辑 `config/config.prod.yaml`，添加真实的提供商配置：

```yaml
providers:
  openai:
    type: openai
    base_url: https://api.openai.com/v1
    api_key: ${OPENAI_API_KEY}

  anthropic:
    type: anthropic
    base_url: https://api.anthropic.com
    api_key: ${ANTHROPIC_API_KEY}
```

提交并推送更改：
```bash
git add config/config.prod.yaml
git commit -m "feat: 添加真实的 AI 提供商配置"
git push origin staging
```

在 Zeabur 中重新部署后端服务。

---

## 🐛 故障排查

### 后端服务启动失败

**检查日志**：
1. 在 Zeabur 控制台点击后端服务
2. 查看 "Logs" 标签
3. 查找错误信息

**常见问题**：

1. **配置文件错误**
   - 检查 `config.prod.yaml` 语法
   - 确保环境变量已设置

2. **依赖安装失败**
   - 检查 `package.json`
   - 清理缓存并重新部署

### 前端无法连接后端

**检查环境变量**：
1. 在前端服务中查看环境变量
2. 确认 `VITE_API_BASE_URL` 已设置
3. 值应该指向后端服务的 URL

**检查浏览器控制台**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签是否有错误
3. 查看 Network 标签检查 API 请求

### 模型列表为空

**原因**：生产环境配置使用的是演示配置，没有真实的 API 密钥

**解决**：
1. 添加真实的 API 密钥环境变量
2. 或修改配置文件添加真实的提供商

---

## 📝 部署检查清单

### 后端
- [ ] 代码已推送到 GitHub
- [ ] Zeabur 项目已创建
- [ ] 后端服务已部署
- [ ] 服务状态为 Running
- [ ] 环境变量已配置（如需要）

### 前端
- [ ] 前端服务已部署
- [ ] 服务状态为 Running
- [ ] `VITE_API_BASE_URL` 已设置
- [ ] 可以访问前端 URL

### 测试
- [ ] 前端页面可以正常加载
- [ ] 聊天功能可以工作
- [ ] 模型列表正常显示
- [ ] 浏览器控制台无错误

---

## 🔗 相关链接

- [Zeabur 文档](https://zeabur.com/docs)
- [项目结构说明](./PROJECT_STRUCTURE.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- [主 README](./README.md)

---

## 💡 提示

- 使用演示配置时，AI 会返回默认消息
- 生产环境建议启用认证并使用真实的 API 密钥
- 可以通过 Zeabur 的环境变量功能动态配置 API 密钥
- 前端会自动连接到同一项目中的后端服务
