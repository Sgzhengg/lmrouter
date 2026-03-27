# LMRouter 部署检查清单

在部署到 Zeabur 之前，请确认以下项目：

## 🔵 后端检查清单

### 代码准备
- [ ] 代码已推送到 GitHub
- [ ] `package.json` 包含正确的启动脚本
- [ ] `zeabur.yaml` 配置文件存在
- [ ] 配置文件（`config/config.yaml`）正确设置

### 环境变量
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] 其他必需的环境变量（如数据库连接、API 密钥等）

### 测试
- [ ] 本地运行 `pnpm run start` 成功
- [ ] API 端点正常响应
- [ ] 健康检查端点可访问

## 🟢 前端检查清单

### 代码准备
- [ ] 代码已推送到 GitHub
- [ ] `package.json` 包含构建脚本
- [ ] `zeabur.yaml` 配置文件存在
- [ ] `Dockerfile` 存在且正确
- [ ] `nginx.conf` 配置正确

### 环境变量
- [ ] `VITE_API_BASE_URL` 设置为后端 URL
- [ ] 其他必需的环境变量

### 测试
- [ ] 本地运行 `pnpm run build` 成功
- [ ] `pnpm run preview` 可正常访问
- [ ] API 调用正常工作

## 🔗 集成测试

### 部署后验证
- [ ] 后端服务正常启动
- [ ] 前端服务正常启动
- [ ] 前端可以访问后端 API
- [ ] 聊天功能正常工作
- [ ] 模型列表正常显示
- [ ] 路由功能正常

### 功能测试
- [ ] 登录/认证（如启用）
- [ ] API 密钥管理
- [ ] 用量统计
- [ ] 错误处理

## 📝 部署步骤

### 1. 准备 GitHub 仓库
```bash
git add .
git commit -m "准备部署到 Zeabur"
git push origin main
```

### 2. 在 Zeabur 创建项目
1. 登录 https://zeabur.com
2. 点击 "New Project"
3. 选择 "Deploy from GitHub"
4. 授权 GitHub 访问

### 3. 部署后端
1. 点击 "Add Service"
2. 选择 "Git"
3. 选择你的仓库
4. Root Path 设置为 `/`（后端根目录）
5. 配置环境变量
6. 点击 "Deploy"

### 4. 部署前端
1. 在同一项目中点击 "Add Service"
2. 选择 "Git"
3. 选择你的仓库
4. Root Path 设置为 `/web`（前端目录）
5. 配置环境变量：
   - `VITE_API_BASE_URL`: 复制后端服务的 URL
6. 点击 "Deploy"

### 5. 验证部署
1. 等待两个服务都部署完成
2. 点击前端服务的 URL
3. 测试各项功能
4. 检查日志是否有错误

## 🚨 常见问题

### 后端无法启动
- 检查日志：查看 Zeabur 的构建和运行日志
- 检查端口：确保 PORT 环境变量正确
- 检查依赖：确保 `pnpm install` 成功

### 前端无法连接后端
- 检查 `VITE_API_BASE_URL` 是否正确
- 检查后端 CORS 配置
- 检查网络连接

### 路由 404
- 确保 nginx 配置了 `try_files $uri /index.html`
- 检查 React Router 配置

### 构建失败
- 检查依赖是否完整
- 检查 TypeScript 错误
- 查看构建日志

## ✅ 部署成功标志

- 后端服务状态：Running（绿色）
- 前端服务状态：Running（绿色）
- 访问前端 URL 可以看到页面
- 聊天功能可以发送消息
- 模型列表正常显示
- 浏览器控制台无错误

## 📞 获取帮助

- [Zeabur 文档](https://zeabur.com/docs)
- [Zeabur Discord](https://discord.gg/zeabur)
- [LMRouter GitHub Issues](https://github.com/LMRouter/lmrouter/issues)
