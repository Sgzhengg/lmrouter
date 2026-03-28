# 构建阶段
FROM node:22-alpine AS builder
LABEL "language"="nodejs"
LABEL "framework"="react"

WORKDIR /app

# 升级 pnpm 到 v9
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建前端（支持构建时环境变量）
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm build

# Nginx 阶段 - 纯静态托管
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
