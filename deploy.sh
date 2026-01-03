#!/bin/bash
# 太初星集电子签章系统 - 部署脚本
# 用于将应用部署到华为云服务器

set -e

# ==================== 配置信息 ====================
REMOTE_HOST="60.10.240.4"
REMOTE_PORT="25813"
REMOTE_USER="root"
SSH_KEY="/Users/cx/Documents/huaweikey/KeyPair-4bd7.pem"
REMOTE_DIR="/opt/apps/tc-seal"
LOCAL_DIR="/Users/cx/Documents/code/java/tc-qianming"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  太初星集电子签章系统 - 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ==================== 函数定义 ====================

# SSH 执行远程命令
remote_exec() {
    ssh -i "$SSH_KEY" -p "$REMOTE_PORT" -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "$1"
}

# SCP 复制文件到远程
remote_copy() {
    scp -i "$SSH_KEY" -P "$REMOTE_PORT" -o StrictHostKeyChecking=no -r "$1" "$REMOTE_USER@$REMOTE_HOST:$2"
}

# ==================== 步骤 1: 准备远程目录 ====================
echo -e "${YELLOW}[1/5] 准备远程目录...${NC}"
remote_exec "mkdir -p $REMOTE_DIR"
echo -e "${GREEN}✓ 远程目录已创建${NC}"

# ==================== 步骤 2: 同步代码 ====================
echo -e "${YELLOW}[2/5] 同步代码到服务器...${NC}"

# 复制后端代码
echo "  复制后端代码..."
remote_copy "$LOCAL_DIR/backend/src" "$REMOTE_DIR/backend/"
remote_copy "$LOCAL_DIR/backend/pom.xml" "$REMOTE_DIR/backend/"
remote_copy "$LOCAL_DIR/backend/Dockerfile" "$REMOTE_DIR/backend/"

# 复制前端代码
echo "  复制前端代码..."
remote_copy "$LOCAL_DIR/frontend/src" "$REMOTE_DIR/frontend/"
remote_copy "$LOCAL_DIR/frontend/public" "$REMOTE_DIR/frontend/"
remote_copy "$LOCAL_DIR/frontend/package.json" "$REMOTE_DIR/frontend/"
remote_copy "$LOCAL_DIR/frontend/package-lock.json" "$REMOTE_DIR/frontend/"
remote_copy "$LOCAL_DIR/frontend/next.config.mjs" "$REMOTE_DIR/frontend/"
remote_copy "$LOCAL_DIR/frontend/tsconfig.json" "$REMOTE_DIR/frontend/"
remote_copy "$LOCAL_DIR/frontend/tailwind.config.ts" "$REMOTE_DIR/frontend/"
remote_copy "$LOCAL_DIR/frontend/postcss.config.mjs" "$REMOTE_DIR/frontend/"
remote_copy "$LOCAL_DIR/frontend/Dockerfile" "$REMOTE_DIR/frontend/"
remote_copy "$LOCAL_DIR/frontend/components.json" "$REMOTE_DIR/frontend/"

# 复制 Docker Compose
remote_copy "$LOCAL_DIR/docker-compose.yml" "$REMOTE_DIR/"

echo -e "${GREEN}✓ 代码同步完成${NC}"

# ==================== 步骤 3: 构建 Docker 镜像 ====================
echo -e "${YELLOW}[3/5] 构建 Docker 镜像...${NC}"
remote_exec "cd $REMOTE_DIR && docker compose build --no-cache"
echo -e "${GREEN}✓ Docker 镜像构建完成${NC}"

# ==================== 步骤 4: 启动服务 ====================
echo -e "${YELLOW}[4/5] 启动服务...${NC}"
remote_exec "cd $REMOTE_DIR && docker compose up -d"
echo -e "${GREEN}✓ 服务已启动${NC}"

# ==================== 步骤 5: 检查服务状态 ====================
echo -e "${YELLOW}[5/5] 检查服务状态...${NC}"
sleep 10
remote_exec "cd $REMOTE_DIR && docker compose ps"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "前端地址: ${YELLOW}http://$REMOTE_HOST:3000${NC}"
echo -e "后端地址: ${YELLOW}http://$REMOTE_HOST:8099${NC}"
echo -e "API 文档: ${YELLOW}http://$REMOTE_HOST:8099/swagger-ui.html${NC}"
echo ""
echo -e "查看日志: ${YELLOW}ssh -i \"$SSH_KEY\" -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST \"cd $REMOTE_DIR && docker compose logs -f\"${NC}"
