#!/bin/sh
set -e

# 如果未设置 API_BASE_URL，使用默认值
: "${VITE_API_BASE_URL:=http://localhost:3000}"

# 使用 envsubst 替换环境变量生成最终配置
# 只替换 VITE_API_BASE_URL 变量，避免影响 nginx 其他变量
envsubst '$VITE_API_BASE_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# 启动 nginx
exec nginx -g 'daemon off;'
