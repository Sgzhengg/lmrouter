# ===========================
# 第一阶段：构建前端
# ===========================
FROM node:22-alpine AS frontend-builder

WORKDIR /web

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制前端依赖文件
COPY web/package.json web/pnpm-lock.yaml ./

# 安装前端依赖
RUN pnpm install --frozen-lockfile

# 复制前端源代码
COPY web/ ./

# 构建前端
RUN pnpm build

# 验证前端构建产物
RUN echo "=== Frontend build complete ===" && \
    ls -lah dist/ && \
    echo "=== index.html exists ===" && \
    test -f dist/index.html && echo "✓ Frontend built successfully"

# ===========================
# 第二阶段：构建后端
# ===========================
FROM node:22-alpine AS backend-builder

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制后端依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装后端依赖
RUN pnpm install --frozen-lockfile

# 复制后端源代码
COPY src/ ./src/
COPY tsconfig.json ./

# 编译后端
RUN pnpm build

# ===========================
# 第三阶段：最终镜像
# ===========================
FROM node:22-alpine

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制后端依赖和构建产物
COPY package.json pnpm-lock.yaml ./
COPY --from=backend-builder /app/dist ./dist/
COPY --from=backend-builder /app/node_modules ./node_modules/

# 复制前端构建产物
COPY --from=frontend-builder /web/dist ./web/dist/

# 复制配置文件
COPY config/ ./config/

# 验证文件结构
RUN echo "=== Verifying integrated build ===" && \
    echo "Backend files:" && \
    ls -la dist/ && \
    echo "" && \
    echo "Frontend files:" && \
    ls -la web/dist/ && \
    echo "" && \
    echo "Config files:" && \
    ls -la config/ && \
    echo "" && \
    echo "✓ Integrated build complete"

# 暴露端口
EXPOSE 3000

# 启动后端服务（会自动提供前端静态文件）
CMD ["node", "dist/index.js", "config/config.prod.yaml"]
