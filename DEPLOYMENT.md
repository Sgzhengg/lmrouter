# LMRouter 部署指南

本文档说明如何在 Zeabur 上分别部署 LMRouter 的前端和后端服务。

## 📋 项目结构

```
lmrouter/                    # 后端（LMRouter API）
├── src/                     # 后端源代码
├── config/                  # 配置文件
├── package.json
├── zeabur.yaml             # Zeabur 配置
└── Dockerfile              # Docker 配置（如需要）

lmrouter/web/               # 前端（Web Console）
├── src/                    # 前端源代码
├── package.json
├── Dockerfile             # Docker 配置
├── nginx.conf             # Nginx 配置
└── zeabur.yaml            # Zeabur 配置
```

## 🚀 部署步骤

### 方式一：通过 Zeabur 控制台部署

#### 1. 部署后端（LMRouter API）

1. 登录 [Zeabur](https://zeabur.com)
2. 创建新项目
3. 连接 GitHub 仓库
4. 选择 `lmrouter` 目录（后端）
5. 配置环境变量（如需要）：
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
6. 点击部署

#### 2. 部署前端（Web Console）

1. 在同一项目中创建新服务
2. 选择 `lmrouter/web` 目录（前端）
3. 配置环境变量：
   - `API_BASE_URL`: 后端服务的 URL（例如：`https://lmrouter-api.zeabur.app`）
4. 点击部署

### 方式二：使用 Zeabur CLI

```bash
# 安装 Zeabur CLI
npm install -g zeabur

# 登录
zeabur login

# 部署后端
cd /path/to/lmrouter
zeabur deploy

# 部署前端
cd /path/to/lmrouter/web
zeabur deploy
```

## 🔗 配置说明

### 前端配置

前端通过 nginx 代理请求到后端。在生产环境中，nginx.conf 中的 `${API_BASE_URL}` 会被替换为实际的后端 URL。

**环境变量：**
- `API_BASE_URL`: 后端 API 的完整 URL（例如：`https://lmrouter-api.zeabur.app`）

### 后端配置

后端使用 Node.js 运行，默认端口 3000。

**环境变量：**
- `NODE_ENV`: 运行环境（`production`）
- `PORT`: 监听端口（`3000`）
- `LMROUTER_CONFIG`: Base64 编码的配置文件（可选）

## 📝 部署后配置

### 1. 获取后端 URL

部署完成后，Zeabur 会为后端服务分配一个 URL，例如：
```
https://lmrouter-api.zeabur.app
```

### 2. 配置前端

如果前端和后端不在同一个域名下，需要：

**选项 A：重新部署前端（推荐）**
1. 在 Zeabur 中更新前端服务的环境变量
2. 设置 `API_BASE_URL` 为后端 URL
3. 重新部署前端

**选项 B：使用 nginx 配置**
前端的 nginx.conf 已经配置了代理规则，如果前后端在同一域名下，会自动代理。

### 3. 更新前端配置（如需要）

如果需要使用不同的后端 URL，可以修改 `web/src/api/client.ts`：

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/openai/v1'
```

## 🧪 测试部署

### 测试后端

```bash
# 检查健康状态
curl https://your-backend-url.zeabur.app/

# 获取模型列表
curl https://your-backend-url.zeabur.app/v1/models \
  -H "Authorization: Bearer sk-test-key-1"
```

### 测试前端

1. 访问前端 URL：`https://your-frontend-url.zeabur.app`
2. 检查页面是否正常加载
3. 测试聊天功能
4. 检查浏览器控制台是否有错误

## 🔧 故障排查

### 前端无法连接到后端

1. 检查前端的环境变量 `API_BASE_URL` 是否正确
2. 检查浏览器的 Network 标签，查看 API 请求是否成功
3. 确认后端服务正在运行

### CORS 错误

如果遇到 CORS 错误，需要在后端添加 CORS 配置。

### 路由问题

前端使用 React Router，确保 nginx 配置正确处理 SPA 路由。

## 📚 相关文档

- [Zeabur 官方文档](https://zeabur.com/docs)
- [LMRouter GitHub](https://github.com/LMRouter/lmrouter)
- [React Router 文档](https://reactrouter.com)
- [Vite 部署指南](https://vitejs.dev/guide/build.html)

## 🆘 获取帮助

如有问题，请：
1. 查看 Zeabur 部署日志
2. 检查浏览器控制台错误
3. 查看 LMRouter GitHub Issues
