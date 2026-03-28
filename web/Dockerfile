FROM node:22-alpine AS builder
LABEL "language"="nodejs"
LABEL "framework"="react"

WORKDIR /app

# 升级 pnpm 到 v9
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制根目录的依赖文件
COPY package.json pnpm-lock.yaml ./

# 复制 web 目录的依赖文件
COPY web/package.json web/pnpm-lock.yaml ./web/

# 安装根目录依赖
RUN pnpm install --frozen-lockfile

# 安装 web 目录依赖（确保 tsc 等工具被安装）
WORKDIR /app/web
RUN pnpm install --frozen-lockfile

# 修改 tsconfig.json 以支持构建
RUN cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,

    /* Path alias */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# 添加 vite-env.d.ts
RUN cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
EOF

# 复制 web 源代码
COPY web/ .

# 构建前端
RUN pnpm build

# Nginx 阶段
FROM nginx:alpine

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/web/dist /usr/share/nginx/html

# 创建 Nginx 配置
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理 - 使用环境变量
    location /openai/ {
        set $backend_url "${BACKEND_URL}";
        if ($backend_url = "") {
            set $backend_url "http://localhost:3000";
        }
        proxy_pass $backend_url;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /v1/ {
        set $backend_url "${BACKEND_URL}";
        if ($backend_url = "") {
            set $backend_url "http://localhost:3000";
        }
        proxy_pass $backend_url;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
