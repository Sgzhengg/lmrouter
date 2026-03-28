# ===========================
# 第一阶段：构建前端
# ===========================
FROM node:22-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建前端
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm build

# 验证构建产物
RUN ls -la dist/ && echo "Build output verified"

# ===========================
# 第二阶段：Nginx 服务器
# ===========================
FROM nginx:alpine

# 删除默认的 nginx 配置和网站文件
RUN rm -rf /usr/share/nginx/html/* \
    && rm -f /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 验证文件已复制
RUN ls -la /usr/share/nginx/html/ \
    && ls -la /etc/nginx/conf.d/ \
    && cat /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
