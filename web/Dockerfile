# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm@8

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 设置环境变量并构建
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm run build

# 生产阶段
FROM nginx:alpine

# 安装 envsubst 用于环境变量替换
RUN apk add --no-cache gettext

# 复制构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置模板
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

# 使用 envsubst 替换环境变量并启动 nginx
CMD sh -c "envsubst '$$VITE_API_BASE_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"

