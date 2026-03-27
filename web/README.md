# LMRouter Web Console

LMRouter 的前端管理界面，用于测试和管理 LMRouter API 服务。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 访问 http://localhost:5173
```

### 生产构建

```bash
# 构建生产版本
pnpm run build

# 预览生产构建
pnpm run preview
```

## 📦 部署到 Zeabur

### 方法 1：通过 Zeabur 控制台

1. 登录 [Zeabur](https://zeabur.com)
2. 创建新项目或选择现有项目
3. 添加新服务
4. 连接 GitHub 仓库
5. 选择 `lmrouter/web` 目录
6. 配置环境变量：
   - `VITE_API_BASE_URL`: 后端服务的 URL（例如：`https://lmrouter-api.zeabur.app`）
7. 点击部署

### 方法 2：使用 Zeabur CLI

```bash
# 安装 Zeabur CLI
npm install -g zeabur

# 登录
zeabur login

# 部署
cd /path/to/lmrouter/web
zeabur deploy
```

## 🔧 配置

### 环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 的 URL | `https://lmrouter-api.zeabur.app` |

### 本地开发配置

本地开发时，前端通过 Vite 代理访问后端：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/openai': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/v1': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})
```

### 生产环境配置

生产环境通过 nginx 代理或直接连接后端：

```nginx
# nginx.conf
location /openai/ {
    proxy_pass ${API_BASE_URL}/openai/;
}

location /v1/ {
    proxy_pass ${API_BASE_URL}/v1/;
}
```

## 📁 项目结构

```
web/
├── src/
│   ├── api/              # API 客户端
│   ├── components/       # React 组件
│   ├── pages/           # 页面组件
│   ├── types/           # TypeScript 类型
│   ├── App.tsx          # 应用根组件
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── public/              # 静态资源
├── .env.example         # 环境变量示例
├── .env.production      # 生产环境变量
├── Dockerfile           # Docker 配置
├── nginx.conf           # Nginx 配置
├── package.json         # 依赖和脚本
├── vite.config.ts       # Vite 配置
├── tailwind.config.js   # Tailwind CSS 配置
└── zeabur.yaml          # Zeabur 配置
```

## 🎯 功能特性

- **聊天测试** - 选择模型进行实时对话测试
- **模型列表** - 查看所有可用模型，支持搜索
- **API 密钥管理** - 管理和查看 API 密钥
- **用量统计** - 查看调用统计和 Token 消耗图表

## 🛠️ 技术栈

- React 18
- TypeScript
- Tailwind CSS
- React Router v6
- Axios
- Recharts
- Vite

## 🔗 相关链接

- [LMRouter 主仓库](https://github.com/LMRouter/lmrouter)
- [Zeabur 文档](https://zeabur.com/docs)
- [Vite 文档](https://vitejs.dev)

## 📝 许可证

MIT License
