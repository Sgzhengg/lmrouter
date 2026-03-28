# ===========================
# 第一阶段：构建前端
# ===========================
FROM node:22-alpine AS builder

# 强制重新构建标记 - v2
LABEL build.version="diagnostic-v2"

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
RUN echo "=== Listing dist directory ===" && \
    ls -lah dist/ && \
    echo "=== Checking index.html ===" && \
    head -20 dist/index.html && \
    echo "=== Build verification complete ==="

# ===========================
# 第二阶段：Nginx 服务器
# ===========================
FROM nginx:alpine

# 删除默认配置和文件
RUN rm -rf /usr/share/nginx/html/* && \
    rm -f /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 设置正确的文件权限 - 确保所有用户可读
RUN chmod -R 755 /usr/share/nginx/html && \
    chmod 644 /usr/share/nginx/html/*.html && \
    chmod -R 644 /usr/share/nginx/html/assets/

# 验证文件已复制
RUN echo "=== Verifying copied files ===" && \
    ls -lah /usr/share/nginx/html/ && \
    echo "=== Checking permissions ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== Checking index.html content ===" && \
    head -20 /usr/share/nginx/html/index.html && \
    echo "=== File copy verification complete ==="

# 直接内联 nginx 配置
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # 确保可以访问所有文件
    autoindex off;

    # 启用 gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # API 代理 - Zeabur 内部服务
    location /openai/ {
        proxy_pass http://lmrouter-gires:3000/openai/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_buffering off;
    }

    location /v1/ {
        proxy_pass http://lmrouter-gires:3000/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_buffering off;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 验证配置文件
RUN echo "=== Verifying nginx config ===" && \
    cat /etc/nginx/conf.d/default.conf && \
    echo "=== Testing nginx config ===" && \
    nginx -t

# 确保 nginx 可以读取文件
RUN echo "=== Checking file ownership ===" && \
    ls -la /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
