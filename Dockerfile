FROM node:24-alpine
WORKDIR /app

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 启动应用 - 使用生产环境配置
CMD ["node", "dist/index.js", "config/config.prod.yaml"]
