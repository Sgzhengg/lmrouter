#!/bin/bash
# LMRouter 启动脚本

echo "=== 启动 LMRouter 后端服务 ==="
echo "端口: 3002"
echo ""

cd /e/lmrouter

# 启动后端服务
echo "正在启动后端服务..."
npm run dev

# 如果上面的命令失败，尝试直接使用tsx
# npx tsx src/app.ts
