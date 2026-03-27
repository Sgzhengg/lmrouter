# LMRouter 前后端分离说明

## 📂 项目结构

LMRouter 现在分为两个独立的项目，可以分别部署：

```
lmrouter/                    # 🔵 后端项目（LMRouter API）
├── src/                     # 后端源代码
│   ├── routes/             # API 路由
│   ├── adapters/           # AI 模型适配器
│   ├── middlewares/        # 中间件
│   └── index.ts            # 入口文件
├── config/                  # 配置文件目录
│   └── config.yaml         # LMRouter 配置
├── package.json            # 后端依赖
├── zeabur.yaml            # ⭐ Zeabur 后端配置
├── Dockerfile             # Docker 配置（可选）
└── DEPLOYMENT.md          # 部署指南

lmrouter/web/               # 🟢 前端项目（Web Console）
├── src/                   # 前端源代码
│   ├── api/              # API 客户端
│   ├── components/       # React 组件
│   ├── pages/           # 页面组件
│   ├── types/           # TypeScript 类型
│   ├── App.tsx          # 应用根组件
│   └── main.tsx         # 应用入口
├── package.json          # 前端依赖
├── Dockerfile           # ⭐ Docker 配置
├── nginx.conf           # ⭐ Nginx 配置
├── zeabur.yaml          # ⭐ Zeabur 前端配置
└── README.md            # 前端文档
```

## 🔵 后端：LMRouter API

**位置：** `E:\lmrouter\`

**功能：**
- 提供 AI 模型路由服务
- 支持多种 AI 提供商（OpenAI、Anthropic、Google 等）
- 处理认证、用量统计等

**技术栈：**
- Node.js + TypeScript
- Hono 框架
- 运行在端口 3000

**启动命令：**
```bash
cd E:\lmrouter
pnpm install
pnpm run dev     # 开发模式
pnpm run start   # 生产模式
```

**部署配置：**
- 配置文件：`zeabur.yaml`
- 默认端口：3000
- 环境变量：`NODE_ENV`、`PORT`

## 🟢 前端：Web Console

**位置：** `E:\lmrouter\web\`

**功能：**
- 模型列表展示
- 聊天测试界面
- API 密钥管理
- 用量统计图表

**技术栈：**
- React 18 + TypeScript
- Tailwind CSS
- React Router v6
- Vite

**启动命令：**
```bash
cd E:\lmrouter\web
pnpm install
pnpm run dev     # 开发模式（端口 5173）
pnpm run build   # 构建生产版本
```

**部署配置：**
- 配置文件：`web/zeabur.yaml`
- Docker 配置：`web/Dockerfile`
- Nginx 配置：`web/nginx.conf`

## 🔄 通信方式

### 开发环境

前端通过 **Vite 代理** 访问后端：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/openai': 'http://127.0.0.1:3000',
    '/v1': 'http://127.0.0.1:3000',
  }
}
```

### 生产环境

前端通过 **Nginx 代理** 或 **直接连接** 后端：

**选项 1：Nginx 代理（推荐）**
```nginx
location /openai/ {
    proxy_pass ${API_BASE_URL}/openai/;
}
```

**选项 2：直接连接**
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL
```

## 🚀 部署到 Zeabur

### 1. 准备工作

确保代码已推送到 GitHub 仓库。

### 2. 部署后端

1. 登录 [Zeabur](https://zeabur.com)
2. 创建新项目
3. 添加服务 → 选择 GitHub 仓库
4. 选择 `lmrouter` 目录（后端）
5. 部署

### 3. 部署前端

1. 在同一项目中添加新服务
2. 选择 `lmrouter/web` 目录（前端）
3. 配置环境变量：
   ```
   VITE_API_BASE_URL=https://your-backend-url.zeabur.app
   ```
4. 部署

### 4. 测试

- 访问前端 URL
- 测试聊天功能
- 检查模型列表

## 📝 配置文件说明

### 后端配置

**zeabur.yaml：**
```yaml
name: lmrouter-api
services:
  - type: web
    name: api
    runtime: node
    buildCommand: pnpm install && pnpm run build
    startCommand: pnpm run start
    ports:
      - port: 3000
```

### 前端配置

**zeabur.yaml：**
```yaml
name: lmrouter-web
services:
  - type: web
    name: frontend
    runtime: docker
    dockerContext: .
    dockerfilePath: Dockerfile
    ports:
      - port: 80
```

**Dockerfile：**
```dockerfile
# 多阶段构建
FROM node:20-alpine AS builder
# ... 构建步骤

FROM nginx:alpine
# ... 运行时配置
```

## 🔗 相关文档

- [完整部署指南](./DEPLOYMENT.md)
- [前端文档](./web/README.md)
- [Zeabur 官方文档](https://zeabur.com/docs)

## 🆘 常见问题

**Q: 前端无法连接后端？**
A: 检查 `VITE_API_BASE_URL` 环境变量是否正确设置。

**Q: 部署后路由 404？**
A: 确保 nginx 配置了 SPA 路由支持（`try_files $uri /index.html`）。

**Q: CORS 错误？**
A: 确保后端配置了正确的 CORS，或使用 nginx 代理。
